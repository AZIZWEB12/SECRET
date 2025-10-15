'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/firebase';
import { Attempt, Quiz, subscribeToQuizzes } from '@/lib/firestore.service';
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
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import MathText from '@/components/math-text';
import { cn } from '@/lib/utils';


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
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId || !user) {
        if (!authLoading) {
            setLoading(false);
        }
        return;
    };

    const fetchAttemptAndQuiz = async () => {
      setLoading(true);
      setError(null);
      const attemptDocRef = doc(db, 'attempts', attemptId as string);
      try {
        const docSnap = await getDoc(attemptDocRef);
        if (docSnap.exists()) {
          const attemptData = { id: docSnap.id, ...docSnap.data() } as Attempt;
          
          if (attemptData.userId !== user.uid) {
            setError("Vous n'êtes pas autorisé à voir ces résultats.");
            setLoading(false);
            return;
          }
          setAttempt(attemptData);

          const quizDocRef = doc(db, 'quizzes', attemptData.quizId);
          const quizSnap = await getDoc(quizDocRef);
          if (quizSnap.exists()) {
            setQuiz({ id: quizSnap.id, ...quizSnap.data() } as Quiz);
          } else {
             console.warn("Quiz not found for this attempt, some features might be degraded.");
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

    fetchAttemptAndQuiz();
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

                    <div className="space-y-8">
                        {quiz && attempt.details && Object.entries(attempt.details).map(([index, detail]) => {
                           const questionIndex = parseInt(index);
                           const questionData = quiz.questions[questionIndex];
                           const allOptions = questionData.options;
                           
                           return (
                            <div key={index}>
                                <div className="flex items-start gap-4">
                                     <span className="font-semibold text-lg text-primary">{questionIndex + 1}.</span>
                                    <div className="font-semibold flex-1 text-base"><MathText text={detail.question} isBlock/></div>
                                </div>
                                <div className="pl-9 mt-4 space-y-2 text-sm">
                                    {allOptions.map((option, i) => {
                                        const isSelected = detail.selected.includes(option);
                                        const isCorrect = detail.correct.includes(option);
                                        
                                        const isUserCorrectChoice = isSelected && isCorrect;
                                        const isUserIncorrectChoice = isSelected && !isCorrect;

                                        return (
                                            <div key={i} className={cn(
                                                "flex items-start gap-3 p-3 rounded-md border",
                                                isUserCorrectChoice && "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800", // User chose correctly
                                                isUserIncorrectChoice && "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800", // User chose incorrectly
                                                isCorrect && "border-green-400" // Always highlight the correct answer border
                                            )}>
                                                <div>
                                                  {isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : (isSelected ? <XCircle className="h-5 w-5 text-red-500" /> : <div className="h-5 w-5" />) }
                                                </div>
                                                <div className="flex-1">
                                                  <MathText text={option}/>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {detail.explanation && (
                                    <Alert className="mt-4 ml-9 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                                        <HelpCircle className="h-4 w-4 !text-blue-600" />
                                        <AlertTitle className="text-sm font-semibold text-blue-800 dark:text-blue-300">Explication</AlertTitle>
                                        <AlertDescription className="text-xs text-blue-700 dark:text-blue-200">
                                            <MathText text={detail.explanation} />
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <Separator className="mt-8" />
                            </div>
                           )
                        })}
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
