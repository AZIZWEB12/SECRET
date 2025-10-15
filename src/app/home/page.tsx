
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Award, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Attempt, getAttemptsFromFirestore } from '@/lib/firestore.service';

const contentCategories = [
  {
    title: 'Quiz',
    description: 'Testez vos connaissances',
    href: '/quiz',
    icon: BookOpen,
    color: 'gradient-quiz',
  },
  {
    title: 'Concours',
    description: 'Suivez nos parcours',
    href: '/formations',
    icon: GraduationCap,
    color: 'gradient-formation',
  },
  {
    title: 'Premium',
    description: 'Passez au niveau supérieur',
    href: '/premium',
    icon: Star,
    color: 'gradient-premium',
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
          getAttemptsFromFirestore(user.uid)
            .then(attempts => {
                const quizCount = attempts.length;
                if (quizCount > 0) {
                    const totalScore = attempts.reduce((sum, acc) => sum + acc.percentage, 0);
                    const averageScore = Math.round(totalScore / quizCount);
                    setStats({ quizCount, averageScore });
                } else {
                    setStats({ quizCount: 0, averageScore: 0 });
                }
                setLoadingStats(false);
            })
            .catch(err => {
                setError("Erreur de chargement des statistiques.");
                setLoadingStats(false);
            })
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
                    Bonjour, <span className="text-primary">{profile?.displayName?.split(' ')[0] || 'cher utilisateur'}</span> !
                </h1>
                <p className="text-muted-foreground">
                    Prêt à relever de nouveaux défis ? Voici vos outils pour réussir.
                </p>
            </div>
             {profile?.subscription_type.type === 'premium' && (
                <Badge variant="default" className="text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-none shadow-lg">
                    <Star className="mr-2 h-4 w-4" /> Premium
                </Badge>
             )}
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
                    {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold text-accent">{stats.averageScore}%</div>}
                    <p className="text-xs text-muted-foreground">Précision moyenne aux quiz</p>
                </CardContent>
            </Card>
        </div>


      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-6">Explorer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contentCategories.map((category, index) => (
            <Card key={category.title} className="group hover-lift overflow-hidden stagger-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader>
                  <div className={`mb-4 rounded-full p-3 bg-primary/10 w-fit`}>
                    <category.icon className={`h-7 w-7 ${category.color}`} />
                  </div>
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                </CardContent>
                <CardFooter>
                    <Link href={category.href} className='w-full'>
                        <Button variant="link" className="p-0 text-primary w-full justify-start">
                            Commencer <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
            ))}
        </div>
      </div>
       {profile?.subscription_type.type === 'gratuit' && (
        <Card className="mt-12 text-center p-8 bg-primary/5">
          <h3 className="text-2xl font-bold font-headline gradient-premium">Passez au niveau supérieur</h3>
          <p className="text-muted-foreground mt-2 mb-4">Débloquez l'accès illimité à toutes nos ressources et maximisez vos chances de succès.</p>
          <Button asChild>
            <Link href="/premium">Devenir Premium <Star className="ml-2 h-4 w-4" /></Link>
          </Button>
        </Card>
      )}
    </AppLayout>
  );
}
