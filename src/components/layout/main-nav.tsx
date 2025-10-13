'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { AppUser } from '@/lib/firestore.service';
import { usePwaInstall } from '@/providers/pwa-install-provider';
import { Button } from '../ui/button';
import { ArrowDownToLine, BookOpen, FileText, GanttChartSquare, Home, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface MainNavProps {
  onLinkClick?: () => void;
}

export function MainNav({ onLinkClick }: MainNavProps) {
  const pathname = usePathname();
  const { profile, user } = useAuth();
  const { canInstall, install } = usePwaInstall();

  const getNavLinks = (profile: AppUser | null) => {
    const commonLinks = [
      { href: '/home', label: 'Accueil', icon: Home },
      { href: '/quiz', label: 'Quiz', icon: BookOpen },
      { href: '/documents', label: 'Ressources', icon: FileText },
      { href: '/concours', label: 'Concours', icon: GanttChartSquare },
    ];

    if (profile?.role === 'admin') {
      return [
        ...commonLinks,
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
      ];
    }
    
    if (user) {
        return [
            ...commonLinks,
            { href: '/premium', label: 'Premium', icon: Star },
        ];
    }

    return [];
  };

  const navLinks = getNavLinks(profile);

  if (!user) return null;

  return (
    <div className="flex flex-col md:flex-row md:items-center md:space-x-6 gap-2">
      {navLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onLinkClick}
          passHref
        >
          <Card className={cn(
              'w-full md:w-auto hover:bg-muted/50 transition-colors group',
              { 'bg-primary/10 border-primary': pathname.startsWith(href) && href !== '/home' },
              { 'bg-primary/10 border-primary': pathname === '/' && href === '/home' },
              { 'bg-primary/10 border-primary': pathname === href }
          )}>
            <CardContent className="p-3 md:p-0 md:bg-transparent md:border-0 md:shadow-none">
              <div className="flex items-center gap-3 md:hidden">
                <div className={cn("p-2 rounded-lg bg-primary/10", { 'bg-primary text-primary-foreground': pathname === href })}>
                  <Icon className={cn("h-5 w-5 text-primary", { 'text-primary-foreground': pathname === href })}/>
                </div>
                <span className="font-semibold text-foreground/80 group-hover:text-foreground">
                  {label}
                </span>
              </div>
               <span className="hidden md:inline-block transition-colors hover:text-foreground/80 font-medium text-sm text-foreground/60 data-[active]:text-foreground" data-active={pathname === href}>
                  {label}
               </span>
            </CardContent>
          </Card>
        </Link>
      ))}
      {canInstall && (
        <Card className="w-full md:w-auto bg-green-500/10 border-green-500/20 hover:bg-green-500/20">
          <CardContent className="p-0">
             <Button variant="ghost" onClick={() => { install(); onLinkClick?.(); }} className="w-full justify-start gap-3 p-3 md:hidden">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <ArrowDownToLine className="h-5 w-5 text-green-600" />
                </div>
                <span className="font-semibold text-green-700">
                    Installer l'app
                </span>
            </Button>
            <Button variant="ghost" onClick={() => { install(); onLinkClick?.(); }} className="hidden md:flex gap-2 text-foreground/60 hover:text-foreground/80 justify-start p-0 h-auto md:text-foreground/60 md:hover:text-foreground/80 font-medium text-sm">
                Installer l'app
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
