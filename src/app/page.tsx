import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-background pt-24 md:pt-32 lg:pt-40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-5">
              <div className="flex flex-col justify-center space-y-4 text-center lg:text-left xl:col-span-2">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-5xl md:text-6xl/none font-headline">
                    LE SECRET DU CONCOURS
                  </h1>
                  <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:mx-0">
                    Votre plateforme N°1 pour la préparation des concours directs et professionnels au Burkina Faso.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-2 min-[400px]:flex-row lg:justify-start justify-center">
                   <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/signup">Commencer l'Aventure</Link>
                  </Button>
                </div>
              </div>
              <div className="relative xl:col-span-3">
                  <Image
                    src="https://images.unsplash.com/photo-1517842645767-c6f90415add1?q=80&w=2070&auto=format&fit=crop"
                    alt="Hero"
                    width={1270}
                    height={846}
                    className="z-10 aspect-video overflow-hidden rounded-xl object-cover object-center"
                    data-ai-hint="library study"
                  />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Nos Ressources</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Un accès complet à la réussite</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Quiz interactifs, PDF de cours, vidéos explicatives et formations complètes. Tout ce dont vous avez besoin pour exceller.
                </p>
            </div>
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <ul className="grid gap-4">
                <li className="flex items-start gap-3">
                  <CheckIcon /> 
                  <div>
                    <h3 className="font-bold">Quiz Corrigés</h3>
                    <p className="text-muted-foreground">Des milliers de questions pour tester vos connaissances et suivre votre progression.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon /> 
                   <div>
                    <h3 className="font-bold">Contenu d'Experts</h3>
                    <p className="text-muted-foreground">Nos ressources sont mises à jour régulièrement par des professionnels des concours.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckIcon /> 
                   <div>
                    <h3 className="font-bold">Statistiques Détaillées</h3>
                    <p className="text-muted-foreground">Analysez vos performances pour identifier vos points forts et vos faiblesses.</p>
                  </div>
                </li>
              </ul>
              <Card className="shadow-lg transform transition-transform hover:scale-105">
                <CardHeader>
                  <CardTitle className="text-primary">Devenez Premium</CardTitle>
                  <CardDescription>Accès illimité à toutes les ressources pour seulement 4 000 FCFA / an.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold">4 000 <span className="text-sm font-normal text-muted-foreground">FCFA/an</span></p>
                    <p className="text-xs text-muted-foreground">Paiement facile et sécurisé. Contactez un admin pour l'activation.</p>
                    <Button asChild className="w-full bg-accent hover:bg-accent/90">
                        <Link href="/premium">Passer Premium</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary shrink-0 mt-1">
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        >
        <polyline points="20 6 9 17 4 12" />
        </svg>
    </div>
  );
}
