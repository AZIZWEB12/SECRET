
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getAttemptsFromFirestore } from "@/lib/firestore.service";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Le nom est trop court."),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface UserStats {
    quizCount: number;
    totalCorrect: number;
    averageScore: number;
}

export default function ProfilePage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState<UserStats>({ quizCount: 0, totalCorrect: 0, averageScore: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const form = useForm<ProfileFormData>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        displayName: '',
      }
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (profile) {
            form.reset({
                displayName: profile.displayName || '',
            });
        }
    }, [user, profile, loading, router, form]);

     useEffect(() => {
      if (user) {
          setLoadingStats(true);
          getAttemptsFromFirestore(user.uid)
            .then(attempts => {
                const quizCount = attempts.length;
                if (quizCount > 0) {
                    const totalCorrect = attempts.reduce((sum, acc) => sum + acc.score, 0);
                    const totalQuestions = attempts.reduce((sum, acc) => sum + acc.totalQuestions, 0);
                    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                    setStats({ quizCount, totalCorrect, averageScore });
                } else {
                    setStats({ quizCount: 0, totalCorrect: 0, averageScore: 0 });
                }
                setLoadingStats(false);
            })
            .catch(err => {
                console.error("Error fetching stats:", err);
                setLoadingStats(false);
            })
      }
  }, [user]);


    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const onSubmit = async (data: ProfileFormData) => {
      if (!user) return;
      setIsSubmitting(true);
      
      const profileRef = doc(db, 'users', user.uid);
      const updatedData = {
        displayName: data.displayName,
      };

      try {
        await updateDoc(profileRef, updatedData);
        toast({ title: "Profil mis à jour avec succès!" });
      } catch(err) {
         toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: 'destructive'});
      } finally {
        setIsSubmitting(false);
      }
    };

    if (loading || !user || !profile) {
        return (
            <AppLayout>
                <Skeleton className="h-32 w-full" />
                <div className="mt-8 grid gap-8 md:grid-cols-3">
                    <Skeleton className="h-64 md:col-span-2" />
                    <Skeleton className="h-48" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.photoURL ?? ''} />
                        <AvatarFallback className="text-3xl">{getInitials(profile.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold font-headline">{profile.displayName}</h1>
                        <p className="text-muted-foreground">{user.phoneNumber || profile.phone}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 justify-center md:justify-start">
                             <Badge variant={profile.subscription_type.type === 'premium' ? "default" : "secondary"}>
                                {profile.subscription_type.type === 'premium' ? 'Premium' : 'Gratuit'}
                            </Badge>
                            <Badge variant="outline">{profile.competitionType === 'direct' ? 'Concours Direct' : 'Concours Professionnel'}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Modifier le profil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nom complet</FormLabel>
                                                <FormControl>
                                                    <Input id="displayName" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="space-y-2">
                                        <Label>Numéro de téléphone</Label>
                                        <Input value={profile.phone} disabled />
                                        <p className="text-xs text-muted-foreground">Le numéro de téléphone ne peut pas être modifié.</p>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Segment d'apprentissage</Label>
                                        <Input value={profile.competitionType === 'direct' ? 'Concours Direct' : 'Concours Professionnel'} disabled />
                                         <p className="text-xs text-muted-foreground">Le type de concours ne peut pas être modifié.</p>
                                    </div>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Enregistrer les modifications
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                            <CardDescription>Votre performance globale.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {loadingStats ? (
                                <>
                                    <div className="flex justify-between"><Skeleton className="h-5 w-2/3" /> <Skeleton className="h-5 w-1/4" /></div>
                                    <div className="flex justify-between"><Skeleton className="h-5 w-2/3" /> <Skeleton className="h-5 w-1/4" /></div>
                                    <div className="flex justify-between"><Skeleton className="h-5 w-2/3" /> <Skeleton className="h-5 w-1/4" /></div>
                                </>
                           ) : (
                               <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Quiz terminés</span>
                                        <span className="font-bold">{stats.quizCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bonnes réponses</span>
                                        <span className="font-bold">{stats.totalCorrect}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Score moyen</span>
                                        <span className="font-bold">{stats.averageScore}%</span>
                                    </div>
                               </>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
