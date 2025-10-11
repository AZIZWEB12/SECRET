import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLogo } from '@/components/shared/app-logo';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                  LE SECRET DU CONCOURS
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Votre plateforme N°1 pour la préparation des concours directs et professionnels au Burkina Faso.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/signup?segment=direct">Concours Direct</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/signup?segment=professionnel">Concours Professionnel</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Nos Ressources</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Un accès complet à la réussite</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Quiz interactifs, PDF de cours, vidéos explicatives et formations complètes. Tout ce dont vous avez besoin pour exceller.
                  </p>
                </div>
                <ul className="grid gap-2 py-4">
                  <li>
                    <CheckIcon /> Des milliers de questions de quiz corrigées.
                  </li>
                  <li>
                    <CheckIcon /> Contenu mis à jour régulièrement par des experts.
                  </li>
                  <li>
                    <CheckIcon /> Suivi de votre progression et statistiques détaillées.
                  </li>
                </ul>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Commencer Gratuitement</Link>
                  </Button>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Devenez Premium</CardTitle>
                  <CardDescription>Accès illimité à toutes les ressources pour seulement 4 000 FCFA / an.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-4xl font-bold">4 000 <span className="text-sm font-normal">FCFA/an</span></p>
                    <p className="text-sm text-muted-foreground">Paiement facile et sécurisé. Contactez un admin pour l'activation.</p>
                    <Button asChild className="w-full">
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
      className="mr-2 inline-block h-4 w-4 text-primary"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
