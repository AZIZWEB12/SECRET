import Link from 'next/link';
import { AppLogo } from '../shared/app-logo';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background/50 backdrop-blur-sm">
      <div className="container py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link href="/" className="flex items-center space-x-2">
                <AppLogo />
                <span className="font-bold text-sm text-primary">
                 LE SECRET DU CONCOURS
                </span>
            </Link>
            <p className="text-center text-xs text-muted-foreground md:text-left">
              © 2024 GTC — Développé par AzizWeb.
            </p>
        </div>
      </div>
    </footer>
  );
}
