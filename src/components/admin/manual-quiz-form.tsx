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
import { PlusCircle, Save, Trash2, Wand2, Loader2 } from 'lucide-react';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { generateQuizQuestions, GenerateQuizQuestionsInput } from '@/ai/flows/generate-quiz-questions';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useToast } from '@/hooks/use-toast';
import { InlineMath, BlockMath } from 'react-katex';

const optionSchema = z.object({
  text: z.string().min(1, "Le texte de l'option ne peut pas être vide."),
});

const questionSchema = z.object({
  question: z.string().min(1, 'La question ne peut pas être vide.'),
  options: z.array(optionSchema).min(4, 'Il doit y avoir 4 options.').max(4, 'Il doit y avoir 4 options.'),
  correctAnswers: z.array(z.string()).min(1, 'Veuillez sélectionner au moins une bonne réponse.'),
  explanation: z.string().optional(),
});

const manualQuizFormSchema = z.object({
  title: z.string().min(3, { message: 'Le titre doit contenir au moins 3 caractères.' }),
  difficulty: z.enum(['facile', 'moyen', 'difficile'], { required_error: 'Veuillez choisir une difficulté.' }),
  segment: z.enum(['direct', 'professionnel'], { required_error: 'Veuillez choisir un segment.' }),
  premiumOnly: z.boolean().default(false),
  durationMinutes: z.number().min(0, "La durée doit être un nombre positif.").optional(),
  questions: z.array(questionSchema).min(1, 'Le quiz doit contenir au moins une question.'),
});

export type ManualQuizFormValues = z.infer<typeof manualQuizFormSchema>;

interface ManualQuizFormProps {
    onSubmit: (values: ManualQuizFormValues) => void;
    onCancel: () => void;
}

const QuestionFields = ({ control, index, remove, onGenerateQuestion, getValues }: { control: Control<ManualQuizFormValues>; index: number; remove: (index: number) => void; onGenerateQuestion: (index: number, topic: string) => Promise<void>, getValues: any }) => {
    const { fields } = useFieldArray({
        control,
        name: `questions.${index}.options`
    });
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!aiTopic) {
            toast({ variant: 'destructive', title: 'Veuillez entrer un sujet pour la question.'})
            return;
        }
        setIsGenerating(true);
        await onGenerateQuestion(index, aiTopic);
        setIsGenerating(false);
    }
    
    const optionLabels = ['A', 'B', 'C', 'D'];
    const questionValue = getValues(`questions.${index}.question`);


    return (
        <Card className="relative bg-muted/30">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    <div className="flex items-center gap-2">
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" size="sm"><Wand2 className="mr-2 h-4 w-4" /> Générer avec IA</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="space-y-4">
                                    <FormLabel>Générer cette question par IA</FormLabel>
                                    <Input placeholder="Sujet de la question..." value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} />
                                    <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...</> : 'Générer la question'}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={control}
                    name={`questions.${index}.question`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Texte de la question</FormLabel>
                             <FormDescription>
                                Utilisez la syntaxe LaTeX pour les formules, ex: `\\(ax^2 + bx + c = 0\\)` pour une formule en ligne, et `$$...$$` pour un bloc.
                            </FormDescription>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                             {questionValue && <div className="p-2 border rounded-md bg-background text-sm"><BlockMath math={questionValue} /></div>}
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
                                        render={({ field: checkboxField }) => {
                                        return (
                                            <FormItem
                                                key={label}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                                <FormControl>
                                                <Checkbox
                                                    checked={checkboxField.value?.includes(label)}
                                                    onCheckedChange={(checked) => {
                                                    const currentValues = checkboxField.value || [];
                                                    return checked
                                                        ? checkboxField.onChange([...currentValues, label])
                                                        : checkboxField.onChange(
                                                            currentValues?.filter(
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
                                    {field.value && <div className="p-2 border rounded-md bg-background text-sm"><InlineMath math={field.value} /></div>}
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
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const { toast } = useToast();

  const addQuestion = () => {
    append({
        question: '',
        options: [{text: ''}, {text: ''}, {text: ''}, {text: ''}],
        correctAnswers: [],
        explanation: '',
    });
  }
  
  const handleGenerateQuestion = async (index: number, topic: string) => {
    const input: GenerateQuizQuestionsInput = {
      topic,
      difficulty: form.getValues('difficulty') || 'moyen',
      numberOfQuestions: 1
    };

    try {
        const result = await generateQuizQuestions(input);
        if (result.questions && result.questions.length > 0) {
            const newQuestion = result.questions[0];
            const correctAnswers = newQuestion.options.filter(o => o.is_correct).map(o => o.label);

            update(index, {
                question: newQuestion.question,
                options: newQuestion.options.map(o => ({ text: o.text })),
                correctAnswers: correctAnswers,
                explanation: newQuestion.explanation
            });
            toast({ title: 'Question générée !' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Erreur de génération', description: "L'IA n'a pas pu générer la question."})
    }
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
          name="durationMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Durée du quiz (en minutes)</FormLabel>
              <FormControl>
                <Input 
                    type="number" 
                    placeholder="Ex: 30" 
                    {...field} 
                    onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                    value={field.value ?? ''}
                />
              </FormControl>
               <FormDescription>
                Laissez vide pour un temps illimité.
              </FormDescription>
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
                <QuestionFields key={field.id} control={form.control} index={index} remove={remove} onGenerateQuestion={handleGenerateQuestion} getValues={form.getValues} />
            ))}
        </div>

        <Button type="button" variant="outline" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une question
        </Button>
       
        <div className="flex justify-end gap-2 sticky bottom-0 bg-background py-4">
            <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
            <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Sauvegarder le Quiz
            </Button>
        </div>
      </form>
    </Form>
  );
}
