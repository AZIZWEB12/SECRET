import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { Toaster } from '@/components/ui/toaster';
import AuthProvider from '@/providers/auth-provider';
import { PwaInstallProvider } from '@/providers/pwa-install-provider';
import { ThemeProvider } from '@/providers/theme-provider';

const ptSans = PT_Sans({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-pt-sans' 
});

const APP_NAME = "Concours Master Prep";
const APP_DESCRIPTION = "La plateforme la plus moderne et interactive pour réussir vos concours.";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  themeColor: '#8A2BE2', // Violet/Mauve
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
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
        <link rel="icon" href="/logo.png" sizes="any" />
      </head>
      <body className={`${ptSans.variable} font-sans antialiased`}>
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
