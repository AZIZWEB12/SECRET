'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { CheckCircle, ShieldCheck, Phone, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PremiumPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const adminContactNumber = "22664341393"; 
  const paymentUssdCode = `*144*2*1*${adminContactNumber}*4000#`;
  const whatsappLink = `https://wa.me/${adminContactNumber}?text=${encodeURIComponent("Bonjour, j'ai effectué le paiement de 4000 FCFA pour l'abonnement premium. Voici la preuve de paiement.")}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copié !',
        description: 'Le code de paiement a été copié dans le presse-papiers.'
    })
  }

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
                            <strong className="block mb-1">1. Effectuez le paiement</strong>
                             Effectuez votre dépôt via Orange Money en composant le code USSD ci-dessous.
                        </p>
                        <div className="flex items-center gap-2 rounded-md bg-background p-3">
                            <code className="font-mono text-sm flex-1">{paymentUssdCode}</code>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(paymentUssdCode)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                         <p>
                            <strong className="block mb-1">2. Contactez un administrateur</strong>
                             Une fois le paiement effectué, envoyez la preuve de paiement à un administrateur sur WhatsApp pour l'activation de votre compte.
                        </p>
                    </div>
                </Card>
                
                <Button asChild className="w-full" size="lg">
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <Phone className="mr-2 h-4 w-4" />
                        Contacter un Admin sur WhatsApp
                    </a>
                </Button>
            </CardContent>
        </Card>
      )}
    </AppLayout>
  );
}
