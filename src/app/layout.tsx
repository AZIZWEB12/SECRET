import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/providers/auth-provider';
import { PwaInstallProvider } from '@/providers/pwa-install-provider';
import { ThemeProvider } from '@/providers/theme-provider';

const ptSans = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-pt-sans' });

export const metadata: Metadata = {
  title: 'LE SECRET DU CONCOURS',
  description: 'Plateforme de préparation aux concours du Burkina Faso.',
  manifest: '/manifest.json',
  themeColor: '#D0A0E6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LE SECRET DU CONCOURS',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
         <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <PwaInstallProvider>
                <AuthProvider>
                {children}
                <Toaster />
                </AuthProvider>
            </PwaInstallProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
