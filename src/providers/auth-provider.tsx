'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Profile } from '@/lib/types';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Set loading to false as soon as we know the auth state.
      // The profile will be loaded in the background.
      setLoading(false); 
      
      if (!firebaseUser) {
        setProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const profileRef = doc(db, 'profiles', user.uid);
      const unsubscribeProfile = onSnapshot(profileRef, 
        (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ id: docSnap.id, ...docSnap.data() } as Profile);
          } else {
            // This can happen briefly during signup before the profile doc is created.
            setProfile(null);
          }
        }, 
        (serverError) => {
          // If we can't read the profile, log the permission error but don't block the UI.
          setProfile(null);
          const permissionError = new FirestorePermissionError({
              path: profileRef.path,
              operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      );

      return () => unsubscribeProfile();
    } else {
      // Clear profile when user logs out
      setProfile(null);
    }
  }, [user]);

  const value = { user, profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </AuthContext.Provider>
  );
}
