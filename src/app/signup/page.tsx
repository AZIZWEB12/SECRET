import { SignupForm } from "@/components/auth/signup-form"
import { AppLogo } from "@/components/shared/app-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <div className="absolute top-4 left-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <AppLogo />
          <span className="font-bold">LE SECRET DU CONCOURS</span>
        </Link>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Créer un compte</CardTitle>
          <CardDescription>Rejoignez la meilleure plateforme de préparation.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Déjà un compte?{" "}
            <Link href="/login" className="underline">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
