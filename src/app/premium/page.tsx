'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function PremiumPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePremiumUpgrade = async () => {
    if (!user) return;
    setIsSubmitting(true);
    // In a real app, this would involve a payment gateway.
    // Here, we simulate a successful payment by directly updating the profile.
    const profileRef = doc(db, 'profiles', user.uid);
    try {
      await updateDoc(profileRef, {
        isPremium: true,
        premiumUntil: serverTimestamp() // This should be calculated based on subscription duration
      });
      toast({
        title: 'Félicitations !',
        description: 'Vous êtes maintenant un membre Premium.',
      });
    } catch (error) {
      console.error('Premium upgrade failed:', error);
      toast({
        title: 'Erreur',
        description: "La mise à niveau a échoué. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Passez à Premium</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Débloquez un accès illimité à toutes nos ressources de préparation et maximisez vos chances de réussite.
        </p>
      </div>

      {profile?.isPremium ? (
         <Card className="mx-auto mt-12 max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Vous êtes déjà Premium</CardTitle>
                <CardDescription>
                    Merci de votre confiance. Vous avez déjà accès à toutes les fonctionnalités.
                </CardDescription>
            </CardHeader>
        </Card>
      ) : (
        <Card className="mx-auto mt-12 max-w-lg">
            <CardHeader>
            <CardTitle>Abonnement Annuel</CardTitle>
            <CardDescription>Accès illimité pour une année complète.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-5xl font-bold text-center">5 000 <span className="text-xl font-normal text-muted-foreground">FCFA/an</span></p>
                
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Accès à tous les Quiz, PDFs et Vidéos.
                    </li>
                     <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Accès à toutes les Formations.
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Contenu exclusif et mises à jour régulières.
                    </li>
                </ul>

                <p className="text-xs text-muted-foreground text-center pt-4">Le paiement se fait via Orange Money. En cliquant sur le bouton, vous serez redirigé pour finaliser la transaction.</p>
                
                <Button onClick={handlePremiumUpgrade} disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Devenir Premium maintenant
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
