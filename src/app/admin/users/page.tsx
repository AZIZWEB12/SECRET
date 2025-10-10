
'use client';
import { AppLayout } from "@/components/layout/app-layout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminUsersPage() {

    const [profilesSnapshot, loading, error] = useCollection(collection(db, 'profiles'));
    const users = profilesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));

    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-8 font-headline">Gestion des Utilisateurs</h1>

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                        Impossible de charger les utilisateurs. Vérifiez les règles de sécurité Firestore.
                    </AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Segment</TableHead>
                            <TableHead>Rôle</TableHead>
                            <TableHead>Premium</TableHead>
                            <TableHead>Inscrit le</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            [...Array(5)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                </TableRow>
                            ))
                        )}
                        {!loading && users?.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.displayName}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{user.segment === 'direct' ? 'Direct' : 'Professionnel'}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.isPremium ? 'default' : 'outline'}>{user.isPremium ? 'Oui' : 'Non'}</Badge>
                                </TableCell>
                                <TableCell>
                                    {user.createdAt ? format(user.createdAt.toDate(), 'dd MMM yyyy', { locale: fr }) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                         {!loading && users?.length === 0 && (
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
