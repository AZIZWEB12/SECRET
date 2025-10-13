'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { Switch } from '../ui/switch';

const videoFormSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  segment: z.enum(['direct', 'professionnel'], { required_error: 'Veuillez choisir un segment.' }),
  premiumOnly: z.boolean().default(false),
  videoUrl: z.string().url({ message: "Veuillez entrer une URL de vidéo valide."}),
  thumbnailUrl: z.string().url({ message: "Veuillez entrer une URL de miniature valide."}).optional().or(z.literal('')),
});

export type VideoFormValues = z.infer<typeof videoFormSchema>;

interface VideoFormProps {
    onSubmit: (values: VideoFormValues) => void;
    onCancel: () => void;
    isSaving: boolean;
    initialValues?: Partial<VideoFormValues>;
}

function getYouTubeThumbnail(url: string): string | undefined {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length == 11) {
        return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    } 
    return undefined;
}


export function VideoForm({ onSubmit, onCancel, isSaving, initialValues }: VideoFormProps) {
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: initialValues || {
      title: '',
      premiumOnly: false,
      videoUrl: '',
      thumbnailUrl: '',
    },
  });

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      form.setValue('videoUrl', url);
      const thumb = getYouTubeThumbnail(url);
      if(thumb && !form.getValues('thumbnailUrl')){
        form.setValue('thumbnailUrl', thumb);
      }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
         <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de la vidéo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Corrigé de l'épreuve de..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la vidéo</FormLabel>
               <FormDescription>Collez le lien de la vidéo (ex: YouTube, Vimeo).</FormDescription>
              <FormControl>
                <Input placeholder="https://www.youtube.com/watch?v=..." {...field} onChange={handleUrlChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la miniature (Optionnel)</FormLabel>
               <FormDescription>Lien vers une image. Si c'est un lien YouTube, la miniature est générée automatiquement.</FormDescription>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              {form.getValues('thumbnailUrl') && <img src={form.getValues('thumbnailUrl')} alt="Aperçu" className="mt-2 rounded-md aspect-video object-cover" />}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="segment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir le segment" />
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
       
        <FormField
          control={form.control}
          name="premiumOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Accès Premium</FormLabel>
                <FormDescription>
                  Cette vidéo est-elle réservée aux membres premium ?
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
       
        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Annuler</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
                Sauvegarder
            </Button>
        </div>
      </form>
    </Form>
  );
}

    