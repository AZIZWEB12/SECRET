
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { BookCheck, BrainCircuit, Video, ShieldCheck, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

const features = [
  {
    icon: <BookCheck className="h-8 w-8 text-primary" />,
    title: 'Quiz Corrigés et Interactifs',
    description: 'Des milliers de questions pour tester vos connaissances, suivre votre progression et identifier vos lacunes.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Contenu Rédigé par des Experts',
    description: 'Nos ressources sont conçues et mises à jour par des professionnels des concours pour vous garantir une préparation de qualité.',
  },
    {
    icon: <Video className="h-8 w-8 text-primary" />,
    title: 'Vidéos et Supports PDF',
    description: 'Accédez à des cours complets en vidéo et à des fiches de révision en PDF pour apprendre à votre rythme.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: 'Statistiques Détaillées',
    description: 'Analysez vos performances pour identifier vos points forts et les domaines à améliorer pour une préparation ciblée.',
  },
];


export default function LandingPage() {

    useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-primary/5 text-center">
            <div className="container z-10 px-4 md:px-6 py-24 md:py-32 lg:py-40">
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline animate-fade-in-up text-foreground">
                        LE SECRET DU CONCOURS
                    </h1>
                    <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl animate-fade-in-up animation-delay-300">
                        Votre plateforme N°1 pour la préparation des concours directs et professionnels au Burkina Faso.
                    </p>
                    <div className="animate-fade-in-up animation-delay-600">
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                            <Link href="/signup">Commencer l'Aventure <ArrowRight className="ml-2 h-5 w-5"/></Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 fade-in">
                <div className="inline-block rounded-lg bg-secondary/20 px-3 py-1 text-sm font-semibold text-secondary-foreground">Nos Atouts</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Une Préparation Complète Pour Votre Réussite</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Quiz interactifs, cours d'experts, vidéos explicatives et un suivi personnalisé. Tout ce dont vous avez besoin pour exceller.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
                <div className="fade-in">
                    <Image
                        src="https://images.unsplash.com/photo-1524995767962-b1f5b5a3a3b5?q=80&w=2070&auto=format&fit=crop"
                        alt="Bibliothèque"
                        width={600}
                        height={400}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                        data-ai-hint="library books"
                    />
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="fade-in" style={{ animationDelay: `${index * 150}ms`}}>
                            <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border-transparent hover:border-primary bg-card">
                                <CardHeader>
                                    <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    <p>{feature.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
             <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:order-last">
                    {features.slice(2, 4).map((feature, index) => (
                        <div key={index} className="fade-in" style={{ animationDelay: `${(index+2) * 150}ms`}}>
                            <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl border-transparent hover:border-primary bg-card">
                                <CardHeader>
                                    <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
                                        {feature.icon}
                                    </div>
                                    <CardTitle>{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-muted-foreground text-sm">
                                    <p>{feature.description}</p>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
                 <div className="fade-in lg:order-first">
                    <Image
                        src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2070&auto=format&fit=crop"
                        alt="Personnes étudiant"
                        width={600}
                        height={400}
                        className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                        data-ai-hint="students learning"
                    />
                </div>
            </div>
          </div>
        </section>
        
        {/* Premium CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
            <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 fade-in">
                <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">Passez au niveau supérieur avec <span className="text-primary">Premium</span></h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Débloquez l'accès illimité à toutes nos ressources et maximisez vos chances de succès.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                     <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                        <Link href="/premium">Devenir Premium</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>
      <Footer />
       <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .fade-in.animate-fade-in-up {
            opacity: 1;
            transform: translateY(0);
        }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-600 { animation-delay: 600ms; }
      `}</style>
    </div>
  );
}
