'use client';
import { AppLayout } from "@/components/layout/app-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Crown, Loader2, UserCog } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AppUser, getUsersFromFirestore, updateUserRoleInFirestore, updateUserSubscriptionInFirestore } from "@/lib/firestore.service";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

function ManageUserDialog({ user, onUpdate }: { user: AppUser, onUpdate: () => void }) {
    const [newRole, setNewRole] = useState(user.role);
    const [newSubscription, setNewSubscription] = useState(user.subscription_type);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();
    const { profile: adminProfile } = useAuth();

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            if (newRole !== user.role) {
                await updateUserRoleInFirestore(user.uid, newRole as 'admin' | 'user');
            }
            if (newSubscription !== user.subscription_type) {
                await updateUserSubscriptionInFirestore(user.uid, { type: newSubscription as 'gratuit' | 'premium', tier: newSubscription === 'premium' ? 'annuel' : null });
            }
            toast({ title: "Succès", description: `L'utilisateur ${user.displayName} a été mis à jour.` });
            onUpdate();
        } catch (err) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour l'utilisateur.", variant: 'destructive' });
        } finally {
            setIsUpdating(false);
        }
    };
    
    // An admin cannot demote themselves.
    const isSelfDemotion = adminProfile?.uid === user.uid && user.role === 'admin' && newRole === 'user';

    return (
        <Dialog onOpenChange={(open) => { if(!open) onUpdate() }}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <UserCog className="mr-2 h-4 w-4" />
                    Gérer
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gérer {user.displayName}</DialogTitle>
                    <DialogDescription>
                        Modifiez le rôle et l'abonnement de cet utilisateur.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Rôle de l'utilisateur</Label>
                        <Select value={newRole} onValueChange={(value) => setNewRole(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">Utilisateur</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                            </SelectContent>
                        </Select>
                        {isSelfDemotion && <p className="text-xs text-destructive">Vous ne pouvez pas retirer votre propre rôle d'administrateur.</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Statut de l'abonnement</Label>
                        <Select value={newSubscription} onValueChange={(value) => setNewSubscription(value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gratuit">Gratuit</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdate} disabled={isUpdating || isSelfDemotion}>
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mettre à jour
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function AdminUsersPage() {
    const [users, setUsers] = useState<AppUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const userList = await getUsersFromFirestore();
            setUsers(userList);
        } catch (err) {
            setError("Erreur de chargement des utilisateurs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

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
                                    <TableCell><Skeleton className="h-8 w-24 float-right" /></TableCell>
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
                                    {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <ManageUserDialog user={user} onUpdate={fetchUsers} />
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
