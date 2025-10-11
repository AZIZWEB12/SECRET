'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/firebase';
import { Quiz, QuizAttempt, QuizQuestionData } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Loader2, Send, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';

export default function TakeQuizPage() {
  const { id: quizId } = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // { questionIndex: optionLabel }
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [attemptId, setAttemptId] = useState<string|null>(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      setLoading(true);
      const quizDocRef = doc(db, 'quizzes', quizId as string);
      try {
        const docSnap = await getDoc(quizDocRef);
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() } as Quiz;
          if (quizData.premiumOnly && !profile?.isPremium) {
            setError("Ce quiz est réservé aux membres Premium.");
          } else {
            setQuiz(quizData);
          }
        } else {
          setError("Ce quiz n'existe pas.");
        }
      } catch (err) {
        setError('Erreur de chargement du quiz.');
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: quizDocRef.path,
          operation: 'get'
        }))
      } finally {
        setLoading(false);
      }
    };

    // We wait for profile to be loaded to check for premium status
    if (profile !== undefined) {
        fetchQuiz();
    }
  }, [quizId, profile]);

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerSelect = (optionLabel: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionLabel,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correctCount = 0;
    const attemptDetails: QuizAttempt['details'] = {};

    quiz.questions.forEach((q, index) => {
      const selectedOptLabel = selectedAnswers[index];
      const correctOpt = q.options.find(opt => opt.is_correct);
      
      if (selectedOptLabel && correctOpt && selectedOptLabel === correctOpt.label) {
        correctCount++;
      }
      
      attemptDetails[index] = {
        question: q.question,
        selected: selectedOptLabel ? [selectedOptLabel] : [],
        correct: q.options.filter(o => o.is_correct).map(o => o.label),
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    setFinalScore(score);

    try {
        const attemptData: Omit<QuizAttempt, 'id'> = {
            userId: user.uid,
            quizId: quiz.id,
            quizTitle: quiz.title,
            totalQuestions: quiz.questions.length,
            correctCount,
            score,
            details: attemptDetails,
            createdAt: serverTimestamp() as any,
        }
        const docRef = await addDoc(collection(db, 'quizAttempts'), attemptData);
        setAttemptId(docRef.id);
    } catch(err) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'quizAttempts',
            operation: 'create',
        }));
    }
    
    setQuizFinished(true);
  };
  
  if (loading) {
    return <AppLayout><Skeleton className="h-96 w-full" /></AppLayout>;
  }

  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  if (!quiz) {
    return null; // Should not happen if error is handled
  }
  
  if (quizFinished) {
    return (
        <AppLayout>
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Résultats du Quiz</CardTitle>
                    <CardDescription>{quiz.title}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-6xl font-bold">{finalScore}%</p>
                    <p className="text-muted-foreground mt-2">
                        Vous avez répondu correctement à {finalScore / 100 * quiz.questions.length} sur {quiz.questions.length} questions.
                    </p>
                    {finalScore >= 50 ? (
                        <p className="mt-4 text-green-600">Félicitations ! Excellent travail.</p>
                    ): (
                        <p className="mt-4 text-orange-600">Continuez vos efforts, vous allez y arriver !</p>
                    )}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                     {attemptId && (
                        <Button asChild>
                            <Link href={`/quiz/results/${attemptId}`}>
                                Voir la correction détaillée
                            </Link>
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href="/quiz">Retour à la liste des quiz</Link>
                    </Button>
                </CardFooter>
            </Card>
        </AppLayout>
    )
  }

  const currentQuestion: QuizQuestionData = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <AppLayout>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          <CardDescription>
            Question {currentQuestionIndex + 1} sur {quiz.questions.length}
          </CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <p className="font-semibold text-lg mb-6">{currentQuestion.question}</p>
          <RadioGroup 
            value={selectedAnswers[currentQuestionIndex]}
            onValueChange={handleAnswerSelect}
            className="space-y-4"
          >
            {currentQuestion.options.map((option) => (
              <Label key={option.label} className="flex items-center gap-4 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-colors cursor-pointer">
                <RadioGroupItem value={option.label} id={`${currentQuestionIndex}-${option.label}`} />
                <span>{option.text}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={!selectedAnswers[currentQuestionIndex]}>
              <Send className="mr-2 h-4 w-4" /> Terminer
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!selectedAnswers[currentQuestionIndex]}>
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </AppLayout>
  );
}
