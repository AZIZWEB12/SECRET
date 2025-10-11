'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Film, GraduationCap, CheckCircle, Target, Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuizAttempt } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const contentCategories = [
  {
    title: 'Quiz',
    description: 'Testez vos connaissances',
    href: '/quiz',
    icon: BookOpen,
    color: 'text-blue-500',
  },
  {
    title: 'PDFs',
    description: 'Consultez les cours',
    href: '/pdfs',
    icon: FileText,
    color: 'text-green-500',
  },
  {
    title: 'Vidéos',
    description: 'Apprenez en images',
    href: '/videos',
    icon: Film,
    color: 'text-red-500',
  },
  {
    title: 'Formations',
    description: 'Suivez nos parcours',
    href: '/formations',
    icon: GraduationCap,
    color: 'text-purple-500',
  },
];

interface UserStats {
  quizCount: number;
  totalCorrect: number;
  averageScore: number;
}

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ quizCount: 0, totalCorrect: 0, averageScore: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
      if (user) {
          setLoadingStats(true);
          const attemptsRef = collection(db, 'quizAttempts');
          const q = query(attemptsRef, where("userId", "==", user.uid));

          const unsubscribe = onSnapshot(q, 
              (snapshot) => {
                  const attempts = snapshot.docs.map(doc => doc.data() as QuizAttempt);
                  const quizCount = attempts.length;
                  
                  if (quizCount > 0) {
                      const totalCorrect = attempts.reduce((sum, acc) => sum + acc.correctCount, 0);
                      const totalQuestions = attempts.reduce((sum, acc) => sum + acc.totalQuestions, 0);
                      const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                      setStats({ quizCount, totalCorrect, averageScore });
                  } else {
                      setStats({ quizCount: 0, totalCorrect: 0, averageScore: 0 });
                  }
                  setLoadingStats(false);
                  setError(null);
              },
              (err) => {
                  console.error("Error fetching quiz attempts:", err);
                  setError("Erreur de chargement des statistiques. Vérifiez vos permissions.");
                  setLoadingStats(false);
              }
          );
          
          return () => unsubscribe();
      }
  }, [user]);


  if (loading || !user) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-2">
        <div className="flex justify-between items-start">
            <div>
                 <h1 className="text-3xl font-bold tracking-tight font-headline">
                    Bonjour, {profile?.displayName || 'cher utilisateur'} !
                </h1>
                <p className="text-muted-foreground">
                    Prêt à relever de nouveaux défis ? Voici vos outils pour réussir.
                </p>
            </div>
             <Badge variant={profile?.isPremium ? "default" : "secondary"} className="text-sm">
                {profile?.isPremium ? <><Star className="mr-2 h-4 w-4" /> Premium</> : 'Gratuit'}
            </Badge>
        </div>
      </div>
      
       {error && (
            <Alert variant="destructive" className="my-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur de chargement</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quiz terminés</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.quizCount}</div>}
                    <p className="text-xs text-muted-foreground">Nombre de quiz complétés</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Bonnes réponses</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalCorrect}</div>}
                    <p className="text-xs text-muted-foreground">Total des réponses correctes</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.averageScore}%</div>}
                    <p className="text-xs text-muted-foreground">Précision moyenne aux quiz</p>
                </CardContent>
            </Card>
        </div>


      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentCategories.map((category) => (
          <Link href={category.href} key={category.title}>
            <Card className="group transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                <category.icon className={`h-6 w-6 ${category.color}`} />
              </CardHeader>
              <CardDescription className="p-6 pt-0">
                <div className="flex items-center justify-between">
                  <span>{category.description}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
