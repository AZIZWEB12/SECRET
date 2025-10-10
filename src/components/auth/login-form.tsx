'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
  code: z.string().optional(),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "+226",
      code: "",
    },
  });

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
    return window.recaptchaVerifier;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    if (!confirmationResult) {
      // Send OTP
      try {
        const recaptchaVerifier = setupRecaptcha();
        const result = await signInWithPhoneNumber(auth, values.phone, recaptchaVerifier);
        setConfirmationResult(result);
        toast({
          title: "Code envoyé!",
          description: "Un code a été envoyé à votre numéro de téléphone.",
        });
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Erreur",
          description: "Impossible d'envoyer le code de vérification. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Verify OTP
      try {
        await confirmationResult.confirm(values.code);
        toast({
          title: "Connexion réussie!",
          description: "Bienvenue sur Concours Master Prep.",
        });
        router.push("/home");
      } catch (error: any) {
        console.error(error);
        toast({
          title: "Erreur de vérification",
          description: "Le code est incorrect. Veuillez réessayer.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <>
      <div id="recaptcha-container"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {!confirmationResult ? (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+226 XX XX XX XX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de vérification</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmationResult ? "Vérifier le code" : "Recevoir le code"}
          </Button>
        </form>
      </Form>
    </>
  )
}

declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}
