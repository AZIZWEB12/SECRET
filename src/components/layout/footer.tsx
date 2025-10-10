import Link from 'next/link';
import { Button } from '../ui/button';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 GTC — Développé par AzizWeb
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <a href="https://wa.me/22654808048" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="https://www.tiktok.com/@prepare.concours" target="_blank" rel="noopener noreferrer">
              TikTok
            </a>
          </Button>
        </div>
      </div>
    </footer>
  );
}
