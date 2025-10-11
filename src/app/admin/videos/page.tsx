'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Video, PlusCircle } from 'lucide-react';

export default function AdminVideosPage() {
  // This would fetch and list videos from Firestore
  const videos = [];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Vidéos</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des vidéos.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter une Vidéo
        </Button>
      </div>
      
      {videos.length > 0 ? (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Premium</TableHead>
                        <TableHead>Date d'ajout</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Map through videos here */}
                </TableBody>
            </Table>
        </Card>
      ) : (
         <Card className="flex h-96 w-full flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Video className="h-8 w-8 text-muted-foreground" />
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
