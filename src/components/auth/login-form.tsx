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
import { signInAnonymously } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore"

const formSchema = z.object({
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "+226",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where("phone", "==", values.phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: "Erreur",
          description: "Aucun compte n'est associé à ce numéro. Veuillez vous inscrire.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // For simplicity, we sign in the user anonymously.
      // In a real-world scenario, you might want a more secure custom auth system.
      await signInAnonymously(auth);

      toast({
        title: "Connexion réussie!",
        description: "Bienvenue sur Concours Master Prep.",
      });
      router.push("/home");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erreur",
        description: "La connexion a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div id="recaptcha-container"></div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Se connecter
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
