'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, Star, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Quiz, subscribeToQuizzes } from '@/lib/firestore.service';

export default function QuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        try {
            const unsubscribe = subscribeToQuizzes((quizList) => {
                setQuizzes(quizList);
                setLoading(false);
                setError(null);
            });
            return () => unsubscribe();
        } catch (err) {
            setLoading(false);
            setError("Erreur de chargement des quiz.");
        }
    }, []);

    const handleQuizClick = (quiz: Quiz) => {
        if (quiz.access_type === 'premium' && profile?.subscription_type !== 'premium') {
            router.push('/premium');
        } else {
            router.push(`/quiz/${quiz.id}`);
        }
    };
    
    if (loading || authLoading) {
      return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Liste des Quiz</h1>
                <p className="text-muted-foreground">Testez vos connaissances avec notre collection de quiz.</p>
            </div>
             <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </AppLayout>
      )
    }

    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Liste des Quiz</h1>
                <p className="text-muted-foreground">
                    Testez vos connaissances avec notre collection de quiz.
                </p>
            </div>

            {error && (
                 <Alert variant="destructive" className="my-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de chargement</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.length > 0 && quizzes.map((quiz) => {
                    const isPremium = quiz.access_type === 'premium';
                    const hasAccess = !isPremium || profile?.subscription_type === 'premium';
                    const isMock = quiz.isMockExam;

                    return (
                        <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-3 rounded-full ${isMock ? 'bg-red-100' : 'bg-primary/10'}`}>
                                      <BookOpen className={`h-8 w-8 ${isMock ? 'text-red-500' : 'text-primary'}`} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {isPremium && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                                        {isMock && <Badge variant="destructive">Concours Blanc</Badge>}
                                    </div>
                                </div>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>{quiz.description}</CardDescription>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 pt-2">
                                    <span>{quiz.total_questions} questions</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {quiz.duration_minutes} min</span>
                                    <span>{quiz.difficulty}</span>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleQuizClick(quiz)}>
                                    {hasAccess ? 'Commencer le Quiz' : 'Devenir Premium'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

             {!loading && quizzes.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center border-dashed">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Aucun quiz disponible</CardTitle>
                            <CardDescription>
                                La liste des quiz est vide pour le moment. Revenez bientôt !
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
