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
    // If not loading and the profile is loaded but role is not admin, redirect.
    if (!loading && profile && profile.role !== 'admin') {
      router.push('/home');
    }
     // If not loading and there's no profile at all, also redirect.
    if (!loading && !profile) {
      router.push('/login');
    }
  }, [profile, loading, router]);

  // While loading, show a skeleton UI.
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

  // If loading is finished and the profile is not an admin, show an error.
  // This is a fallback for the redirection, in case it's delayed.
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
  
  // If the user is an admin, render the children components.
  return <>{children}</>;
}
