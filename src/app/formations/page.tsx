'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { GraduationCap, Star, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Formation, subscribeToFormations } from '@/lib/firestore.service';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function FormationsPage() {
    const [formations, setFormations] = useState<Formation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    useEffect(() => {
        const unsubscribe = subscribeToFormations((formationList) => {
            setFormations(formationList);
            setLoading(false);
            setError(null);
        });

        // The onSnapshot listener in subscribeToFormations already handles errors,
        // but we can add a fallback here.
        // In a real app, the service would need to propagate errors for this to work.

        return () => unsubscribe();
    }, []);

    const canAccess = (formation: Formation) => {
        if (!formation.premiumOnly) return true;
        return profile?.subscription_type === 'premium';
    };

    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Formations</h1>
                <p className="text-muted-foreground">
                    Suivez nos parcours de formation complets pour une préparation optimale.
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
                            <Skeleton className="h-10 w-full" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}

                {!loading && formations.length > 0 && formations.map((formation) => {
                    const hasAccess = canAccess(formation);
                    return (
                        <Card key={formation.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-full bg-primary/10">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                    </div>
                                    {formation.premiumOnly && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                                </div>
                                <CardTitle>{formation.title}</CardTitle>
                                <CardDescription>{formation.description}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild className="w-full" disabled={!hasAccess && formation.premiumOnly}>
                                    <Link href={hasAccess ? `/formations/${formation.id}` : '/premium'}>
                                        {hasAccess ? <>Commencer <ArrowRight className="ml-2 h-4 w-4"/></> : 'Devenir Premium'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {!loading && formations.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center border-dashed">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <GraduationCap className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Aucune formation disponible</CardTitle>
                            <CardDescription>
                                Les parcours de formation sont en cours de construction. Revenez bientôt !
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
