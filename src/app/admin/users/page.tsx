'use client';
import { AppLayout } from "@/components/layout/app-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Crown, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppUser, getUsersFromFirestore, updateUserSubscriptionInFirestore } from "@/lib/firestore.service";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userList = await getUsersFromFirestore();
                setUsers(userList);
                setLoading(false);
            } catch (err) {
                setError("Erreur de chargement des utilisateurs.");
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const toggleSubscription = async (userId: string, currentStatus: 'gratuit' | 'premium' = 'gratuit') => {
        setUpdatingUserId(userId);
        const newStatus = currentStatus === 'premium' ? 'gratuit' : 'premium';
        
        try {
            await updateUserSubscriptionInFirestore(userId, { type: newStatus, tier: newStatus === 'premium' ? 'annuel' : null });
            toast({
                title: "Succès",
                description: `Abonnement de l'utilisateur mis à jour.`,
            });
            // Refetch users to update the UI
            const userList = await getUsersFromFirestore();
            setUsers(userList);
        } catch(err) {
             toast({
                title: "Erreur",
                description: "Impossible de mettre à jour l'abonnement.",
                variant: 'destructive'
            });
        } finally {
            setUpdatingUserId(null);
        }
    };

    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-8 font-headline">Gestion des Utilisateurs</h1>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
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
                            <TableRow key={user.uid}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.subscription_type === 'premium' ? 'default' : 'outline'}>{user.subscription_type}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.createdAt ? format(user.createdAt, 'dd MMM yyyy', { locale: fr }) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => toggleSubscription(user.uid, user.subscription_type)}
                                        disabled={updatingUserId === user.uid || user.role === 'admin'}
                                    >
                                        {updatingUserId === user.uid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
