
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookCopy, GraduationCap, CreditCard, UserCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AppUser, parseFirestoreDate } from "@/lib/firestore.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { AlertTriangle } from 'lucide-react';


const adminLinks = [
    { href: "/admin/users", title: "Gérer les Utilisateurs", icon: Users },
    { href: "/admin/quizzes", title: "Gérer les Quiz", icon: BookCopy },
    { href: "/admin/formations", title: "Gérer les Formations", icon: GraduationCap },
];

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0 });
    const [recentUsers, setRecentUsers] = useState<AppUser[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // --- Fetch Stats ---
        const usersRef = collection(db, 'users');

        const unsubStats = onSnapshot(usersRef, 
            (userSnapshot) => {
                const totalUsers = userSnapshot.size;
                const premiumUsers = userSnapshot.docs.filter(doc => doc.data().subscription_type === 'premium').length;
                
                setStats({
                    totalUsers,
                    premiumUsers,
                });
                setLoadingStats(false);
                setError(null);
            }, 
            (err) => {
                setError("Erreur de lecture des profils.");
                setLoadingStats(false);
                const permissionError = new FirestorePermissionError({
                    path: usersRef.path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        // --- Fetch Recent Users ---
        const recentUsersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5));
        const unsubRecentUsers = onSnapshot(recentUsersQuery, 
            (snapshot) => {
                const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
                setRecentUsers(users);
                setLoadingUsers(false);
            },
            (err) => {
                setError("Erreur de lecture des utilisateurs récents.");
                setLoadingUsers(false);
                 const permissionError = new FirestorePermissionError({
                    path: 'users',
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
            }
        );

        return () => {
            unsubStats();
            unsubRecentUsers();
        };
    }, []);

    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-8 font-headline">Tableau de Bord Administrateur</h1>
            
            {error && (
                 <Alert variant="destructive" className="mb-8">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erreur de chargement</AlertTitle>
                    <AlertDescription>{error} Vérifiez les permissions de la base de données.</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs inscrits</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.totalUsers}</div>}
                        <p className="text-xs text-muted-foreground">Total des utilisateurs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loadingStats ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats.premiumUsers}</div>}
                        <p className="text-xs text-muted-foreground">Abonnements actifs</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-6 font-headline">Derniers Inscrits</h2>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Inscription</TableHead>
                                    <TableHead>Abonnement</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingUsers && [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                                    </TableRow>
                                ))}
                                {!loadingUsers && recentUsers.map(user => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium">{user.displayName}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {user.createdAt ? formatDistanceToNow(parseFirestoreDate(user.createdAt), { addSuffix: true, locale: fr }) : '-'}
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant={user.subscription_type === 'premium' ? 'default' : 'secondary'}>
                                                {user.subscription_type}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {!loadingUsers && recentUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                            Aucun utilisateur inscrit pour le moment.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-6 font-headline">Gestion du Contenu</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {adminLinks.map(link => (
                            <Link href={link.href} key={link.href} passHref>
                                 <Card className="hover:bg-muted/50 transition-colors group">
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <link.icon className="h-6 w-6 text-primary" />
                                            <CardTitle className="text-base">{link.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
