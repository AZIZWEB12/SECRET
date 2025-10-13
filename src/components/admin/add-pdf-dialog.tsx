'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PdfForm, PdfFormValues } from './pdf-form';

interface AddPdfDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddPdfDialog({ isOpen, onOpenChange }: AddPdfDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (values: PdfFormValues) => {
    setIsSaving(true);
    
    try {
      const collectionRef = collection(db, 'pdfs');
      const newDocData = {
        ...values,
        createdAt: serverTimestamp(),
      };

      await addDoc(collectionRef, newDocData);

      toast({
        title: 'PDF sauvegardé !',
        description: 'Le nouveau PDF a été ajouté à la collection.',
      });
      handleClose();
    } catch (error) {
       errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'pdfs',
          operation: 'create',
        })
      );
      toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder le PDF. Vérifiez vos permissions.',
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Ajouter un nouveau PDF
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous pour ajouter un PDF.
          </DialogDescription>
        </DialogHeader>

        <PdfForm 
            isSaving={isSaving}
            onSubmit={handleSave} 
            onCancel={handleClose} 
        />

      </DialogContent>
    </Dialog>
  );
}

    