
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/shared/app-logo';
import { useAuth } from '@/hooks/use-auth';
import { MainNav } from './main-nav';
import { UserMenu } from './user-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Menu, Bell, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '../shared/theme-toggle';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { AppNotification, subscribeToUserNotifications, markNotificationAsRead, deleteNotificationFromFirestore } from '@/lib/firestore.service';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, loading } = useAuth();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();

  const logoHref = user ? '/home' : '/';

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = subscribeToUserNotifications(user.uid, setNotifications);
      return () => unsubscribe();
    }
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: AppNotification) => {
    router.push(notification.href);
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }
  };
  
  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
      e.stopPropagation();
      await deleteNotificationFromFirestore(notificationId);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href={logoHref} className="mr-6 flex items-center space-x-2">
            <AppLogo />
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
              className="mr-2 px-0 text-base hover:bg-accent focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
             <SheetHeader className="p-4 border-b mb-4">
               <SheetTitle>
                  <Link
                    href={logoHref}
                    className="flex items-center"
                    onClick={() => setSheetOpen(false)}
                  >
                    <AppLogo />
                  </Link>
               </SheetTitle>
               <SheetDescription>
                 Votre plateforme pour la réussite.
               </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col space-y-3 px-4">
              <MainNav onLinkClick={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Link href={logoHref} className="flex items-center space-x-2 md:hidden">
          <AppLogo />
        </Link>


        <div className="flex flex-1 items-center justify-end space-x-2">
          {!loading &&
            (user ? (
              <>
                <ThemeToggle />
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">{unreadCount}</Badge>
                            )}
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                         <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="space-y-4">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleNotificationClick(notif)}>
                                                {!notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>}
                                                <div className={`flex-1 ${notif.isRead ? 'opacity-60' : ''}`}>
                                                    <p className="font-semibold text-sm">{notif.title}</p>
                                                    <p className="text-xs text-muted-foreground">{notif.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {formatDistanceToNow(notif.createdAt, { addSuffix: true, locale: fr })}
                                                    </p>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => handleDeleteNotification(e, notif.id)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">Aucune nouvelle notification.</p>
                                )}
                            </CardContent>
                             {notifications.length > 0 && (
                                <CardFooter>
                                    {/* Potential for "Mark all as read" button */}
                                </CardFooter>
                             )}
                        </Card>
                    </PopoverContent>
                </Popover>
                <UserMenu />
              </>
            ) : (
              <>
                <ThemeToggle />
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
