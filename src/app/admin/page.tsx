import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookCopy, FileText, Video, GraduationCap, CreditCard } from "lucide-react";
import Link from "next/link";

const adminLinks = [
    { href: "/admin/users", title: "Utilisateurs", icon: Users },
    { href: "/admin/quizzes", title: "Quiz", icon: BookCopy },
    { href: "/admin/pdfs", title: "PDFs", icon: FileText },
    { href: "/admin/videos", title: "Vidéos", icon: Video },
    { href: "/admin/formations", title: "Formations", icon: GraduationCap },
    { href: "/admin/payments", title: "Paiements", icon: CreditCard },
];

export default function AdminDashboardPage() {
    return (
        <AppLayout>
            <h1 className="text-3xl font-bold mb-8 font-headline">Tableau de Bord Administrateur</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stat Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs inscrits</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Total des utilisateurs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Abonnements actifs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paiements en attente</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Validations requises</p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-2xl font-bold mt-12 mb-6 font-headline">Gestion du contenu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminLinks.map(link => (
                    <Link href={link.href} key={link.href}>
                         <Card className="hover:bg-muted/50 transition-colors">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <link.icon className="h-8 w-8 text-primary" />
                                <CardTitle>{link.title}</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </AppLayout>
    );
}
