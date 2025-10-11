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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuizQuestionData } from '@/lib/types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ManualQuizForm, ManualQuizFormValues } from './manual-quiz-form';

interface AddQuizDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddQuizDialog({ isOpen, onOpenChange }: AddQuizDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveQuiz = async (values: ManualQuizFormValues) => {
    setIsSaving(true);
    
    const questions: QuizQuestionData[] = values.questions.map(q => ({
      question: q.question,
      options: q.options.map((opt, index) => ({
          label: ['A', 'B', 'C', 'D'][index],
          text: opt.text,
          is_correct: q.correctAnswers.includes(['A', 'B', 'C', 'D'][index]),
      })),
      explanation: q.explanation || '',
    }));

    try {
      const quizCollectionRef = collection(db, 'quizzes');
      const newQuizData = {
        title: values.title,
        segment: values.segment,
        difficulty: values.difficulty,
        premiumOnly: values.premiumOnly,
        durationMinutes: values.durationMinutes,
        questions: questions,
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
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder le quiz. Vérifiez vos permissions.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Créer un nouveau quiz
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous pour créer un quiz manuellement.
          </DialogDescription>
        </DialogHeader>

        {isSaving ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Sauvegarde en cours...</p>
            </div>
        ) : (
            <ManualQuizForm onSubmit={handleSaveQuiz} onCancel={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}
