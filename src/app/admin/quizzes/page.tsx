'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AddQuizDialog } from '@/components/admin/add-quiz-dialog';

export default function AdminQuizzesPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    useEffect(() => {
        const quizzesCollectionRef = collection(db, 'quizzes');
        const q = query(quizzesCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const quizList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz));
                setQuizzes(quizList);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setLoading(false);
                setError("Erreur de chargement des quiz.");
                const permissionError = new FirestorePermissionError({
                    path: 'quizzes',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleDeleteQuiz = async (quizId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce quiz ? Cette action est irréversible.")) {
            return;
        }
        const quizDocRef = doc(db, 'quizzes', quizId);
        deleteDoc(quizDocRef).catch(err => {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: quizDocRef.path,
                operation: 'delete',
            }));
        });
    }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Quiz</h1>
            <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des quiz.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Ajouter un Quiz
        </Button>
      </div>

       <AddQuizDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      
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
                            <TableHead>Segment</TableHead>
                            <TableHead>Difficulté</TableHead>
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
      ) : quizzes.length > 0 ? (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Segment</TableHead>
                        <TableHead>Difficulté</TableHead>
                        <TableHead>Créé le</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quizzes.map(quiz => (
                         <TableRow key={quiz.id}>
                            <TableCell className="font-medium">{quiz.title}</TableCell>
                            <TableCell><Badge variant="outline">{quiz.segment}</Badge></TableCell>
                            <TableCell>{quiz.difficulty}</TableCell>
                            <TableCell>{format(quiz.createdAt.toDate(), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                            <TableCell className="text-right">
                               <Button variant="ghost" size="icon" disabled>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteQuiz(quiz.id)}>
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
