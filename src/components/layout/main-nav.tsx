'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Profile } from '@/lib/types';

interface MainNavProps {
  onLinkClick?: () => void;
}

export function MainNav({ onLinkClick }: MainNavProps) {
  const pathname = usePathname();
  const { profile, user } = useAuth();

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
            pathname === href ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          {label}
        </Link>
      ))}
    </>
  );
}
