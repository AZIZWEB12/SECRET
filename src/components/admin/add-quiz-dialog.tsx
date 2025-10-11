'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { GenerateQuizForm } from './generate-quiz-form';
import {
  GenerateQuizQuestionsInput,
  GenerateQuizQuestionsOutput,
} from '@/ai/flows/generate-quiz-questions';
import { generateQuizQuestions } from '@/ai/flows/generate-quiz-questions';
import { Loader2, Wand2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Quiz, QuizDifficulty, UserSegment } from '@/lib/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface AddQuizDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddQuizDialog({ isOpen, onOpenChange }: AddQuizDialogProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'review'>('form');
  const [generatedData, setGeneratedData] = useState<
    (GenerateQuizQuestionsOutput & { title: string; segment: UserSegment; difficulty: QuizDifficulty }) | null
  >(null);
  const { toast } = useToast();

  const handleGenerate = async (values: {
    topic: string;
    difficulty: QuizDifficulty;
    segment: UserSegment;
  }) => {
    setStep('generating');
    try {
      const input: GenerateQuizQuestionsInput = {
        topic: values.topic,
        difficulty: values.difficulty,
        numberOfQuestions: 5, // You can make this configurable
      };
      const result = await generateQuizQuestions(input);
      setGeneratedData({
        ...result,
        title: values.topic,
        segment: values.segment,
        difficulty: values.difficulty,
      });
      setStep('review');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de génération',
        description: "L'IA n'a pas pu générer le quiz. Veuillez réessayer.",
      });
      setStep('form');
    }
  };

    const handleSaveQuiz = async () => {
        if (!generatedData) return;
        setStep('generating'); // Show loader while saving

        try {
            const quizCollectionRef = collection(db, 'quizzes');
            const newQuizData = {
                title: generatedData.title,
                segment: generatedData.segment,
                difficulty: generatedData.difficulty,
                questions: generatedData.questions,
                createdAt: serverTimestamp(),
            };
            
            await addDoc(quizCollectionRef, newQuizData);

            toast({
                title: 'Quiz sauvegardé !',
                description: 'Le nouveau quiz a été ajouté à la collection.',
            });
            handleClose();
        } catch (error) {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: 'quizzes',
                operation: 'create',
            }));
            setStep('review'); // Go back to review step on error
        }
    }


  const handleClose = () => {
    setStep('form');
    setGeneratedData(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Créer un nouveau quiz'}
            {step === 'generating' && 'Génération en cours...'}
            {step === 'review' && `Révision du quiz : ${generatedData?.title}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Utilisez l\'IA pour générer automatiquement les questions de votre quiz.'}
            {step === 'generating' && 'Veuillez patienter pendant que l\'IA prépare votre quiz.'}
            {step === 'review' && 'Vérifiez les questions générées avant de sauvegarder le quiz.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && <GenerateQuizForm onGenerate={handleGenerate} />}
        
        {step === 'generating' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Création des questions...</p>
            </div>
        )}

        {step === 'review' && generatedData && (
             <div className="max-h-[60vh] overflow-y-auto p-1 pr-4 space-y-4">
                {generatedData.questions.map((q, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                            <CardDescription>{q.question}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-2 text-sm">
                                {q.options.map(opt => (
                                    <li key={opt.label} className={`p-2 rounded-md ${opt.is_correct ? 'bg-green-100' : ''}`}>
                                        <strong>{opt.label}:</strong> {opt.text}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-4 text-xs text-muted-foreground italic">
                                <strong>Explication :</strong> {q.explanation}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}

        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Annuler</Button>
             {step === 'review' && (
                <Button onClick={handleSaveQuiz}>
                    <Save className="mr-2 h-4 w-4" />
                    Sauvegarder le Quiz
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
