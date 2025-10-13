'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, ShieldCheck, Phone, Copy, Crown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function PremiumPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const adminContactNumber = "22664341393"; 
  const whatsappLink = `https://wa.me/${adminContactNumber}?text=${encodeURIComponent("Bonjour, je souhaite m'abonner à l'offre premium.")}`;

  const handleSubscriptionToggle = async () => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    
    const newStatus = profile.subscription_type === 'premium' ? 'gratuit' : 'premium';

    const userDocRef = doc(db, 'profiles', user.uid);
    const updatedData = {
        subscription_type: newStatus,
        subscriptionActivatedAt: newStatus === 'premium' ? serverTimestamp() : null
    };

    updateDoc(userDocRef, updatedData)
        .then(() => {
            toast({
                title: "Statut mis à jour !",
                description: `Vous êtes maintenant en mode ${newStatus}.`,
            });
        })
        .catch(async (serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'update',
                requestResourceData: updatedData,
            }));
        })
        .finally(() => {
            setIsSubmitting(false);
        });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Passez à Premium</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Débloquez un accès illimité à toutes nos ressources de préparation et maximisez vos chances de réussite.
        </p>
      </div>

      {profile?.subscription_type === 'premium' ? (
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
             <CardContent>
                <Button onClick={handleSubscriptionToggle} variant="outline" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     Repasser en mode gratuit (simulation)
                </Button>
            </CardContent>
        </Card>
      ) : (
        <Card className="mx-auto mt-12 max-w-lg">
            <CardHeader>
            <CardTitle>Abonnement Annuel</CardTitle>
            <CardDescription>Accès illimité pour une année complète.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-5xl font-bold text-center">4 000 <span className="text-xl font-normal text-muted-foreground">FCFA/an</span></p>
                
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

                 <Card className='bg-muted/50 p-4'>
                    <CardTitle className='text-base mb-2'>Comment procéder ?</CardTitle>
                    <div className="text-sm space-y-4">
                         <p>
                            <strong className="block mb-1">Contactez un administrateur</strong>
                             Contactez un administrateur sur WhatsApp pour effectuer le paiement et activer votre compte.
                        </p>
                    </div>
                </Card>
                
                <Button asChild className="w-full" size="lg">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Phone className="mr-2 h-4 w-4" />
                        Contacter un Admin sur WhatsApp
                    </a>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou
                    </span>
                  </div>
                </div>

                <Button onClick={handleSubscriptionToggle} variant="secondary" className="w-full" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     <Crown className="mr-2 h-4 w-4" />
                     Simuler la mise à niveau Premium
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
