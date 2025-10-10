'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

// This is a development-only component to surface friendly errors
export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // In a real app, you might use a toast or other UI element.
      // For this development environment, we throw to surface the error
      // in the Next.js development overlay, which is more noticeable.
      console.error(
        'A Firestore permission error occurred. See the error overlay for details.'
      );
      // We throw the error so Next.js can catch it and show the overlay.
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
