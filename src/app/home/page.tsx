
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, BookOpen, FileText, Film, GraduationCap, Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QuizAttempt } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Button } from '@/components/ui/button';

const contentCategories = [
  {
    title: 'Quiz',
    description: 'Testez vos connaissances',
    href: '/quiz',
    icon: BookOpen,
    color: 'text-primary',
  },
  {
    title: 'PDFs',
    description: 'Consultez les cours',
    href: '/pdfs',
    icon: FileText,
    color: 'text-secondary',
  },
  {
    title: 'Vidéos',
    description: 'Apprenez en images',
    href: '/videos',
    icon: Film,
    color: 'text-orange-500',
  },
  {
    title: 'Formations',
    description: 'Suivez nos parcours',
    href: '/formations',
    icon: GraduationCap,
    color: 'text-pink-500',
  },
];

interface UserStats {
  quizCount: number;
  averageScore: number;
}

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ quizCount: 0, averageScore: 0 });
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
                      setStats({ quizCount, averageScore });
                  } else {
                      setStats({ quizCount: 0, averageScore: 0 });
                  }
                  setLoadingStats(false);
                  setError(null);
              },
              (err) => {
                  setError("Erreur de chargement des statistiques. Vérifiez vos permissions.");
                  setLoadingStats(false);
                  const permissionError = new FirestorePermissionError({
                      path: `quizAttempts`,
                      operation: 'list',
                  });
                  errorEmitter.emit('permission-error', permissionError);
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
                    Bonjour, <span className="text-primary">{profile?.displayName || 'cher utilisateur'}</span> !
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quiz Faits</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-primary">{stats.quizCount}</div>}
                    <p className="text-xs text-muted-foreground">Nombre de quiz complétés</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Score Moyen</CardTitle>
                    <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-secondary">{stats.averageScore}%</div>}
                    <p className="text-xs text-muted-foreground">Précision moyenne aux quiz</p>
                </CardContent>
            </Card>
        </div>


      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-6">Explorer le contenu</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contentCategories.map((category) => (
            <Card key={category.title} className="group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
                <CardHeader>
                  <div className={`mb-4 rounded-full p-3 bg-primary/10 w-fit`}>
                    <category.icon className={`h-7 w-7 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={category.href}>
                        <Button variant="link" className="p-0">
                            Commencer <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            ))}
        </div>
      </div>
    </AppLayout>
  );
}
