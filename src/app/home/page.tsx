'use client'

import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Film, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const contentCategories = [
    {
      title: "Quiz",
      description: "Testez vos connaissances",
      href: "/quiz",
      icon: BookOpen,
      color: "text-blue-500",
    },
    {
      title: "PDFs",
      description: "Consultez les cours",
      href: "/pdfs",
      icon: FileText,
      color: "text-green-500",
    },
    {
      title: "Vidéos",
      description: "Apprenez en images",
      href: "/videos",
      icon: Film,
      color: "text-red-500",
    },
    {
      title: "Formations",
      description: "Suivez nos parcours",
      href: "/formations",
      icon: GraduationCap,
      color: "text-purple-500",
    },
  ];

export default function HomePage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);


    if (loading || !user) {
        return (
            <AppLayout>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-8 w-1/4 mb-2" />
                                <Skeleton className="h-6 w-full" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </AppLayout>
        )
    }

  return (
    <AppLayout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Bonjour, {profile?.displayName || 'cher utilisateur'} !
        </h1>
        <p className="text-muted-foreground">
          Prêt à relever de nouveaux défis ? Voici vos outils pour réussir.
        </p>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {contentCategories.map((category) => (
          <Link href={category.href} key={category.title}>
            <Card className="group transform transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                <category.icon className={`h-6 w-6 ${category.color}`} />
              </CardHeader>
              <CardDescription className="p-6 pt-0">
                <div className="flex items-center justify-between">
                    <span>{category.description}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardDescription>
            </Card>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
