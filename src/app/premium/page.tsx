
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Crown, Loader2, ShieldCheck, Whatsapp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PremiumPage() {
  const { profile, user } = useAuth();
  
  const paymentNumber = "64341393";
  const ussdCode = `*144*2*1*${paymentNumber}*4000#`;
  
  const devNumber = "22654808048";
  const adminNumber = "22664341393";

  const handleContactAdmin = () => {
    const userPhone = profile?.phone || 'NON_RENSEIGNE';
    const message = encodeURIComponent(
      `Bonjour, je viens d'effectuer le paiement pour l'abonnement Premium. Mon numéro de téléphone est ${userPhone}. Merci d'activer mon compte.`
    );
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Passez à Premium</h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Débloquez un accès illimité à toutes nos ressources de préparation et maximisez vos chances de réussite.
        </p>
      </div>

      {profile?.subscription_type.type === 'premium' ? (
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
                <p className="text-5xl font-bold text-center">4 000 <span className="text-xl font-normal text-muted-foreground">FCFA/an</span></p>
                
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Accès à tous les quiz interactifs.
                    </li>
                     <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Participation à tous les concours blancs.
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        Des nouveaux concours ajoutés régulièrement.
                    </li>
                </ul>

                 <Card className='bg-muted/50 p-4'>
                    <CardTitle className='text-base mb-2'>Comment procéder ?</CardTitle>
                    <div className="text-sm space-y-4">
                         <div>
                            <strong className="block mb-1">1. Paiement Mobile (Orange Money)</strong>
                             Effectuez votre paiement en composant le code USSD suivant :
                             <p className="font-mono text-center my-2 p-2 bg-background rounded-md">{ussdCode}</p>
                        </div>
                        <div>
                           <strong className="block mb-1">2. Confirmez votre paiement</strong>
                            Une fois le transfert d'argent effectué, cliquez sur le bouton ci-dessous pour contacter l'administrateur et faire activer votre abonnement.
                        </div>
                    </div>
                </Card>
                
            </CardContent>
            <CardFooter>
                 <Button onClick={handleContactAdmin} className="w-full" size="lg">
                    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 fill-current"><title>WhatsApp</title><path d="M12.06 10.83c-.24.12-.5.2-.76.33-.25.13-.5.28-.75.45-.25.17-.5.38-.74.63-.25.25-.47.53-.67.85-.2.32-.33.67-.4.97-.05.3-.1.58-.1.83 0 .27.02.53.05.78.03.25.08.5.15.73s.15.45.25.65c.1.2.2.4.3.55.1.15.2.3.35.45.15.15.3.28.45.4.15.12.3.23.5.32.2.1.4.18.6.25.2.07.4.13.6.17.2.04.4.08.6.1.2.03.4.04.6.04.23 0 .45-.02.68-.05.23-.03.45-.1.68-.18.22-.08.45-.18.65-.3.2-.12.4-.27.58-.45.18-.18.35-.4.5-.62.15-.22.28-.48.38-.75.1-.28.18-.58.2-.9.03-.3.04-.6.04-.9 0-.25-.02-.5-.05-.75-.03-.25-.08-.5-.15-.73-.07-.23-.15-.45-.25-.65-.1-.2-.2-.4-.3-.55s-.2-.3-.35-.45c-.15-.15-.3-.28-.45-.4-.15-.12-.3-.23-.5-.32-.2-.1-.4-.18-.6-.25-.2-.07-.4-.13-.6-.17-.2-.04-.4-.08-.6-.1-.2-.03-.4-.04-.6-.04a2.5 2.5 0 0 0-.7.1zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.2 15.5c-.16.43-.5.8-1 1.1-.5.32-1.1.5-1.7.5-.27 0-.55-.02-.8-.08-.25-.06-.5-.15-.75-.28a8.5 8.5 0 0 1-3.3-2 8.5 8.5 0 0 1-2-3.3c-.13-.25-.22-.5-.28-.75a3.2 3.2 0 0 1-.08-.8c0-.6.18-1.2.5-1.7.3-.5.67-.84 1.1-1A1.6 1.6 0 0 1 8.5 8c.16 0 .3.04.45.1.15.07.3.17.4.3.1.13.2.3.28.5.07.2.13.4.17.6.04.2.08.4.1.6l.33 1.25c.04.15.05.3.05.45 0 .15-.02.3-.05.45-.03.15-.1.28-.15.4a.9.9 0 0 1-.25.3c-.1.1-.2.18-.3.2a1 1 0 0 1-.4.15c-.1 0-.2 0-.3-.02a.8.8 0 0 1-.35-.1c-.13-.05-.25-.1-.4-.15-.13-.06-.25-.12-.38-.2-.12-.08-.24-.17-.35-.25-.1-.1-.2-.2-.3-.3l-.28-.3c-.6-.6-1-1.3-1.3-2-.3-.7-.4-1.3-.4-1.8 0-.6.1-1.2.3-1.7.2-.5.5-1 .85-1.4.35-.4.75-.7 1.2-1 .45-.28 1-.48 1.5-.6.5-.1.1-.2.17-.25.07-.05.15-.1.2-.15.1-.05.17-.08.25-.1.08-.03.15-.05.23-.07.08-.02.16-.03.25-.03a1.6 1.6 0 0 1 1.1.4c.15.15.3.3.4.5.1.2.2.4.25.6.05.2.1.4.13.6.03.2.05.4.07.6.02.2.03.4.03.6v.5c-.04.4-.13.8-.25 1.15Z"/></svg>
                    Contacter l'Admin pour l'activation
                </Button>
            </CardFooter>
        </Card>
      )}
    </AppLayout>
  );
}
