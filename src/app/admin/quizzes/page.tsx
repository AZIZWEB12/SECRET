
// src/components/admin/QuizAdminPanel.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ClipboardList, PlusCircle, Trash2, Edit, Loader, Save, ArrowLeft, BrainCircuit, X, Sparkles
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Quiz,
  deleteQuizFromFirestore,
  saveQuizToFirestore,
  updateQuizInFirestore,
  NewQuizData,
  subscribeToQuizzes,
} from '@/lib/firestore.service';
// The quiz generation is performed on the server via an API route.
// Do NOT import server-only functions directly into client components.
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import MathText from '@/components/math-text';

const questionSchema = z.object({
  question: z.string().min(1, "La question est requise."),
  options: z.array(z.string().min(1, "L'option ne peut pas être vide.")).min(2, "Au moins deux options sont requises."),
  correctAnswers: z.array(z.string()).min(1, "Au moins une bonne réponse est requise."),
  explanation: z.string().optional(),
});

const quizFormSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  description: z.string().min(1, "La description est requise."),
  category: z.string().min(1, "La catégorie est requise."),
  difficulty: z.enum(['facile', 'moyen', 'difficile']),
  access_type: z.enum(['gratuit', 'premium']),
  duration_minutes: z.coerce.number().min(1, "La durée doit être d'au moins 1 minute."),
  isMockExam: z.boolean(),
  scheduledFor: z.date().optional(),
  questions: z.array(questionSchema).min(1, "Un quiz doit avoir au moins une question."),
}).refine(data => !data.isMockExam || !!data.scheduledFor, {
  message: "Un concours blanc doit avoir une date de programmation.",
  path: ["scheduledFor"],
});

type QuizFormData = z.infer<typeof quizFormSchema>;

const formatDateForInput = (date?: Date): string => {
    if (!date) return '';
    try {
        const d = new Date(date);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().slice(0, 16);
    } catch (e) {
        return '';
    }
};

const latexSnippets = {
  fraction: '\\frac{}{}',
  power: '^{}',
  index: '_{}',
  sqrt: '\\sqrt{}',
  sum: '\\sum_{k=1}^{n}',
  integral: '\\int_{a}^{b}',
  limit: '\\lim_{x \\to \\infty}',
  vector: '\\vec{}',
  alpha: '\\alpha',
  beta: '\\beta',
  theta: '\\theta',
};

type LatexSnippetKey = keyof typeof latexSnippets;

const MathToolbar = ({ onInsert }: { onInsert: (snippet: string) => void }) => {
  return (
    <div className="flex flex-wrap gap-1 p-2 rounded-md border bg-background mb-2">
      {(Object.keys(latexSnippets) as LatexSnippetKey[]).map((key) => (
        <Button
          key={key}
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onInsert(latexSnippets[key])}
          aria-label={`Insérer ${key}`}
        >
          <MathText text={latexSnippets[key].replace(/\{\}/g, '{•}').replace(/\\vec/g, '\\vec{F}')} />
        </Button>
      ))}
    </div>
  );
};


