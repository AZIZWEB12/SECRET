'use client';

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/home');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
        <AppLayout>
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-96 w-full" />
            </div>
        </AppLayout>
    );
  }

  if (profile?.role !== 'admin') {
    return (
        <AppLayout>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Accès non autorisé</AlertTitle>
                <AlertDescription>
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                </AlertDescription>
            </Alert>
        </AppLayout>
    );
  }

  return <>{children}</>;
}
