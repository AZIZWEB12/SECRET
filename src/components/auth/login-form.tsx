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
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { FirestorePermissionError } from "@/firebase/errors"
import { errorEmitter } from "@/firebase/error-emitter"

const formSchema = z.object({
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "+226",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const profilesRef = collection(db, 'profiles');
    const q = query(profilesRef, where("phone", "==", values.phone));

    const querySnapshot = await getDocs(q).catch((serverError) => {
        const permissionError = new FirestorePermissionError({
            path: profilesRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        // Rethrow the error to stop execution and let the listener handle it.
        throw permissionError;
    });

    if (querySnapshot.empty) {
        toast({
            title: "Erreur",
            description: "Numéro de téléphone ou mot de passe incorrect.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    const userProfile = querySnapshot.docs[0].data();
    if (!userProfile.email) {
            toast({
            title: "Erreur de connexion",
            description: "Aucun e-mail associé à ce compte. Veuillez contacter le support.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, userProfile.email, values.password);

        toast({
            title: "Connexion réussie!",
            description: "Bienvenue sur Concours Master Prep.",
        });
        router.push("/home");
    } catch(error: any) {
        let description = "La connexion a échoué. Veuillez réessayer.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Numéro de téléphone ou mot de passe incorrect."
        }
        toast({
        title: "Erreur",
        description: description,
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
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
