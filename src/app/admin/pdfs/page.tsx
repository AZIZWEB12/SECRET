'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, PlusCircle } from 'lucide-react';

export default function AdminPdfsPage() {
  // This would fetch and list PDFs from Firestore
  const pdfs = [];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les PDFs</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des documents PDF.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter un PDF
        </Button>
      </div>
      
      {pdfs.length > 0 ? (
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
                    {/* Map through PDFs here */}
                </TableBody>
            </Table>
        </Card>
      ) : (
         <Card className="flex h-96 w-full flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Aucun PDF ajouté</CardTitle>
                <CardDescription>
                    Cliquez sur "Ajouter un PDF" pour commencer.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </AppLayout>
  );
}
