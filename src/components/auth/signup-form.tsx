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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserSegment } from "@/lib/types"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"


const formSchema = z.object({
  displayName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
  segment: z.enum(["direct", "professionnel"], { required_error: "Veuillez choisir un segment." }),
  code: z.string().optional(),
})

export function SignupForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const defaultSegment = searchParams.get('segment') as UserSegment | null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      phone: "+226",
      segment: defaultSegment || undefined,
      code: "",
    },
  })

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
        let description = "Impossible d'envoyer le code de vérification. Veuillez réessayer.";
        if (error.code === 'auth/invalid-phone-number') {
            description = "Le numéro de téléphone n'est pas valide.";
        }
        toast({
          title: "Erreur",
          description: description,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
        // Verify OTP and create user
        try {
            const userCredential = await confirmationResult.confirm(values.code);
            const user = userCredential.user;

            await setDoc(doc(db, "profiles", user.uid), {
                displayName: values.displayName,
                phone: values.phone,
                segment: values.segment,
                role: 'user',
                isPremium: false,
                premiumUntil: null,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Compte créé avec succès!",
                description: "Bienvenue sur Concours Master Prep.",
            });
            router.push("/home");
        } catch (error: any) {
            console.error("Signup error:", error);
            let description = "Une erreur est survenue. Veuillez réessayer.";
            if (error.code === 'auth/invalid-verification-code') {
                description = "Le code de vérification est incorrect.";
            }
             if (error.code === 'auth/code-expired') {
                description = "Le code de vérification a expiré. Veuillez demander un nouveau code.";
            }
            toast({
                title: "Erreur d'inscription",
                description: description,
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
            <>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="segment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Segment d'apprentissage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisissez votre concours" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="direct">Concours Direct</SelectItem>
                        <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
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
            {confirmationResult ? "Créer mon compte" : "Recevoir le code"}
          </Button>
        </form>
      </Form>
    </>
  )
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}