function AiGeneratorDialog({ open, onOpenChange, onGenerate, isGenerating, existingQuestionsCount = 0 }: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    onGenerate: (topic: string, numQuestions: number, difficulty: 'facile' | 'moyen' | 'difficile', mode: 'replace' | 'add', source: 'ai' | 'opentdb') => void,
    isGenerating: boolean,
    existingQuestionsCount?: number
}) {
    const [topic, setTopic] = useState('');
    const [category, setCategory] = useState('9');
    const [numQuestions, setNumQuestions] = useState('10');
    const [difficulty, setDifficulty] = useState<'facile' | 'moyen' | 'difficile'>('moyen');
    const [mode, setMode] = useState<'replace' | 'add'>('replace');
    const [source, setSource] = useState<'ai' | 'opentdb'>('ai');

    const opentdbCategories = [
        { id: '9', name: 'General Knowledge' },
        { id: '10', name: 'Entertainment: Books' },
        { id: '11', name: 'Entertainment: Film' },
        { id: '12', name: 'Entertainment: Music' },
        { id: '13', name: 'Entertainment: Musicals & Theatres' },
        { id: '14', name: 'Entertainment: Television' },
        { id: '15', name: 'Entertainment: Video Games' },
        { id: '16', name: 'Entertainment: Board Games' },
        { id: '17', name: 'Science & Nature' },
        { id: '18', name: 'Science: Computers' },
        { id: '19', name: 'Science: Mathematics' },
        { id: '20', name: 'Mythology' },
        { id: '21', name: 'Sports' },
        { id: '22', name: 'Geography' },
        { id: '23', name: 'History' },
        { id: '24', name: 'Politics' },
        { id: '25', name: 'Art' },
        { id: '26', name: 'Celebrities' },
        { id: '27', name: 'Animals' },
        { id: '28', name: 'Vehicles' },
        { id: '29', name: 'Entertainment: Comics' },
        { id: '30', name: 'Science: Gadgets' },
        { id: '31', name: 'Entertainment: Japanese Anime & Manga' },
        { id: '32', name: 'Entertainment: Cartoon & Animations' },
    ];

    const handleGenerate = () => {
        const input = source === 'ai' ? topic : category;
        if (!input) return;
        onGenerate(input, parseInt(numQuestions), difficulty, mode, source);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>🎯 Générer un Quiz avec l'IA</DialogTitle>
                    <DialogDescription>
                        Créez des quiz de haute qualité sur n'importe quel sujet éducatif.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="source">🔍 Source des questions</Label>
                        <Select value={source} onValueChange={(v) => setSource(v as 'ai' | 'opentdb')} disabled={isGenerating}>
                            <SelectTrigger id="source">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ai">🤖 Intelligence Artificielle</SelectItem>
                                <SelectItem value="opentdb">🌐 Open Trivia Database</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {source === 'ai' ? (
                        <div className="space-y-2">
                            <Label htmlFor="ai-topic">📚 Sujet du Quiz</Label>
                            <Input
                                id="ai-topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ex: Mathématiques, Français, Logique, Histoire..."
                                disabled={isGenerating}
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="category">📂 Catégorie Open Trivia</Label>
                            <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                                <SelectTrigger id="category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {opentdbCategories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-num-questions">🔢 Nombre de questions</Label>
                             <Select value={numQuestions} onValueChange={setNumQuestions} disabled={isGenerating}>
                               <SelectTrigger id="ai-num-questions">
                                   <SelectValue />
                               </SelectTrigger>
                               <SelectContent>
                                   <SelectItem value="5">5 Questions</SelectItem>
                                   <SelectItem value="10">10 Questions</SelectItem>
                                   <SelectItem value="15">15 Questions</SelectItem>
                                   <SelectItem value="20">20 Questions</SelectItem>
                                   <SelectItem value="25">25 Questions</SelectItem>
                                   <SelectItem value="30">30 Questions</SelectItem>
                                   <SelectItem value="40">40 Questions</SelectItem>
                                   <SelectItem value="50">50 Questions</SelectItem>
                               </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-difficulty">📊 Difficulté</Label>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)} disabled={isGenerating}>
                                <SelectTrigger id="ai-difficulty">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">🟢 Facile</SelectItem>
                                    <SelectItem value="moyen">🟡 Moyen</SelectItem>
                                    <SelectItem value="difficile">🔴 Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-mode">Mode de génération</Label>
                            <Select value={mode} onValueChange={(v) => setMode(v as 'replace' | 'add')} disabled={isGenerating}>
                                <SelectTrigger id="ai-mode">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="replace">🔄 Remplacer toutes les questions</SelectItem>
                                    <SelectItem value="add">➕ Ajouter aux questions existantes</SelectItem>
                                </SelectContent>
                            </Select>
                            {existingQuestionsCount > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    📊 Vous avez actuellement {existingQuestionsCount} question(s) dans ce quiz.
                                    {mode === 'add' ? ` Les nouvelles questions s'ajouteront pour faire ${existingQuestionsCount + parseInt(numQuestions)} questions.` : ' Toutes les questions seront remplacées.'}
                                </p>
                            )}
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                            <strong>💡 Conseil :</strong> Pour des quiz de concours, choisissez 10 questions de difficulté moyenne.
                            Utilisez "Ajouter" pour construire des quiz plus grands progressivement !
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>Annuler</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || (source === 'ai' ? !topic : !category)} className="bg-gradient-to-r from-purple-600 to-blue-600">
                        {isGenerating ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        {isGenerating ? 'Génération en cours...' : '🚀 Générer le Quiz'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function QuestionsForm({ qIndex, removeQuestion }: { qIndex: number, removeQuestion: (index: number) => void }) {
    const { control, register, watch, setValue, getValues, formState: { errors } } = useFormContext<QuizFormData>();
    
    const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `questions.${qIndex}.options`,
    });

    const questionOptions = watch(`questions.${qIndex}.options`);
    const correctAnswers = watch(`questions.${qIndex}.correctAnswers`) || [];

    const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);

    const insertToTextarea = (field: "question" | "explanation", snippet: string) => {
        const textarea = (activeTextareaRef.current?.name.endsWith(field)) ? activeTextareaRef.current : null;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentValue = textarea.value;
        const newValue = currentValue.substring(0, start) + snippet + currentValue.substring(end);

        setValue(`questions.${qIndex}.${field}`, newValue, { shouldValidate: true, shouldDirty: true });
        
        setTimeout(() => {
            textarea.focus();
            const cursorPos = start + snippet.indexOf('{}');
            if (cursorPos > start) {
                textarea.setSelectionRange(cursorPos, cursorPos);
            } else {
                textarea.setSelectionRange(start + snippet.length, start + snippet.length);
            }
        }, 0);
    };

    const handleCorrectAnswerChange = (optionValue: string) => {
        if (!optionValue) return;
        const isChecked = correctAnswers.includes(optionValue);
        const newCorrectAnswers = isChecked
            ? correctAnswers.filter((a: string) => a !== optionValue)
            : [...correctAnswers, optionValue];
        setValue(`questions.${qIndex}.correctAnswers`, newCorrectAnswers, { shouldValidate: true, shouldDirty: true });
    };
    
    const questionErrors = errors.questions?.[qIndex];
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="font-bold">Question {qIndex + 1}</h4>
                <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeQuestion(qIndex)}>
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </div>
            
            <div className="space-y-2">
                <Label>Texte de la question *</Label>
                <MathToolbar onInsert={(snippet) => insertToTextarea("question", snippet)} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea 
                        {...register(`questions.${qIndex}.question`)} 
                        onFocus={(e) => activeTextareaRef.current = e.target}
                        rows={6}
                    />
                    <div className="p-4 bg-background rounded-md border min-h-[140px]">
                        <Label className="text-sm text-muted-foreground">Aperçu</Label>
                        <div className="text-lg"><MathText text={watch(`questions.${qIndex}.question`)} isBlock /></div>
                    </div>
                </div>
                {questionErrors?.question && <p className="text-red-500 text-xs mt-1">{questionErrors.question.message}</p>}
            </div>

            <div className="space-y-2">
                <Label>Explication (optionnel)</Label>
                <MathToolbar onInsert={(snippet) => insertToTextarea("explanation", snippet)} />
                <div className="grid md:grid-cols-2 gap-4">
                    <Textarea 
                        {...register(`questions.${qIndex}.explanation`)} 
                        onFocus={(e) => activeTextareaRef.current = e.target}
                        rows={6}
                    />
                    <div className="p-4 bg-background rounded-md border min-h-[140px]">
                        <Label className="text-sm text-muted-foreground">Aperçu</Label>
                        <div className="text-base"><MathText text={watch(`questions.${qIndex}.explanation`)} isBlock /></div>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <Label>Options et Bonnes réponses *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendOption('')}>Ajouter Option</Button>
                </div>
                 {questionErrors?.options?.root && <p className="text-red-500 text-xs mt-1">{questionErrors.options.root.message}</p>}
                 {questionErrors?.correctAnswers && <p className="text-red-500 text-xs mt-1">{questionErrors.correctAnswers.message}</p>}

                <div className="space-y-2 mt-1">
                    {options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center gap-2">
                             <Checkbox
                                checked={correctAnswers.includes(questionOptions?.[optionIndex])}
                                onCheckedChange={() => handleCorrectAnswerChange(questionOptions?.[optionIndex])}
                                disabled={!questionOptions?.[optionIndex]}
                             />
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input {...register(`questions.${qIndex}.options.${optionIndex}`)} placeholder={`Option ${optionIndex + 1}`} />
                                <div className="p-2 border rounded-md bg-background text-sm flex items-center">
                                    <MathText text={watch(`questions.${qIndex}.options.${optionIndex}`)} />
                                </div>
                                {questionErrors?.options?.[optionIndex] && <p className="text-red-500 text-xs mt-1 col-span-2">{questionErrors.options[optionIndex].message}</p>}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => removeOption(optionIndex)}><X className="w-4 h-4"/></Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const QuizForm = ({ onFormSubmit, handleCloseDialog, handleOpenAiDialog }: { onFormSubmit: (data: QuizFormData) => void, handleCloseDialog: () => void, handleOpenAiDialog: () => void }) => {
    const { control, register, handleSubmit, watch, formState: { errors, isSubmitting } } = useFormContext<QuizFormData>();
    const { fields: questions, append: appendQuestion, remove: removeQuestion } = useFieldArray({ control, name: "questions" });
    const isMockExam = watch("isMockExam");
    
    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto pr-4 space-y-6">
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="title">Titre *</Label>
                    <Input {...register("title")} id="title" />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="description">Description *</Label>
                    <Input {...register("description")} id="description" />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Input {...register("category")} id="category"/>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label>Difficulté *</Label>
                    <Controller name="difficulty" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="facile">Facile</SelectItem><SelectItem value="moyen">Moyen</SelectItem><SelectItem value="difficile">Difficile</SelectItem></SelectContent>
                    </Select>
                    )}/>
                </div>
                <div className="space-y-1.5">
                    <Label>Accès *</Label>
                    <Controller name="access_type" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent><SelectItem value="gratuit">Gratuit</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent>
                    </Select>
                    )}/>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="duration_minutes">Durée (minutes) *</Label>
                    <Input type="number" {...register("duration_minutes")} id="duration_minutes" />
                    {errors.duration_minutes && <p className="text-red-500 text-xs mt-1">{errors.duration_minutes.message}</p>}
                </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                <Controller name="isMockExam" control={control} render={({ field }) => <Switch id="isMockExam" checked={field.value} onCheckedChange={field.onChange} />}/>
                <Label htmlFor="isMockExam">Concours Blanc</Label>
                </div>
                {isMockExam && (
                <div className="mt-4 space-y-1.5">
                    <Label>Date de programmation</Label>
                    <Controller name="scheduledFor" control={control} render={({ field }) => (
                    <Input type="datetime-local" value={formatDateForInput(field.value)} onChange={(e) => field.onChange(new Date(e.target.value))}/>
                    )}/>
                    {errors.scheduledFor && <p className="text-red-500 text-xs mt-1">{errors.scheduledFor.message}</p>}
                </div>
                )}
            </Card>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Questions</h3>
                    <div>
                        <Button type="button" variant="outline" size="sm" onClick={handleOpenAiDialog}>
                            <BrainCircuit className="w-4 h-4 mr-2"/> Générer avec l'IA
                        </Button>
                        <Button type="button" size="sm" className="ml-2" onClick={() => appendQuestion({ question: '', options: ['', ''], correctAnswers: [], explanation: '' })}>
                            <PlusCircle className="w-4 h-4 mr-2"/> Ajouter Question
                        </Button>
                    </div>
                </div>
                {errors.questions?.root && <p className="text-red-500 text-sm">{errors.questions.root.message}</p>}
                
                <div className="space-y-6">
                {questions.map((question, qIndex) => (
                    <Card key={question.id} className="bg-muted/50 p-4">
                        <QuestionsForm qIndex={qIndex} removeQuestion={removeQuestion} />
                    </Card>
                ))}
                </div>
            </div>
            </div>
            
            <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>Annuler</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <><Loader className="w-4 h-4 mr-2 animate-spin"/>Enregistrement...</> : <><Save className="w-4 h-4 mr-2"/>Enregistrer</>}
            </Button>
            </DialogFooter>
        </form>
    )
}

