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
import { QuizAccessType } from '@/lib/types';

const pdfFormSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  category: z.string().min(2, { message: 'La catégorie est requise.'}),
  access_type: z.enum(['gratuit', 'premium'], { required_error: "Veuillez choisir un type d'accès." }),
  url: z.string().url({ message: "Veuillez entrer une URL valide."}),
});

export type PdfFormValues = z.infer<typeof pdfFormSchema>;

interface PdfFormProps {
    onSubmit: (values: PdfFormValues) => void;
    onCancel: () => void;
    isSaving: boolean;
    initialValues?: Partial<PdfFormValues>;
}

export function PdfForm({ onSubmit, onCancel, isSaving, initialValues }: PdfFormProps) {
  const form = useForm<PdfFormValues>({
    resolver: zodResolver(pdfFormSchema),
    defaultValues: initialValues || {
      title: '',
      category: '',
      access_type: 'gratuit',
      url: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
         <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du PDF</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Annales de Droit 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL du fichier PDF</FormLabel>
               <FormDescription>Collez le lien direct vers le fichier PDF (ex: depuis Google Drive, Dropbox, etc.)</FormDescription>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <FormControl>
                    <Input placeholder="Ex: Culture générale" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
       
        <FormField
          control={form.control}
          name="access_type"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Type d'accès</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gratuit">Gratuit</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
