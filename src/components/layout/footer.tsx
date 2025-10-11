import Link from 'next/link';
import { AppLogo } from '../shared/app-logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col-reverse items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" className="flex items-center space-x-2">
                <AppLogo className="h-8 w-8" />
                <span className="font-bold sm:inline-block text-lg">
                LE SECRET DU CONCOURS
                </span>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2025 GTC — Développé par AzizWeb.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3">
              <div className="grid gap-1">
                <h3 className="font-semibold">Navigation</h3>
                <Link href="/home" className="text-muted-foreground hover:text-foreground">Accueil</Link>
                <Link href="/quiz" className="text-muted-foreground hover:text-foreground">Quiz</Link>
                <Link href="/premium" className="text-muted-foreground hover:text-foreground">Premium</Link>
              </div>
              <div className="grid gap-1">
                <h3 className="font-semibold">Ressources</h3>
                <Link href="/pdfs" className="text-muted-foreground hover:text-foreground">PDFs</Link>
                <Link href="/videos" className="text-muted-foreground hover:text-foreground">Vidéos</Link>
                <Link href="/formations" className="text-muted-foreground hover:text-foreground">Formations</Link>
              </div>
              <div className="grid gap-1">
                <h3 className="font-semibold">Contact</h3>
                <a href="https://wa.me/22664341393" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">WhatsApp</a>
                <a href="https://www.tiktok.com/@prepare.concours" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">TikTok</a>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
