'use client';

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We don't want to redirect while loading, as the profile might not be available yet.
    if (loading) return;

    if (!profile) {
      // If loading is finished and there's still no profile, redirect to login.
      router.push('/login');
    } else if (profile.role !== 'admin') {
      // If the user is not an admin, redirect them away.
      router.push('/home');
    }
  }, [profile, loading, router]);

  if (loading) {
    return (
        <AppLayout>
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </AppLayout>
    );
  }

  // If loading is done, but the user is not an admin (profile exists but role is not admin),
  // show an unauthorized message before the redirect kicks in.
  if (profile?.role !== 'admin') {
    return (
        <AppLayout>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Accès non autorisé</AlertTitle>
                <AlertDescription>
                    Vous n'avez pas les permissions nécessaires pour accéder à cette page. Redirection...
                </AlertDescription>
            </Alert>
        </AppLayout>
    );
  }
  
  // If the user is an admin, render the children.
  return <>{children}</>;
}
