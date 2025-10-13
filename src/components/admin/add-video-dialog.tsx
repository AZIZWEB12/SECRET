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
import { VideoForm, VideoFormValues } from './video-form';
import { addDocumentToFirestore } from '@/lib/firestore.service';

interface AddVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onVideoAdded: () => void;
}

export function AddVideoDialog({ isOpen, onOpenChange, onVideoAdded }: AddVideoDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (values: VideoFormValues) => {
    setIsSaving(true);
    
    try {
      await addDocumentToFirestore({
        ...values,
        type: 'video',
      });

      toast({
        title: 'Vidéo sauvegardée !',
        description: 'La nouvelle vidéo a été ajoutée à la collection.',
      });
      onVideoAdded();
      handleClose();
    } catch (error) {
       toast({
        title: 'Erreur de sauvegarde',
        description: 'Impossible de sauvegarder la vidéo. Vérifiez vos permissions.',
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
            Ajouter une nouvelle vidéo
          </DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous pour ajouter une vidéo.
          </DialogDescription>
        </DialogHeader>

        <VideoForm 
            isSaving={isSaving}
            onSubmit={handleSave} 
            onCancel={handleClose} 
        />

      </DialogContent>
    </Dialog>
  );
}
