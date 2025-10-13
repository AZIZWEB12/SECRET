'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { db } from '@/lib/firebase';
import { Quiz, QuizAttempt, QuizQuestionData } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2, Send, Clock, ShieldAlert } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Link from 'next/link';
import { BlockMath, InlineMath } from 'react-katex';

export default function TakeQuizPage() {
  const { id: quizId } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [attemptId, setAttemptId] = useState<string|null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!quiz || !user || isSubmitting) return;

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    let correctAnswersCount = 0;
    const attemptDetails: QuizAttempt['details'] = {};

    quiz.questions.forEach((q, index) => {
      const selectedOpts = userAnswers[index] || [];
      const correctOpts = q.options.filter(opt => opt.is_correct).map(opt => opt.label);
      
      const isCorrect = correctOpts.length === selectedOpts.length && correctOpts.every(label => selectedOpts.includes(label));
      
      if (isCorrect) {
        correctAnswersCount++;
      }
      
      attemptDetails[index] = {
        question: q.question,
        selected: selectedOpts,
        correct: correctOpts,
        explanation: q.explanation,
      };
    });

    const score = Math.round((correctAnswersCount / quiz.questions.length) * 100);
    setFinalScore(score);
    setCorrectCount(correctAnswersCount);

    try {
        const attemptData: Omit<QuizAttempt, 'id'> = {
            userId: user.uid,
            quizId: quiz.id,
            quizTitle: quiz.title,
            totalQuestions: quiz.questions.length,
            correctCount: correctAnswersCount,
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
    setIsSubmitting(false);
  }, [quiz, user, userAnswers, isSubmitting]);


  useEffect(() => {
    if (!quizId) return;

    const fetchQuiz = async () => {
      setLoading(true);
      const quizDocRef = doc(db, 'quizzes', quizId as string);
      try {
        const docSnap = await getDoc(quizDocRef);
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() } as Quiz;
          setQuiz(quizData);
          setUserAnswers(Array(quizData.questions.length).fill([]));
          if (quizData.durationMinutes) {
            setTimeLeft(quizData.durationMinutes * 60);
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

    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft === null || quizFinished) return;

    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => (prev ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, quizFinished, handleSubmit]);


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

  const handleAnswerChange = (optionLabel: string) => {
    const newAnswers = [...userAnswers];
    const currentAnswers = newAnswers[currentQuestionIndex] || [];
    
    const updatedAnswers = currentAnswers.includes(optionLabel)
      ? currentAnswers.filter(label => label !== optionLabel)
      : [...currentAnswers, optionLabel];
      
    newAnswers[currentQuestionIndex] = updatedAnswers;
    setUserAnswers(newAnswers);
  };
  
  if (authLoading) {
    return <AppLayout><div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  }

  if (loading) {
    return <AppLayout><div className="flex justify-center items-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div></AppLayout>;
  }
  
  if (error) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
           <Button asChild variant="outline" className="mt-4"><Link href="/quiz">Retour aux quiz</Link></Button>
        </Alert>
      </AppLayout>
    );
  }

  if (!quiz) {
    return <AppLayout><div className="text-center">Quiz introuvable.</div></AppLayout>;
  }

  // Check premium access after both quiz and profile have loaded
  if (quiz.premiumOnly && !profile?.isPremium) {
     return (
      <AppLayout>
        <Alert variant="destructive" className="max-w-md mx-auto text-center">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Accès Premium Requis</AlertTitle>
          <AlertDescription>
            Ce quiz est réservé aux membres Premium.
          </AlertDescription>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild><Link href="/premium">Devenir Premium</Link></Button>
            <Button asChild variant="outline"><Link href="/quiz">Retour aux quiz</Link></Button>
          </div>
        </Alert>
      </AppLayout>
    );
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
                    <p className="text-6xl font-bold">
                        {correctCount}<span className="text-4xl text-muted-foreground">/{quiz.questions.length}</span>
                    </p>
                    <p className="text-muted-foreground mt-2">
                        Bonnes réponses
                    </p>
                    {finalScore >= 50 ? (
                        <div className="mt-4 text-green-600">Félicitations ! Excellent travail.</div>
                    ): (
                        <div className="mt-4 text-orange-600">Continuez vos efforts, vous allez y arriver !</div>
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
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <AppLayout>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <CardDescription>
                    Question {currentQuestionIndex + 1} sur {quiz.questions.length}
                </CardDescription>
            </div>
            {timeLeft !== null && (
                <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                    <Clock className="h-5 w-5" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="font-semibold text-lg mb-6">
            <BlockMath math={currentQuestion.question}/>
          </div>
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <div key={option.label} className="flex items-center space-x-3 p-3 rounded-lg border has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                <Checkbox 
                  id={`${currentQuestionIndex}-${option.label}`}
                  checked={userAnswers[currentQuestionIndex]?.includes(option.label)}
                  onCheckedChange={() => handleAnswerChange(option.label)}
                />
                <Label htmlFor={`${currentQuestionIndex}-${option.label}`} className="font-medium flex-1 cursor-pointer">
                  <InlineMath math={option.text} />
                </Label>
              </div>
            ))}
          </div>
            <div className="text-xs text-muted-foreground text-center mt-4">
              Cette question peut avoir une ou plusieurs bonnes réponses.
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0 || isSubmitting}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Précédent
          </Button>
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={(userAnswers[currentQuestionIndex] || []).length === 0 || isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Terminer
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={(userAnswers[currentQuestionIndex] || []).length === 0 || isSubmitting}>
              Suivant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </AppLayout>
  );
}

    