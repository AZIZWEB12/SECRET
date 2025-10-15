
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, Star, Clock, Calendar, AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Quiz, subscribeToQuizzes, parseFirestoreDate } from '@/lib/firestore.service';
import { format, isFuture, isPast, differenceInSeconds } from 'date-fns';
import { fr } from 'date-fns/locale';

function Countdown({ to }: { to: Date }) {
    const [timeLeft, setTimeLeft] = useState(differenceInSeconds(to, new Date()));

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const days = Math.floor(timeLeft / (24 * 3600));
    const hours = Math.floor((timeLeft % (24 * 3600)) / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return (
        <div className='text-center text-primary font-bold'>
            Démarre dans : {days > 0 && `${days}j `}{`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
        </div>
    );
}

export default function ConcoursPage() {
    const [mockExams, setMockExams] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToQuizzes((quizList) => {
            const mockExamsOnly = quizList.filter(q => q.isMockExam);
            setMockExams(mockExamsOnly);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching quizzes:", err);
            setError("Erreur de chargement des concours.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleQuizClick = (quiz: Quiz) => {
        if (!quiz.scheduledFor || isPast(parseFirestoreDate(quiz.scheduledFor))) {
             // Allow access if no schedule or if it's in the past (for review)
             // This might need adjustment based on business logic. For now, let's just go.
        }
        if (quiz.access_type === 'premium' && profile?.subscription_type.type !== 'premium') {
            router.push('/premium');
        } else {
            router.push(`/quiz/${quiz.id}`);
        }
    };
    
    if (loading || authLoading) {
      return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Concours Blancs</h1>
                <p className="text-muted-foreground">Préparez-vous en conditions réelles d'examen.</p>
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Concours Blancs</h1>
                <p className="text-muted-foreground">
                    Préparez-vous en conditions réelles d'examen avec nos concours blancs chronométrés.
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
                {mockExams.length > 0 && mockExams.map((quiz) => {
                    const isPremium = quiz.access_type === 'premium';
                    const hasAccess = !isPremium || profile?.subscription_type.type === 'premium';
                    const scheduledDate = quiz.scheduledFor ? parseFirestoreDate(quiz.scheduledFor) : null;
                    const isUpcoming = scheduledDate && isFuture(scheduledDate);
                    const isOver = scheduledDate && isPast(scheduledDate);

                    return (
                        <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="p-3 rounded-full bg-red-100">
                                      <Calendar className="h-8 w-8 text-red-500" />
                                    </div>
                                    {isPremium && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                                </div>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>{quiz.description}</CardDescription>
                                <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 pt-2">
                                    <span>{quiz.total_questions} questions</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {quiz.duration_minutes} min</span>
                                    <span>{quiz.difficulty}</span>
                                </div>
                                {scheduledDate && (
                                     <div className="text-sm font-semibold text-center text-primary border-t border-b py-2 mt-4">
                                        Programmé pour le {format(scheduledDate, 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                    </div>
                                )}
                            </CardHeader>
                            <CardFooter className='flex-col items-stretch gap-2'>
                                {isUpcoming && scheduledDate && (
                                    <Countdown to={scheduledDate} />
                                )}
                                <Button className="w-full" onClick={() => handleQuizClick(quiz)} disabled={isUpcoming || !hasAccess}>
                                    {isUpcoming ? 'Bientôt disponible' : (isOver ? 'Voir les résultats' : 'Commencer le concours')}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

             {!loading && mockExams.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center border-dashed">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <Calendar className="h-8 w-8 text-red-500" />
                            </div>
                            <CardTitle>Aucun concours blanc programmé</CardTitle>
                            <CardDescription>
                                Revenez bientôt pour les prochaines dates de concours.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
