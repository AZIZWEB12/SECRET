
'use client';

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We only want to check for redirection once the loading is complete.
    if (!loading) {
      if (!profile) {
        // If loading is finished and there's no profile, it means user is not logged in.
        router.push('/login');
      } else if (profile.role !== 'admin') {
        // If the user is logged in but is not an admin, redirect them away.
        router.push('/home');
      }
    }
  }, [profile, loading, router]);

  // While loading, show a clear loading state within the app layout.
  if (loading) {
    return (
        <AppLayout>
            <div className="flex flex-col justify-center items-center h-96 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h2 className="text-xl font-semibold">Vérification des autorisations...</h2>
                <p className="text-muted-foreground">Veuillez patienter.</p>
            </div>
        </AppLayout>
    );
  }

  // If loading is done, and user has an admin profile, render the children.
  // This is the successful state.
  if (profile && profile.role === 'admin') {
    return <>{children}</>;
  }
  
  // If loading is done, but the conditions above are not met (e.g., user is not admin,
  // profile is null), show an unauthorized message. The useEffect will handle the redirect.
  return (
      <AppLayout>
          <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Accès non autorisé</AlertTitle>
              <AlertDescription>
                  Vous n'avez pas les permissions nécessaires. Vous allez être redirigé...
              </AlertDescription>
          </Alert>
      </AppLayout>
  );
}
