
'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, Phone, Crown, Loader2, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PremiumPage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingTransaction, setHasPendingTransaction] = useState(false);

  // Check for pending transactions on component mount
  useState(() => {
    const checkPendingTransactions = async () => {
      if (!user) return;
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', user.uid), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setHasPendingTransaction(true);
      }
    };
    checkPendingTransactions();
  });
  
  const paymentNumber = "64341393";
  const ussdCode = `*144*4*6*4000*${paymentNumber}#`;

  const handleRequestSubscription = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
        const transactionsRef = collection(db, 'transactions');
        // Check if there is already a pending transaction
        const q = query(transactionsRef, where('userId', '==', user.uid), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(transactionsRef, {
                userId: user.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });
            toast({
                title: "Demande envoyée !",
                description: "Votre demande de paiement a été envoyée. L'admin la vérifiera bientôt.",
            });
            setHasPendingTransaction(true);
        } else {
             toast({
                title: "Demande déjà en cours",
                description: "Vous avez déjà une transaction en attente de validation.",
                variant: 'default'
            });
        }
    } catch(err) {
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Impossible d'envoyer la demande."
        })
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
      ) : hasPendingTransaction ? (
          <Alert className="mx-auto mt-12 max-w-lg">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Demande en cours de validation</AlertTitle>
            <AlertDescription>
                Vous avez une transaction en attente. Un administrateur la vérifiera sous peu. Votre compte sera mis à jour automatiquement après validation.
            </AlertDescription>
        </Alert>
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
                            <strong className="block mb-1">1. Paiement Mobile</strong>
                             Effectuez votre paiement via Orange Money en composant le code USSD suivant :
                             <p className="font-mono text-center my-2 p-2 bg-background rounded-md">{ussdCode}</p>
                        </div>
                        <div>
                           <strong className="block mb-1">2. Confirmez votre paiement</strong>
                            Une fois le transfert d'argent effectué, cliquez sur le bouton ci-dessous pour que l'administrateur puisse vérifier et activer votre abonnement.
                        </div>
                    </div>
                </Card>
                
            </CardContent>
            <CardFooter>
                 <Button onClick={handleRequestSubscription} className="w-full" size="lg" disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     J'ai effectué le paiement
                </Button>
            </CardFooter>
        </Card>
      )}
    </AppLayout>
  );
}
