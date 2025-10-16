
import Link from 'next/link';
import { AppLogo } from '../shared/app-logo';

export function Footer() {

  const devNumber = "22654808048";
  const devMessage = encodeURIComponent("Bonjour, je suis intéressé par vos services de conception de plateformes, applications et sites web.");
  const devWhatsappUrl = `https://wa.me/${devNumber}?text=${devMessage}`;

  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center space-x-2">
                <AppLogo />
            </Link>
            <div className="text-center text-xs text-muted-foreground md:text-left">
              <p>© 2025 SDC - Tous droits réservés</p>
              <a href={devWhatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-primary">
                Contacter le développeur
              </a>
            </div>
        </div>
      </div>
    </footer>
  );
}
