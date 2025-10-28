'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GraduationCap, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Formation, subscribeToFormations, deleteFormationFromFirestore } from '@/lib/firestore.service';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminFormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = subscribeToFormations(
      (data) => {
        setFormations(data);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        toast({
          title: 'Erreur de chargement',
          description:
            'Impossible de charger les formations. Vérifiez vos permissions.',
          variant: 'destructive',
        });
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: 'formations',
            operation: 'list',
          })
        );
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
        await deleteFormationFromFirestore(id);
        toast({ title: "Succès", description: "La formation a été supprimée." });
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de supprimer la formation.", variant: 'destructive' });
    }
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Formations</h1>
            <p className="text-muted-foreground">Créez et organisez des parcours de formation.</p>
        </div>
        <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter une Formation
        </Button>
      </div>
      
      {formations.length > 0 ? (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Accès</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {formations.map(formation => (
                        <TableRow key={formation.id}>
                            <TableCell className="font-medium">{formation.title}</TableCell>
                            <TableCell>{formation.description}</TableCell>
                            <TableCell>{formation.premiumOnly ? 'Premium' : 'Gratuit'}</TableCell>
                            <TableCell className="text-right">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Cette action est irréversible et supprimera la formation.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(formation.id)}>Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
                    <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Aucune formation créée</CardTitle>
                <CardDescription>
                    La création de formations sera bientôt disponible.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </AppLayout>
  );
}
