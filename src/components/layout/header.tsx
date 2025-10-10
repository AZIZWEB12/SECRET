'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/shared/app-logo';
import { useAuth } from '@/hooks/use-auth';
import { MainNav } from './main-nav';
import { UserMenu } from './user-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, loading } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppLogo />
            <span className="hidden font-bold sm:inline-block">
              Concours Master Prep
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <MainNav />
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="mb-8 flex items-center"
              onClick={() => setSheetOpen(false)}
            >
              <AppLogo className="mr-2" />
              <span className="font-bold">Concours Master Prep</span>
            </Link>
            <div className="flex flex-col space-y-3">
              <MainNav onLinkClick={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="flex items-center space-x-2 md:hidden">
          <AppLogo />
        </Link>


        <div className="flex flex-1 items-center justify-end space-x-2">
          {!loading &&
            (user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">S'inscrire</Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
