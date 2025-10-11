'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { GenerateQuizForm } from './generate-quiz-form';
import {
  GenerateQuizQuestionsInput,
  GenerateQuizQuestionsOutput,
  generateQuizQuestions,
} from '@/ai/flows/generate-quiz-questions';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Quiz, QuizDifficulty, QuizQuestionData, UserSegment } from '@/lib/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ManualQuizForm, ManualQuizFormValues } from './manual-quiz-form';
import { ReviewQuiz } from './review-quiz';

interface AddQuizDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

type GeneratedData = {
  title: string;
  segment: UserSegment;
  difficulty: QuizDifficulty;
  premiumOnly: boolean;
  questions: QuizQuestionData[];
};

export function AddQuizDialog({ isOpen, onOpenChange }: AddQuizDialogProps) {
  const [step, setStep] = useState<'form' | 'generating' | 'review'>('form');
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const { toast } = useToast();

  const handleGenerate = async (values: {
    topic: string;
    difficulty: QuizDifficulty;
    segment: UserSegment;
    premiumOnly: boolean;
  }) => {
    setStep('generating');
    try {
      const input: GenerateQuizQuestionsInput = {
        topic: values.topic,
        difficulty: values.difficulty,
        numberOfQuestions: 5,
      };
      const result = await generateQuizQuestions(input);
      setGeneratedData({
        ...result,
        title: values.topic,
        segment: values.segment,
        difficulty: values.difficulty,
        premiumOnly: values.premiumOnly,
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
  
  const handleManualSubmit = (values: ManualQuizFormValues) => {
    setGeneratedData({
      title: values.title,
      segment: values.segment,
      difficulty: values.difficulty,
      premiumOnly: values.premiumOnly,
      questions: values.questions.map(q => ({
        question: q.question,
        options: q.options.map((opt, index) => ({
            label: ['A', 'B', 'C', 'D'][index],
            text: opt.text,
            is_correct: q.correctAnswers.includes(['A', 'B', 'C', 'D'][index]),
        })),
        explanation: q.explanation || '',
      }))
    });
    setStep('review');
  }

  const handleSaveQuiz = async () => {
    if (!generatedData) return;
    setStep('generating'); // Show loader while saving

    try {
      const quizCollectionRef = collection(db, 'quizzes');
      const newQuizData = {
        ...generatedData,
        createdAt: serverTimestamp(),
      };

      await addDoc(quizCollectionRef, newQuizData);

      toast({
        title: 'Quiz sauvegardé !',
        description: 'Le nouveau quiz a été ajouté à la collection.',
      });
      handleClose();
    } catch (error) {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'quizzes',
          operation: 'create',
        })
      );
      setStep('review'); // Go back to review step on error
    }
  };

  const handleClose = () => {
    setStep('form');
    setGeneratedData(null);
    onOpenChange(false);
  };
  
  const handleBackToForm = () => {
    setStep('form');
    setGeneratedData(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && 'Créer un nouveau quiz'}
            {step === 'generating' && 'Opération en cours...'}
            {step === 'review' && `Révision du quiz : ${generatedData?.title}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && 'Choisissez de générer un quiz avec l\'IA ou de le créer manuellement.'}
            {step === 'generating' && 'Veuillez patienter...'}
            {step === 'review' && 'Vérifiez les informations et les questions avant de sauvegarder.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai"><Wand2 className="mr-2 h-4 w-4" />Générer avec l'IA</TabsTrigger>
              <TabsTrigger value="manual">Créer Manuellement</TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              <GenerateQuizForm onGenerate={handleGenerate} onCancel={handleClose} />
            </TabsContent>
            <TabsContent value="manual">
                <ManualQuizForm onSubmit={handleManualSubmit} onCancel={handleClose} />
            </TabsContent>
          </Tabs>
        )}

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Veuillez patienter...</p>
          </div>
        )}

        {step === 'review' && generatedData && (
          <ReviewQuiz 
            quizData={generatedData} 
            onSave={handleSaveQuiz}
            onCancel={handleClose}
            onBack={handleBackToForm}
          />
        )}

        {/* Hide default footer when on form step */}
        {step !== 'form' && step !== 'review' && (
             <Button variant="outline" onClick={handleClose}>Annuler</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
