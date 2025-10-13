'use client';

import { createContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser, parseFirestoreDate } from '@/lib/firestore.service';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  initialAuthLoaded: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [initialAuthLoaded, setInitialAuthLoaded] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitialAuthLoaded(true); // Auth state is now determined (user or null)
      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false); // No profile to load
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      const profileRef = doc(db, 'users', user.uid);
      const unsubscribeProfile = onSnapshot(
        profileRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as DocumentData;
            setProfile({
              uid: docSnap.id,
              ...data,
              createdAt: parseFirestoreDate(data.createdAt),
              lastLoginAt: data.lastLoginAt ? parseFirestoreDate(data.lastLoginAt) : undefined,
            } as AppUser);
          } else {
            setProfile(null);
          }
          setProfileLoading(false);
        },
        (err) => {
          console.error("Error fetching profile:", err);
          errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
              path: profileRef.path,
              operation: 'get',
            })
          );
          setProfile(null);
          setProfileLoading(false);
        }
      );
      return () => unsubscribeProfile();
    } else {
      setProfile(null);
      setProfileLoading(false);
    }
  }, [user]);

  // The overall loading state is true if we are waiting for the initial auth state
  // OR if we have a user but are still waiting for their profile to load.
  const loading = !initialAuthLoaded || profileLoading;

  const value = useMemo(() => ({
     user,
     profile,
     loading,
     initialAuthLoaded
  }), [user, profile, loading, initialAuthLoaded]);


  return (
    <AuthContext.Provider value={value}>
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </AuthContext.Provider>
  );
}
