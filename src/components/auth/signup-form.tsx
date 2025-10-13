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
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserCompetitionType } from "@/lib/types"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp, getDocs, collection, query, limit } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

// Updated schema to match new spec (fullName, competitionType)
const formSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet doit contenir au moins 3 caractères." }),
  phone: z.string().min(8, { message: "Veuillez entrer un numéro de téléphone valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères."}),
  competitionType: z.enum(["direct", "professionnel"], { required_error: "Veuillez choisir un type de concours." }),
})

export function SignupForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const defaultCompetitionType = searchParams.get('competitionType') as UserCompetitionType | null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "+226",
      password: "",
      competitionType: defaultCompetitionType || undefined,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    
    try {
        const email = `${values.phone}@gagnetonconcours.app`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, values.password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: values.fullName });
        
        const usersCollectionRef = collection(db, "users");
        const q = query(usersCollectionRef, limit(1));
        
        let isFirstUser = false;
        try {
            const initialUserCheck = await getDocs(q);
            isFirstUser = initialUserCheck.empty;
        } catch (err) {
            isFirstUser = false;
        }
        
        const profileData = {
            fullName: values.fullName,
            phone: values.phone,
            competitionType: values.competitionType,
            role: isFirstUser ? 'admin' : 'user',
            subscription_type: isFirstUser ? 'premium' : 'gratuit', 
            subscriptionActivatedAt: isFirstUser ? serverTimestamp() : null,
            createdAt: serverTimestamp(),
            email: email,
        };

        const profileDocRef = doc(db, "users", user.uid);
        
        await setDoc(profileDocRef, profileData);

        toast({
            title: "Compte créé avec succès!",
            description: "Bienvenue sur LE SECRET DU CONCOURS. Vous allez être redirigé.",
        });
        router.push("/home");

    } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
            toast({
                title: "Erreur d'inscription",
                description: "Ce numéro de téléphone est déjà utilisé.",
                variant: "destructive",
            });
        } else {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: `users/${auth.currentUser?.uid || 'unknown_user'}`,
                operation: 'create',
                requestResourceData: { phone: values.phone, competitionType: values.competitionType }
             }));
             toast({
                title: "Erreur d'inscription",
                description: "Impossible de créer le profil. Vérifiez vos permissions ou contactez le support.",
                variant: "destructive",
            });
             console.error("Signup error:", error);
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom et Prénom(s)</FormLabel>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                 <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="********" 
                      {...field} 
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="competitionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de concours</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez votre type de concours" />
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
