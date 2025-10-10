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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { UserSegment } from "@/lib/types";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Le nom est trop court."),
  phone: z.string().min(8, "Le numéro de téléphone est trop court."),
  segment: z.enum(["direct", "professionnel"]),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, reset } = useForm<ProfileFormData>({
      resolver: zodResolver(profileFormSchema),
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (profile) {
            reset({
                displayName: profile.displayName || '',
                phone: profile.phone || '',
                segment: profile.segment,
            });
        }
    }, [user, profile, loading, router, reset]);

    const getInitials = (name?: string | null) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const onSubmit = async (data: ProfileFormData) => {
      if (!user) return;
      setIsSubmitting(true);
      
      const profileRef = doc(db, 'profiles', user.uid);
      const updatedData = {
        displayName: data.displayName,
        phone: data.phone,
        segment: data.segment,
      };

      updateDoc(profileRef, updatedData)
        .then(() => {
          toast({ title: "Profil mis à jour avec succès!" });
        })
        .catch(async (serverError) => {
            if (serverError.code === 'permission-denied') {
                 const permissionError = new FirestorePermissionError({
                    path: profileRef.path,
                    operation: 'update',
                    requestResourceData: updatedData
                });
                errorEmitter.emit('permission-error', permissionError);
            } else {
                toast({ title: "Erreur", description: "La mise à jour du profil a échoué.", variant: "destructive" });
            }
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    if (loading || !user) {
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
                        <AvatarFallback className="text-3xl">{getInitials(profile?.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold font-headline">{profile?.displayName}</h1>
                        <p className="text-muted-foreground">{user.phoneNumber || profile?.phone}</p>
                        <div className="mt-2 flex items-center gap-2 justify-center md:justify-start">
                            <Badge variant={profile?.isPremium ? "default" : "secondary"}>
                                {profile?.isPremium ? "Premium" : "Gratuit"}
                            </Badge>
                            <Badge variant="outline">{profile?.segment === 'direct' ? 'Concours Direct' : 'Concours Professionnel'}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Modifier le profil</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Controller
                                    name="displayName"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName">Nom complet</Label>
                                            <Input id="displayName" {...field} />
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Numéro de téléphone</Label>
                                            <Input id="phone" {...field} placeholder="+226 XX XX XX XX"/>
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="segment"
                                    control={control}
                                    render={({ field }) => (
                                      <div className="space-y-2">
                                        <Label>Segment d'apprentissage</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="direct">Concours Direct</SelectItem>
                                                <SelectItem value="professionnel">Concours Professionnel</SelectItem>
                                            </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Enregistrer les modifications
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                            <CardDescription>Votre performance globale.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Quiz terminés</span>
                                <span className="font-bold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bonnes réponses</span>
                                <span className="font-bold">0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Score moyen</span>
                                <span className="font-bold">0%</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-4">Les statistiques réelles seront bientôt disponibles.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
