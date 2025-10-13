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
import { VideoForm, VideoFormValues } from './video-form';

interface AddVideoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddVideoDialog({ isOpen, onOpenChange }: AddVideoDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async (values: VideoFormValues) => {
    setIsSaving(true);
    
    try {
      const collectionRef = collection(db, 'documents');
      const newDocData = {
        title: values.title,
        category: values.category,
        access_type: values.access_type,
        url: values.url,
        thumbnailUrl: values.thumbnailUrl,
        type: 'video',
        createdAt: serverTimestamp(),
      };

      await addDoc(collectionRef, newDocData);

      toast({
        title: 'Vidéo sauvegardée !',
        description: 'La nouvelle vidéo a été ajoutée à la collection.',
      });
      handleClose();
    } catch (error) {
       errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: 'documents',
          operation: 'create',
        })
      );
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
