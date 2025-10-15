
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
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false); 
      if (!firebaseUser) {
        setProfile(null);
        setProfileLoading(false); 
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
            
            // Ensure subscription_type is an object, providing a default if it's a string (for old data)
            let subscription_type = data.subscription_type;
            if (typeof subscription_type === 'string') {
              subscription_type = { type: subscription_type, tier: undefined };
            }


            setProfile({
              uid: docSnap.id,
              ...data,
              subscription_type: subscription_type || { type: 'gratuit' },
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
      // If there's no user, there's no profile to load.
      setProfileLoading(false);
    }
  }, [user]);

  const loading = authLoading || profileLoading;

  const value = useMemo(() => ({
     user,
     profile,
     loading,
  }), [user, profile, loading]);


  return (
    <AuthContext.Provider value={value}>
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
      {children}
    </AuthContext.Provider>
  );
}
