'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Video, PlusCircle, Trash2, Edit, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AddVideoDialog } from '@/components/admin/add-video-dialog';
import Image from 'next/image';
import { LibraryDocument, getDocumentsFromFirestore, deleteDocumentFromFirestore } from '@/lib/firestore.service';

export default function AdminVideosPage() {
    const [videos, setVideos] = useState<LibraryDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const allDocs = await getDocumentsFromFirestore();
            setVideos(allDocs.filter(doc => doc.type === 'video'));
            setLoading(false);
        } catch (err) {
            setError("Erreur de chargement des vidéos.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) {
            return;
        }
        try {
            await deleteDocumentFromFirestore(id);
            fetchDocuments(); // Refresh list
        } catch (err) {
            setError("Erreur lors de la suppression de la vidéo.");
        }
    }

  return (
    <AppLayout>
       <AddVideoDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onVideoAdded={fetchDocuments} />
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Vidéos</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des vidéos.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter une Vidéo
        </Button>
      </div>
      
       {error && (
            <Alert variant="destructive" className="mb-8">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

      {loading ? (
         <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Accès</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
      ) : videos.length > 0 ? (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Miniature</TableHead>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Accès</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {videos.map(video => (
                         <TableRow key={video.id}>
                             <TableCell>
                                <Image src={video.thumbnailUrl || `https://picsum.photos/seed/${video.id}/120/68`} alt={video.title} width={120} height={68} className="rounded-md object-cover" />
                             </TableCell>
                            <TableCell className="font-medium">{video.title}</TableCell>
                            <TableCell><Badge variant="outline">{video.category}</Badge></TableCell>
                             <TableCell>
                                {video.access_type === 'premium' ? (
                                    <Badge variant="default"><Star className="mr-1 h-3 w-3"/>Premium</Badge>
                                ) : (
                                    <Badge variant="secondary">Gratuit</Badge>
                                )}
                            </TableCell>
                            <TableCell>{video.createdAt ? format(video.createdAt, 'dd/MM/yyyy', { locale: fr }) : '-'}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" disabled>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(video.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
      ) : (
         <Card className="flex h-96 w-full flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Video className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Aucune vidéo ajoutée</CardTitle>
                <CardDescription>
                    Cliquez sur "Ajouter une Vidéo" pour commencer.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </AppLayout>
  );
}
