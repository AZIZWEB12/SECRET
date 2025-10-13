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
import { PdfForm, PdfFormValues } from './pdf-form';
import { addDocumentToFirestore } from '@/lib/firestore.service';

interface AddPdfDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPdfAdded: () => void;
}

export function AddPdfDialog({ isOpen, onOpenChange, onPdfAdded }: AddPdfDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (values: PdfFormValues) => {
    setIsSaving(true);
    
    try {
      await addDocumentToFirestore({
        ...values,
        type: 'pdf',
      });

      toast({
        title: 'PDF sauvegardé !',
        description: 'Le nouveau PDF a été ajouté à la collection.',
      });
      onPdfAdded();
      handleClose();
    } catch (error) {
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