export default function QuizAdminPanel() {
  const { toast } = useToast();
  const router = useRouter();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuizFormOpen, setIsQuizFormOpen] = useState(false);
  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const formMethods = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      questions: [],
    },
  });
  
  const { reset, getValues } = formMethods;

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToQuizzes((fetchedQuizzes) => {
      setQuizzes(fetchedQuizzes);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const resetForm = useCallback(() => {
    reset({
      title: '',
      description: '',
      category: '',
      difficulty: 'moyen',
      access_type: 'gratuit',
      duration_minutes: 15,
      isMockExam: false,
      scheduledFor: undefined,
      questions: [],
    });
    setEditingQuiz(null);
  }, [reset]);

  const handleOpenDialog = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
      reset({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        access_type: quiz.access_type,
        duration_minutes: quiz.duration_minutes,
        isMockExam: quiz.isMockExam || false,
        scheduledFor: quiz.scheduledFor ? new Date(quiz.scheduledFor) : undefined,
        questions: (quiz.questions || []).map(q => ({
          question: q.question,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || '',
        })),
      });
    } else {
      resetForm();
    }
    setIsQuizFormOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsQuizFormOpen(false);
    resetForm();
  };

  const onFormSubmit = async (formData: QuizFormData) => {
    const quizData: NewQuizData = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      difficulty: formData.difficulty,
      access_type: formData.access_type,
      duration_minutes: formData.duration_minutes,
      isMockExam: formData.isMockExam,
      questions: formData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswers: q.correctAnswers,
        explanation: q.explanation,
      })),
      total_questions: formData.questions.length,
    };

    if (formData.isMockExam && formData.scheduledFor) {
      quizData.scheduledFor = formData.scheduledFor;
    }

    try {
      if (editingQuiz) {
        await updateQuizInFirestore(editingQuiz.id!, quizData as Partial<Quiz>);
      } else {
        await saveQuizToFirestore(quizData);
      }
      
      toast({ title: 'Succès', description: `Le quiz a été ${editingQuiz ? 'mis à jour' : 'enregistré'}.` });
      
      handleCloseDialog();
      // No need to fetch quizzes manually, listener will do it

    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        variant: 'destructive',
        title: 'Erreur d\'enregistrement',
        description: 'Une erreur est survenue lors de la sauvegarde du quiz.',
      });
    }
  };
  
  const handleDeleteQuiz = async (id: string) => {
    try {
      await deleteQuizFromFirestore(id);
      toast({ title: 'Succès', description: 'Le quiz a été supprimé.' });
      // No need to fetch quizzes manually, listener will do it
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de supprimer le quiz.' });
    }
  };

  const handleGenerateQuiz = async (input: string, numQuestions: number, difficulty: 'facile' | 'moyen' | 'difficile', mode: 'replace' | 'add', source: 'ai' | 'opentdb') => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: input, numberOfQuestions: numQuestions, difficulty, source }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const result = await res.json();
      const { quiz } = result;

      const currentValues = getValues();
      const existingQuestions = currentValues.questions || [];

      if (mode === 'add' && existingQuestions.length > 0) {
        // Ajouter les nouvelles questions aux existantes
        const newQuestions = (quiz.questions || []).map((q: any) => ({
          question: q.question,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation || '',
        }));

        formMethods.reset({
          ...currentValues,
          questions: [...existingQuestions, ...newQuestions],
        });

        toast({
          title: "Questions ajoutées !",
          description: `${numQuestions} nouvelle(s) question(s) ajoutée(s) sur "${input}". Total: ${existingQuestions.length + newQuestions.length} questions.`
        });
      } else {
        // Remplacer toutes les questions (mode par défaut)
        formMethods.reset({
          ...currentValues,
          title: quiz.title,
          description: quiz.description,
          category: quiz.category,
          difficulty: quiz.difficulty,
          duration_minutes: quiz.duration_minutes,
          questions: (quiz.questions || []).map((q: any) => ({
              question: q.question,
              options: q.options,
              correctAnswers: q.correctAnswers,
              explanation: q.explanation || '',
          })),
        });

        toast({ title: "Quiz généré !", description: `Un quiz sur "${input}" a été créé. Veuillez le vérifier avant de l'enregistrer.`});
      }

      setIsAiGeneratorOpen(false);
    } catch (error) {
      console.error('AI generation error:', error);
      toast({ variant: 'destructive', title: 'Erreur de génération', description: "L'IA n'a pas pu générer le quiz." });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <>
    <div className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black gradient-text">Gérer les Quiz</h1>
            <p className="text-sm sm:text-base text-gray-600 font-medium">Créez, modifiez ou supprimez des quiz.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold shadow-lg">
          <PlusCircle className="w-4 h-4 mr-2"/>
          Nouveau Quiz
        </Button>
      </div>
      
      <Card className="glassmorphism shadow-xl">
        <CardHeader>
          <CardTitle>Liste des quiz</CardTitle>
          <CardDescription>{quizzes.length} quiz disponibles.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader className="w-10 h-10 animate-spin text-purple-500"/></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Accès</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.category}</TableCell>
                    <TableCell>{quiz.total_questions}</TableCell>
                    <TableCell><Badge variant={quiz.access_type === 'premium' ? 'destructive' : 'default'}>{quiz.access_type}</Badge></TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(quiz)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id!)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isQuizFormOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingQuiz ? 'Modifier le Quiz' : 'Créer un nouveau Quiz'}</DialogTitle>
            <DialogDescription>Remplissez les détails ci-dessous. Les champs marqués d'un * sont obligatoires.</DialogDescription>
          </DialogHeader>
          <FormProvider {...formMethods}>
            <QuizForm 
                onFormSubmit={onFormSubmit}
                handleCloseDialog={handleCloseDialog}
                handleOpenAiDialog={() => setIsAiGeneratorOpen(true)}
            />
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
    <AiGeneratorDialog
      open={isAiGeneratorOpen}
      onOpenChange={setIsAiGeneratorOpen}
      onGenerate={handleGenerateQuiz}
      isGenerating={isGenerating}
      existingQuestionsCount={getValues().questions?.length || 0}
    />
    </>
  );
}
