'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/shared/app-logo';
import { useAuth } from '@/hooks/use-auth';
import { MainNav } from './main-nav';
import { UserMenu } from './user-menu';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, Bell } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../shared/theme-toggle';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';

export function Header() {
  const { user, loading } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-md">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <AppLogo />
            <span className="hidden font-bold sm:inline-block">
              LE SECRET DU CONCOURS
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
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden text-primary-foreground hover:bg-white/20"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 bg-primary text-primary-foreground">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Link
              href="/"
              className="mb-8 flex items-center"
              onClick={() => setSheetOpen(false)}
            >
              <AppLogo className="mr-2" />
              <span className="font-bold">LE SECRET DU CONCOURS</span>
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
          <ThemeToggle />
          {!loading &&
            (user ? (
              <>
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
                            <Bell className="h-5 w-5" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                         <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Aucune nouvelle notification.</CardDescription>
                            </CardHeader>
                        </Card>
                    </PopoverContent>
                </Popover>
                <UserMenu />
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-primary-foreground hover:bg-white/20 hover:text-primary-foreground">
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button asChild variant="secondary" className="bg-white/90 text-primary hover:bg-white">
                  <Link href="/signup">S'inscrire</Link>
                </Button>
              </>
            ))}
        </div>
      </div>
    </header>
  );
}
