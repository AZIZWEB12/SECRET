'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Film, Star, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Video } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function VideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();

    useEffect(() => {
        const videosCollectionRef = collection(db, 'videos');
        const q = query(videosCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const videoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Video));
                setVideos(videoList);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setLoading(false);
                setError("Erreur de chargement des vidéos. Vérifiez vos permissions.");
                const permissionError = new FirestorePermissionError({
                    path: 'videos',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        return () => unsubscribe();
    }, []);

    const canAccess = (video: Video) => {
        if (!video.premiumOnly) return true;
        return profile?.isPremium;
    };

    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Vidéos</h1>
                <p className="text-muted-foreground">
                    Apprenez à votre rythme avec nos cours vidéo.
                </p>
            </div>

            {error && (
                 <Alert variant="destructive" className="my-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de chargement</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading && [...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <Skeleton className="h-40 w-full" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}

                {!loading && videos.length > 0 && videos.map((video) => (
                    <Card key={video.id} className="flex flex-col overflow-hidden">
                        <div className="relative aspect-video">
                            <Image src={video.thumbnailPath || `https://picsum.photos/seed/${video.id}/400/225`} alt={video.title} fill className="object-cover" />
                             {video.premiumOnly && <Badge variant="default" className="absolute top-2 right-2"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                        </div>
                        <CardHeader className="flex-grow">
                            <CardTitle className="leading-tight">{video.title}</CardTitle>
                        </CardHeader>
                        <CardFooter>
                             <Button asChild className="w-full" disabled={!canAccess(video)}>
                                <Link href={canAccess(video) ? `/videos/${video.id}` : '/premium'}>
                                    {canAccess(video) ? <><PlayCircle className="mr-2 h-4 w-4"/>Regarder</> : 'Devenir Premium'}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {!loading && videos.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Film className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Aucune vidéo disponible</CardTitle>
                            <CardDescription>
                                La section des vidéos est vide pour le moment. Revenez bientôt !
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
