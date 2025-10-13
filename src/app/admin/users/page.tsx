
'use client';
import { AppLayout } from "@/components/layout/app-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Crown, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const usersCollectionRef = collection(db, 'profiles');
        const unsubscribe = onSnapshot(usersCollectionRef, 
            (snapshot) => {
                const profiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
                setUsers(profiles);
                setLoading(false);
                setError(null);
            },
            (serverError) => {
                setLoading(false);
                setError("Vous n'avez pas les droits nécessaires pour consulter la liste des utilisateurs.");
                const permissionError = new FirestorePermissionError({
                    path: usersCollectionRef.path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );
        return () => unsubscribe();
    }, []);

    const toggleSubscription = async (userId: string, currentStatus: 'gratuit' | 'premium') => {
        setUpdatingUserId(userId);
        const userDocRef = doc(db, 'profiles', userId);
        const newStatus = currentStatus === 'premium' ? 'gratuit' : 'premium';
        const updatedData = { 
            subscription_type: newStatus,
            subscriptionActivatedAt: newStatus === 'premium' ? serverTimestamp() : null
        };
        
        updateDoc(userDocRef, updatedData)
            .then(() => {
                 toast({
                    title: "Succès",
                    description: `Abonnement de l'utilisateur mis à jour.`,
                });
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'update',
                    requestResourceData: updatedData
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .finally(() => {
                 setUpdatingUserId(null);
            });
    };

    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-8 font-headline">Gestion des Utilisateurs</h1>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de permission</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Abonnement</TableHead>
                            <TableHead>Inscrit le</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-32 float-right" /></TableCell>
                                </TableRow>
                            ))
                        )}
                        {!loading && users?.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.subscription_type === 'premium' ? 'default' : 'outline'}>{user.subscription_type}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.createdAt ? format(user.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => toggleSubscription(user.id, user.subscription_type)}
                                        disabled={updatingUserId === user.id || user.role === 'admin'}
                                    >
                                        {updatingUserId === user.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Crown className="mr-2 h-4 w-4" />
                                        {user.subscription_type === 'premium' ? 'Retirer Premium' : 'Passer Premium'}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                         {!loading && users?.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Aucun utilisateur trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
