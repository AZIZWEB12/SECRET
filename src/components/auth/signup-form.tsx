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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp, getDocs, collection, query } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères."}),
  segment: z.enum(["direct", "professionnel"], { required_error: "Veuillez choisir un segment." }),
})

export function SignupForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  const defaultSegment = searchParams.get('segment') as UserSegment | null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "+226",
      password: "",
      segment: defaultSegment || undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    try {
        const email = `${values.phone}@concours-master-prep.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
        const user = userCredential.user;
        const displayName = `${values.firstName} ${values.lastName}`;
        await updateProfile(user, { displayName });
        
        const profilesCollectionRef = collection(db, 'profiles');
        
        const q = query(profilesCollectionRef);
        const querySnapshot = await getDocs(q).catch((serverError) => {
            const permissionError = new FirestorePermissionError({
                path: profilesCollectionRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError; 
        });

        const isFirstUser = querySnapshot.empty;

        const profileData = {
            displayName: displayName,
            phone: values.phone,
            segment: values.segment,
            role: isFirstUser ? 'admin' : 'user',
            isPremium: false,
            premiumUntil: null,
            createdAt: serverTimestamp(),
            email: email,
        };

        const profileDocRef = doc(db, "profiles", user.uid);
        
        await setDoc(profileDocRef, profileData)
          .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: profileDocRef.path,
              operation: 'create',
              requestResourceData: profileData
            });
            errorEmitter.emit('permission-error', permissionError);
            throw permissionError;
          });
        
        toast({
            title: "Compte créé avec succès!",
            description: "Bienvenue sur Concours Master Prep. Vous allez être redirigé.",
        });
        router.push("/home");

    } catch (error: any) {
        console.error("Signup error:", error);
        
        if (error.code === 'auth/email-already-in-use') {
            toast({
                title: "Erreur d'inscription",
                description: "Ce numéro de téléphone est déjà utilisé.",
                variant: "destructive",
            });
        } else if (!(error instanceof FirestorePermissionError)) {
             toast({
                title: "Erreur d'inscription",
                description: "Une erreur est survenue. Veuillez réessayer.",
                variant: "destructive",
            });
        }
    } finally {
        setLoading(false);
    }
  }

  return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer mon compte
          </Button>
        </form>
      </Form>
  )
}
