'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/firebase';
import { QuizAttempt } from '@/lib/types';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId || !user) return;

    const fetchAttempt = async () => {
      setLoading(true);
      const attemptDocRef = doc(db, 'quizAttempts', attemptId as string);
      try {
        const docSnap = await getDoc(attemptDocRef);
        if (docSnap.exists()) {
          const attemptData = { id: docSnap.id, ...docSnap.data() } as QuizAttempt;
          // Security check: ensure the user owns this attempt
          if (attemptData.userId !== user.uid) {
            setError("Vous n'êtes pas autorisé à voir ces résultats.");
          } else {
            setAttempt(attemptData);
          }
        } else {
          setError("Cette tentative de quiz n'existe pas.");
        }
      } catch (err) {
        setError('Erreur de chargement des résultats.');
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: attemptDocRef.path,
          operation: 'get'
        }))
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId, user]);

  if (loading) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="max-w-4xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (!attempt) {
    return null;
  }

  const getResultIcon = (detail: QuizAttempt['details'][string]) => {
      const isCorrect = JSON.stringify(detail.selected.sort()) === JSON.stringify(detail.correct.sort());
      if(isCorrect) return <CheckCircle className="h-5 w-5 text-green-500" />;
      if(detail.selected.length === 0) return <HelpCircle className="h-5 w-5 text-yellow-500" />;
      return <XCircle className="h-5 w-5 text-red-500" />;
  }

  return (
    <AppLayout>
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Correction du quiz : {attempt.quizTitle}</CardTitle>
                    <CardDescription>
                        Résultats de votre tentative du {new Date(attempt.createdAt.toDate()).toLocaleDateString('fr-FR')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 mb-6">
                        <div className='text-center sm:text-left'>
                            <p className="text-sm text-muted-foreground">Votre score</p>
                            <p className="text-3xl font-bold">{attempt.score}%</p>
                        </div>
                         <div className="w-full sm:w-auto flex-grow max-w-xs">
                             <Progress value={attempt.score} />
                             <p className="text-center text-sm text-muted-foreground mt-1">{attempt.correctCount} / {attempt.totalQuestions} correctes</p>
                         </div>
                    </div>

                    <div className="space-y-6">
                        {Object.entries(attempt.details).map(([index, detail]) => (
                            <div key={index}>
                                <div className="flex items-start gap-4">
                                     {getResultIcon(detail)}
                                    <h4 className="font-semibold flex-1">{parseInt(index) + 1}. {detail.question}</h4>
                                </div>
                                <div className="pl-9 mt-2 space-y-2 text-sm">
                                    <p>Votre réponse: <Badge variant="outline">{detail.selected.join(', ') || 'Non répondu'}</Badge></p>
                                    <p>Bonne(s) réponse(s): <Badge variant="default">{detail.correct.join(', ')}</Badge></p>
                                    {detail.explanation && (
                                        <p className="text-xs text-muted-foreground italic pt-2">
                                            <strong>Explication :</strong> {detail.explanation}
                                        </p>
                                    )}
                                </div>
                                <Separator className="mt-6" />
                            </div>
                        ))}
                    </div>

                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline">
                        <Link href="/quiz"><ArrowLeft className="mr-2 h-4 w-4" /> Retour aux quiz</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </AppLayout>
  );
}
