'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

export default function QuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    useEffect(() => {
        const quizzesCollectionRef = collection(db, 'quizzes');
        const q = query(quizzesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const quizList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
                setQuizzes(quizList);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setLoading(false);
                setError("Erreur de chargement des quiz. Vérifiez vos permissions.");
                const permissionError = new FirestorePermissionError({
                    path: 'quizzes',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        return () => unsubscribe();
    }, []);

    const canAccess = (quiz: Quiz) => {
        if (!quiz.premiumOnly) return true;
        return profile?.isPremium;
    };

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
                {loading && [...Array(3)].map((_, i) => (
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

                {!loading && quizzes.length > 0 && quizzes.map((quiz) => (
                    <Card key={quiz.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex-grow">
                             <div className="flex justify-between items-center mb-2">
                                <BookOpen className="h-8 w-8 text-primary" />
                                {quiz.premiumOnly && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                            </div>
                            <CardTitle>{quiz.title}</CardTitle>
                            <CardDescription>Difficulté : {quiz.difficulty}</CardDescription>
                        </CardHeader>
                        <CardFooter>
                             <Button asChild className="w-full" disabled={!canAccess(quiz)}>
                                <Link href={canAccess(quiz) ? `/quiz/${quiz.id}` : '/premium'}>
                                    {canAccess(quiz) ? 'Commencer le Quiz' : 'Devenir Premium'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
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
