'use client';

import { LoginForm } from "@/components/auth/login-form"
import { AppLogo } from "@/components/shared/app-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <AppLogo />
        </Link>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black tracking-tight gradient-text">Heureux de vous revoir !</CardTitle>
          <CardDescription>Accédez à votre espace de préparation</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Pas encore de compte?{" "}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
        <style jsx global>{`
          .gradient-text {
            background: -webkit-linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
    </div>
  )
}
