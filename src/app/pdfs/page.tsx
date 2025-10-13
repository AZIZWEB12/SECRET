'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileText, Star, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { LibraryDocument, getDocumentsFromFirestore } from '@/lib/firestore.service';

export default function PdfsPage() {
    const [pdfs, setPdfs] = useState<LibraryDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();
    const router = useRouter();

    useEffect(() => {
        getDocumentsFromFirestore()
            .then(docs => {
                setPdfs(docs.filter(d => d.type === 'pdf'));
                setLoading(false);
            })
            .catch(err => {
                setError("Erreur de chargement des PDF.");
                setLoading(false);
            })
    }, []);

    const canAccess = (pdf: LibraryDocument) => {
        if (pdf.access_type === 'gratuit') return true;
        return profile?.subscription_type === 'premium';
    };
    
    const handleAccess = (pdf: LibraryDocument) => {
        if (canAccess(pdf)) {
             window.open(pdf.url, '_blank');
        } else {
            router.push('/premium');
        }
    }


    return (
        <AppLayout>
            <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">PDFs de Cours</h1>
                <p className="text-muted-foreground">
                    Accédez à tous vos supports de cours au format PDF.
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
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}

                {!loading && pdfs.length > 0 && pdfs.map((pdf) => {
                    const hasAccess = canAccess(pdf);
                    return (
                        <Card key={pdf.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <CardHeader className="flex-grow">
                                <div className="flex justify-between items-center mb-2">
                                    <FileText className="h-8 w-8 text-primary" />
                                    {pdf.access_type === 'premium' && <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200"><Star className="mr-1 h-3 w-3"/>Premium</Badge>}
                                </div>
                                <CardTitle className="leading-tight">{pdf.title}</CardTitle>
                                <CardDescription>Catégorie: {pdf.category}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button className="w-full" onClick={() => handleAccess(pdf)}>
                                    {hasAccess ? <><Download className="mr-2 h-4 w-4"/>Télécharger</> : 'Devenir Premium'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {!loading && pdfs.length === 0 && !error && (
                <div className="mt-8">
                    <Card className="flex h-64 w-full flex-col items-center justify-center text-center border-dashed">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Aucun PDF disponible</CardTitle>
                            <CardDescription>
                                La bibliothèque de PDF est vide pour le moment. Revenez bientôt !
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
