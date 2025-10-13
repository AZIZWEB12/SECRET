'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function AdminPaymentsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const transactionsCollectionRef = collection(db, 'transactions');
        const q = query(transactionsCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const transactionList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(transactionList);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setLoading(false);
                setError("Erreur de chargement des transactions. Vérifiez vos permissions.");
                const permissionError = new FirestorePermissionError({
                    path: 'transactions',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        return () => unsubscribe();
    }, []);
    
    const handleTransactionStatusUpdate = async (transactionId: string, newStatus: 'approved' | 'rejected') => {
        const transactionRef = doc(db, 'transactions', transactionId);
        const transaction = transactions.find(p => p.id === transactionId);
        if (!transaction) return;

        const updateData: { status: 'approved' | 'rejected', approvedAt?: any } = { status: newStatus };
        if (newStatus === 'approved') {
            updateData.approvedAt = serverTimestamp();
        }

        try {
            await updateDoc(transactionRef, updateData);
            
            if (newStatus === 'approved') {
                const userProfileRef = doc(db, 'profiles', transaction.userId);
                await updateDoc(userProfileRef, { 
                    subscription_type: 'premium',
                    subscriptionActivatedAt: serverTimestamp() 
                });
            }

            toast({
                title: "Succès",
                description: `Le statut de la transaction a été mis à jour.`
            });
        } catch (err) {
             const permissionError = new FirestorePermissionError({
                path: transactionRef.path,
                operation: 'update',
                requestResourceData: updateData,
            });
            errorEmitter.emit('permission-error', permissionError);

             if (newStatus === 'approved') {
                 const userProfileRef = doc(db, 'profiles', transaction.userId);
                 const userProfileUpdateData = { subscription_type: 'premium', subscriptionActivatedAt: serverTimestamp() };
                 errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: userProfileRef.path,
                    operation: 'update',
                    requestResourceData: userProfileUpdateData,
                }));
            }
        }
    };

    const getStatusVariant = (status: 'pending' | 'approved' | 'rejected'): "default" | "secondary" | "destructive" => {
        switch (status) {
            case 'approved': return 'default';
            case 'pending': return 'secondary';
            case 'rejected': return 'destructive';
        }
    }

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gérer les Transactions</h1>
                <p className="text-muted-foreground">Validez ou rejetez les paiements en attente.</p>
            </div>
            
            {error && (
                 <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de chargement</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            {loading ? (
                 <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {[...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            ) : transactions.length > 0 ? (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilisateur ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {transactions.map(transaction => (
                                <TableRow key={transaction.id}>
                                    <TableCell className="font-mono text-xs">{transaction.userId}</TableCell>
                                    <TableCell>{format(transaction.createdAt.toDate(), 'dd MMM yyyy, HH:mm', { locale: fr })}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {transaction.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="icon" variant="outline" className="h-8 w-8 bg-green-50 hover:bg-green-100 text-green-700" onClick={() => handleTransactionStatusUpdate(transaction.id, 'approved')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="outline" className="h-8 w-8 bg-red-50 hover:bg-red-100 text-red-700" onClick={() => handleTransactionStatusUpdate(transaction.id, 'rejected')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
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
                            <CreditCard className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>Aucune transaction enregistrée</CardTitle>
                        <CardDescription>
                            Il n'y a aucune transaction en attente ou traitée pour le moment.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}
        </AppLayout>
    );
}
