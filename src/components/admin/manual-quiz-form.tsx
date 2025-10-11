'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Control } from 'react-hook-form';
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
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { QuizDifficulty, UserSegment } from '@/lib/types';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';

const optionSchema = z.object({
  text: z.string().min(1, "Le texte de l'option ne peut pas être vide."),
});

const questionSchema = z.object({
  question: z.string().min(5, 'La question est trop courte.'),
  options: z.array(optionSchema).min(4, 'Il doit y avoir 4 options.').max(4, 'Il doit y avoir 4 options.'),
  correctAnswers: z.array(z.string()).min(1, 'Veuillez sélectionner au moins une bonne réponse.'),
  explanation: z.string().optional(),
});

const manualQuizFormSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  difficulty: z.enum(['facile', 'moyen', 'difficile'], { required_error: 'Veuillez choisir une difficulté.' }),
  segment: z.enum(['direct', 'professionnel'], { required_error: 'Veuillez choisir un segment.' }),
  premiumOnly: z.boolean().default(false),
  questions: z.array(questionSchema).min(1, 'Le quiz doit contenir au moins une question.'),
});

export type ManualQuizFormValues = z.infer<typeof manualQuizFormSchema>;

interface ManualQuizFormProps {
    onSubmit: (values: ManualQuizFormValues) => void;
    onCancel: () => void;
}

const QuestionFields = ({ control, index, remove }: { control: Control<ManualQuizFormValues>; index: number; remove: (index: number) => void; }) => {
    const { fields, append, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${index}.options`
    });
    
    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <Card className="relative bg-muted/30">
            <CardHeader>
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name={`questions.${index}.question`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Texte de la question</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name={`questions.${index}.correctAnswers`}
                    render={({ field }) => (
                        <FormItem>
                             <FormLabel>Bonnes réponses</FormLabel>
                            <FormDescription>Cochez la ou les bonnes réponses.</FormDescription>
                            <div className="flex flex-wrap gap-4 pt-2">
                                {optionLabels.map(label => (
                                     <FormField
                                        key={label}
                                        control={control}
                                        name={`questions.${index}.correctAnswers`}
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                                key={label}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(label)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...(field.value || []), label])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== label
                                                            )
                                                            )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Réponse {label}
                                                </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fields.map((item, optionIndex) => (
                        <FormField
                            key={item.id}
                            control={control}
                            name={`questions.${index}.options.${optionIndex}.text`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Option {optionLabels[optionIndex]}</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                 <FormField
                    control={control}
                    name={`questions.${index}.explanation`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Explication (Optionnel)</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Expliquez pourquoi la réponse est correcte..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}


export function ManualQuizForm({ onSubmit, onCancel }: ManualQuizFormProps) {
  const form = useForm<ManualQuizFormValues>({
    resolver: zodResolver(manualQuizFormSchema),
    defaultValues: {
      title: '',
      premiumOnly: false,
      questions: [],
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const addQuestion = () => {
    append({
        question: '',
        options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}],
        correctAnswers: [],
        explanation: '',
    });
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
         <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du Quiz</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Histoire du Burkina Faso" {...field} />
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

        <div className="space-y-4">
            {fields.map((field, index) => (
                <QuestionFields key={field.id} control={form.control} index={index} remove={remove} />
            ))}
        </div>

        <Button type="button" variant="outline" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une question
        </Button>
       
        <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4">
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Vérifier et Sauvegarder
            </Button>
        </div>
      </form>
    </Form>
  );
}
