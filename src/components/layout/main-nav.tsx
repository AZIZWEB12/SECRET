'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';
import { usePwaInstall } from '@/providers/pwa-install-provider';
import { Button } from '../ui/button';
import { ArrowDownToLine } from 'lucide-react';

interface MainNavProps {
  onLinkClick?: () => void;
}

export function MainNav({ onLinkClick }: MainNavProps) {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const { canInstall, install } = usePwaInstall();

  const getNavLinks = (profile: Profile | null) => {
    const commonLinks = [
      { href: '/home', label: 'Accueil' },
      { href: '/quiz', label: 'Quiz' },
      { href: '/pdfs', label: 'PDFs' },
      { href: '/videos', label: 'Vidéos' },
      { href: '/formations', label: 'Formations' },
    ];

    if (profile?.role === 'admin') {
      return [
        ...commonLinks,
        { href: '/admin', label: 'Admin' },
      ];
    }
    
    if (user) {
        return [
            ...commonLinks,
            { href: '/premium', label: 'Premium' },
        ];
    }

    return [];
  };

  const navLinks = getNavLinks(profile);

  if (!user) return null;

  return (
    <>
      {navLinks.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === href ? 'text-foreground' : 'text-foreground/60',
          )}
        >
          {label}
        </Link>
      ))}
      {canInstall && (
        <Button variant="ghost" onClick={() => { install(); onLinkClick?.(); }} className="gap-2 text-foreground/60 hover:text-foreground/80 justify-start p-0 h-auto md:text-foreground/60 md:hover:text-foreground/80">
            <ArrowDownToLine />
            Installer l'app
        </Button>
      )}
    </>
  );
}
