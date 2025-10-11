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
import { Wand2 } from 'lucide-react';
import { QuizDifficulty, UserSegment } from '@/lib/types';
import { Switch } from '../ui/switch';

const formSchema = z.object({
  topic: z.string().min(3, { message: 'Le sujet doit contenir au moins 3 caractères.' }),
  difficulty: z.enum(['facile', 'moyen', 'difficile'], { required_error: 'Veuillez choisir une difficulté.' }),
  segment: z.enum(['direct', 'professionnel'], { required_error: 'Veuillez choisir un segment.' }),
  premiumOnly: z.boolean().default(false),
});

type GenerateQuizFormData = z.infer<typeof formSchema>;

interface GenerateQuizFormProps {
    onGenerate: (values: {topic: string; difficulty: QuizDifficulty, segment: UserSegment, premiumOnly: boolean}) => void;
    onCancel: () => void;
}

export function GenerateQuizForm({ onGenerate, onCancel }: GenerateQuizFormProps) {
  const form = useForm<GenerateQuizFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      premiumOnly: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onGenerate)} className="space-y-6 pt-4">
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet du Quiz</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Culture générale du Burkina Faso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulté</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir la difficulté" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="facile">Facile</SelectItem>
                    <SelectItem value="moyen">Moyen</SelectItem>
                    <SelectItem value="difficile">Difficile</SelectItem>
                  </SelectContent>
                </Select>
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
        </div>
        <FormField
          control={form.control}
          name="premiumOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Accès Premium</FormLabel>
                <FormDescription>
                  Ce quiz est-il réservé aux membres premium ?
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
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            <Button type="submit">
                <Wand2 className="mr-2 h-4 w-4" />
                Générer avec l'IA
            </Button>
        </div>
      </form>
    </Form>
  );
}
