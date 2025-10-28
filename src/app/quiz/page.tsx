'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { BookOpen, Star, Clock, Brain, Globe, Sigma, Palette, Landmark, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Quiz, subscribeToQuizzes } from '@/lib/firestore.service';

interface Category {
  name: string;
  quizCount: number;
  premiumCount: number;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  'Culture Générale': Globe,
  'Droit Constitutionnel': Landmark,
  'Français - Grammaire': FileText,
  'Mathématiques': Sigma,
  'Art': Palette,
  'Logique': Brain,
  'default': BookOpen,
};

const categoryColors: { [key: string]: string } = {
  'Culture Générale': 'bg-blue-50 dark:bg-blue-900/30',
  'Droit Constitutionnel': 'bg-red-50 dark:bg-red-900/30',
  'Français - Grammaire': 'bg-green-50 dark:bg-green-900/30',
  'Mathématiques': 'bg-yellow-50 dark:bg-yellow-900/30',
  'Art': 'bg-purple-50 dark:bg-purple-900/30',
  'Logique': 'bg-indigo-50 dark:bg-indigo-900/30',
  'default': 'bg-gray-50 dark:bg-gray-900/30',
};


export default function QuizCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { loading: authLoading } = useAuth();

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToQuizzes((quizList) => {
            const categoryMap: { [key: string]: { quizCount: number, premiumCount: number } } = {};
            
            quizList.forEach(quiz => {
                if (!categoryMap[quiz.category]) {
                    categoryMap[quiz.category] = { quizCount: 0, premiumCount: 0 };
                }
                categoryMap[quiz.category].quizCount++;
                if (quiz.access_type === 'premium') {
                    categoryMap[quiz.category].premiumCount++;
                }
            });

            const categoryArray: Category[] = Object.entries(categoryMap).map(([name, counts]) => ({
                name,
                ...counts,
            }));

            setCategories(categoryArray);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching quizzes:", err);
            setError("Erreur de chargement des catégories de quiz.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    if (loading || authLoading) {
      return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Catégories de Quiz</h1>
                <p className="text-muted-foreground">Choisissez une matière pour tester vos connaissances.</p>
            </div>
             <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardFooter>
                           <Skeleton className="h-4 w-full" />
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Catégories de Quiz</h1>
                <p className="text-muted-foreground">
                    Choisissez une matière pour commencer à tester vos connaissances.
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
                {categories.length > 0 && categories.map((category) => {
                    const Icon = categoryIcons[category.name] || categoryIcons.default;
                    const colorClass = categoryColors[category.name] || categoryColors.default;

                    return (
                        <Link key={category.name} href={`/quiz/category/${encodeURIComponent(category.name)}`} passHref>
                           <Card className={`flex flex-col h-full hover:shadow-lg transition-shadow duration-300 group ${colorClass}`}>
                                <CardHeader className="flex-grow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="p-3 rounded-full bg-background">
                                          <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                    </div>
                                    <CardTitle>{category.name}</CardTitle>
                                    <CardDescription>{category.quizCount} quiz disponible{category.quizCount > 1 ? 's' : ''}</CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <p className='text-xs text-muted-foreground'>
                                        {category.premiumCount > 0 ? `${category.premiumCount} quiz premium` : `Entièrement gratuit`}
                                    </p>
                                </CardFooter>
                            </Card>
                        </Link>
                    );
                })}
            </div>

             {!loading && categories.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center border-dashed">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <BookOpen className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Aucune catégorie de quiz</CardTitle>
                            <CardDescription>
                                Les quiz sont en cours de préparation. Revenez bientôt !
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
