'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/firebase';
import { Attempt } from '@/lib/firestore.service';
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
import { useAuth } from '@/hooks/use-auth';
import MathText from '@/components/math-text';

// Check if two arrays are equal regardless of order
const arraysAreEqual = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) return false;
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
};

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId || !user) {
        if (!authLoading) {
            setLoading(false);
        }
        return;
    };

    const fetchAttempt = async () => {
      setLoading(true);
      setError(null);
      const attemptDocRef = doc(db, 'attempts', attemptId as string);
      try {
        const docSnap = await getDoc(attemptDocRef);
        if (docSnap.exists()) {
          const attemptData = { id: docSnap.id, ...docSnap.data() } as Attempt;
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
  }, [attemptId, user, authLoading]);

  if (loading || authLoading) {
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
  
  const getResultIcon = (detail: Attempt['details'][string]) => {
      const isCorrect = arraysAreEqual(detail.selected, detail.correct);
      if(isCorrect) return <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />;
      if(detail.selected.length === 0) return <HelpCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />;
      return <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />;
  }

  return (
    <AppLayout>
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Correction du quiz : {attempt.quizTitle}</CardTitle>
                    <CardDescription>
                        Résultats de votre tentative du {attempt.createdAt ? new Date(attempt.createdAt).toLocaleDateString('fr-FR') : ''}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 mb-6">
                        <div className='text-center sm:text-left'>
                            <p className="text-sm text-muted-foreground">Votre score</p>
                            <p className="text-3xl font-bold">
                                {attempt.correctCount}<span className='text-xl text-muted-foreground'>/{attempt.totalQuestions}</span>
                            </p>
                        </div>
                         <div className="w-full sm:w-auto flex-grow max-w-xs">
                             <Progress value={attempt.percentage} />
                             <p className="text-center text-sm text-muted-foreground mt-1">{attempt.percentage}% de réussite</p>
                         </div>
                    </div>

                    <div className="space-y-6">
                        {attempt.details && Object.entries(attempt.details).map(([index, detail]) => (
                            <div key={index}>
                                <div className="flex items-start gap-4">
                                     {getResultIcon(detail)}
                                    <div className="font-semibold flex-1 text-base">{parseInt(index) + 1}. <MathText text={detail.question} isBlock/></div>
                                </div>
                                <div className="pl-9 mt-4 space-y-3 text-sm">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-muted-foreground font-medium">Votre réponse:</span>
                                        {detail.selected.length > 0 ? (
                                          detail.selected.map((s, i) => <Badge key={i} variant={detail.correct.includes(s) ? "default" : "destructive"}><MathText text={s}/></Badge>)
                                        ) : (
                                          <Badge variant="outline">Non répondu</Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-muted-foreground font-medium">Bonne(s) réponse(s):</span>
                                        {detail.correct.map((c, i) => <Badge key={i} variant="default"><MathText text={c}/></Badge>)}
                                    </div>
                                    {detail.explanation && (
                                        <Alert className="mt-2">
                                            <AlertTitle className="text-sm font-semibold">Explication</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                <MathText text={detail.explanation} />
                                            </AlertDescription>
                                        </Alert>
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
