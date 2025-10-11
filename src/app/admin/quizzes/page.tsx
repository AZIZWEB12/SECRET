'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, PlusCircle } from 'lucide-react';

export default function AdminQuizzesPage() {
  // This would fetch and list quizzes from Firestore
  const quizzes = [];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Quiz</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des quiz.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter un Quiz
        </Button>
      </div>
      
      {quizzes.length > 0 ? (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Difficulté</TableHead>
                        <TableHead>Questions</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* Map through quizzes here */}
                </TableBody>
            </Table>
        </Card>
      ) : (
         <Card className="flex h-96 w-full flex-col items-center justify-center text-center border-dashed">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle>Aucun quiz créé</CardTitle>
                <CardDescription>
                    Cliquez sur "Ajouter un Quiz" pour commencer.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </AppLayout>
  );
}
