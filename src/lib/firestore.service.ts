// src/lib/firestore.service.ts
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, doc, updateDoc, query, where, orderBy, deleteDoc, serverTimestamp, getDoc, writeBatch, limit, onSnapshot } from 'firebase/firestore';


/**
 * Parses Firestore date fields into JavaScript Date objects.
 * Handles Timestamp, serialized Timestamp, and fallback to current date.
 * This function should be exported to be used across the application.
 */
export const parseFirestoreDate = (dateField: any): Date => {
  if (!dateField) return new Date(); // Fallback to now if null/undefined
  if (dateField instanceof Timestamp) {
    return dateField.toDate();
  }
  // This handles the case where the data is serialized from server components
  if (dateField.seconds && dateField.nanoseconds !== undefined) {
    return new Timestamp(dateField.seconds, dateField.nanoseconds).toDate();
  }
  // This handles cases where it might already be a Date object or a string
  if (dateField instanceof Date) return dateField;
  if (typeof dateField === 'string') return new Date(dateField);
  return new Date(); // Final fallback
};


// #region -------- TYPE DEFINITIONS --------

export interface AppUser {
  uid: string;
  displayName?: string;
  email: string;
  phone: string;
  competitionType: 'direct' | 'professionnel';
  role: 'user' | 'admin';
  subscription_type: 'gratuit' | 'premium';
  subscription_tier?: 'mensuel' | 'annuel';
  subscription_expires_at?: Date | Timestamp | null;
  photoURL?: string;
  preferences?: {
    preferredCategory?: string;
    notificationsEnabled?: boolean;
    theme?: string;
  };
  streakDays?: number;
  createdAt: any;
  lastLoginAt?: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  access_type: 'gratuit' | 'premium';
  duration_minutes: number;
  isMockExam: boolean;
  scheduledFor?: any;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
    type?: 'multiple_choice' | 'true_false';
  }>;
  total_questions: number;
  createdBy?: string;
  createdAt: any;
  updatedAt?: any;
  attemptCount?: number;
}
export type NewQuizData = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'attemptCount' | 'total_questions'> & { total_questions?: number };


export interface LibraryDocument {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  category: string;
  access_type: 'gratuit' | 'premium';
  url: string;
  fileSize?: number;
  thumbnailUrl?: string;
  summary?: string;
  createdBy?: string;
  createdAt: any;
}
export type LibraryDocumentFormData = Omit<LibraryDocument, 'id' | 'createdAt' | 'createdBy' | 'summary' | 'fileSize'>;

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number; // This is the correctCount
  totalQuestions: number;
  percentage: number;
  details: {
    [key: number]: {
      question: string;
      selected: string[];
      correct: string[];
      explanation: string;
    }
  };
  timeTaken?: number;
  createdAt: any;
}


export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  description: string;
  href: string;
  isRead: boolean;
  createdAt: any;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: any;
  endDate: any;
  paymentId?: string;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 'quiz_attempt' | 'document_view' | 'login' | 'signup';
  data: object;
  timestamp: any;
}

export interface Transaction {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  approvedAt?: any;
}


export interface Formation {
  id: string;
  title: string;
  description: string;
  premiumOnly: boolean;
  createdAt: any;
}

// #endregion


// #region -------- QUIZ FUNCTIONS --------

export const subscribeToQuizzes = (callback: (quizzes: Quiz[]) => void): (() => void) => {
  const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const quizzes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
        updatedAt: data.updatedAt ? parseFirestoreDate(data.updatedAt) : undefined,
        scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
      } as Quiz;
    });
    callback(quizzes);
  });
};

export const saveQuizToFirestore = async (quizData: NewQuizData): Promise<string> => {
  const docRef = await addDoc(collection(db, "quizzes"), {
    ...quizData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateQuizInFirestore = async (quizId: string, quizData: Partial<Quiz>): Promise<void> => {
  const quizDocRef = doc(db, 'quizzes', quizId);
  await updateDoc(quizDocRef, {
    ...quizData,
    updatedAt: serverTimestamp()
  });
};

export const deleteQuizFromFirestore = async (quizId: string): Promise<void> => {
  await deleteDoc(doc(db, "quizzes", quizId));
};

export const getQuizByIdFromFirestore = async (quizId: string): Promise<Quiz | null> => {
  const docSnap = await getDoc(doc(db, "quizzes", quizId));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: parseFirestoreDate(data.createdAt),
    updatedAt: data.updatedAt ? parseFirestoreDate(data.updatedAt) : undefined,
    scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
  } as Quiz;
};

// #endregion


// #region -------- USER FUNCTIONS --------

export const getUsersFromFirestore = async (): Promise<AppUser[]> => {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      uid: doc.id,
      ...data,
      createdAt: parseFirestoreDate(data.createdAt),
      lastLoginAt: data.lastLoginAt ? parseFirestoreDate(data.lastLoginAt) : undefined,
    } as AppUser;
  });
};

export const updateUserRoleInFirestore = async (uid: string, role: 'admin' | 'user'): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role });
};

export const updateUserSubscriptionInFirestore = async (uid: string, subscription: { type: 'gratuit' | 'premium', tier: 'mensuel' | 'annuel' | null }) => {
    const userDocRef = doc(db, 'users', uid);
    const updateData: Partial<AppUser> = {};

    updateData.subscription_type = subscription.type;
    
    if (subscription.type === 'premium') {
        const now = new Date();
        if (subscription.tier === 'mensuel') {
            updateData.subscription_expires_at = new Date(now.setMonth(now.getMonth() + 1));
        } else if (subscription.tier === 'annuel') {
            updateData.subscription_expires_at = new Date(now.setFullYear(now.getFullYear() + 1));
        }
        updateData.subscription_tier = subscription.tier || undefined;
    } else {
        // If setting to 'gratuit', clear expiry and tier
        updateData.subscription_expires_at = null;
        updateData.subscription_tier = undefined;
    }

    await updateDoc(userDocRef, updateData as any);
};



// #endregion


// #region -------- ATTEMPT FUNCTIONS --------

export const saveAttemptToFirestore = async (attemptData: Omit<Attempt, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, "attempts"), {
    ...attemptData
  });
  return docRef.id;
};


export const getAttemptsFromFirestore = async (userId: string): Promise<Attempt[]> => {
  const attemptsRef = collection(db, "attempts");
  const q = query(attemptsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: parseFirestoreDate(data.createdAt),
    } as Attempt;
  });
};

// #endregion


// #region -------- DOCUMENT FUNCTIONS --------

export const getDocumentsFromFirestore = async (): Promise<LibraryDocument[]> => {
  const q = query(collection(db, "documents"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: parseFirestoreDate(data.createdAt),
    } as LibraryDocument;
  });
};

export const addDocumentToFirestore = async (documentData: LibraryDocumentFormData): Promise<void> => {
  await addDoc(collection(db, "documents"), {
    ...documentData,
    createdAt: serverTimestamp(),
  });
};

export const deleteDocumentFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "documents", id));
};

// #endregion

// #region -------- FORMATION FUNCTIONS --------

export const subscribeToFormations = (callback: (formations: Formation[]) => void): (() => void) => {
  const q = query(collection(db, "formations"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (querySnapshot) => {
    const formations = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
      } as Formation;
    });
    callback(formations);
  });
};

export const deleteFormationFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, "formations", id));
};


// #endregion


// #region -------- NOTIFICATION FUNCTIONS --------

export const subscribeToUserNotifications = (userId: string, callback: (notifications: AppNotification[]) => void): (() => void) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: parseFirestoreDate(doc.data().createdAt),
    } as AppNotification));
    callback(notifications);
  }, (error) => {
    console.error("Error subscribing to notifications: ", error);
    callback([]);
  });
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notifDocRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifDocRef, { isRead: true });
};

export const deleteNotificationFromFirestore = async (notificationId: string): Promise<void> => {
  await deleteDoc(doc(db, "notifications", notificationId));
};

// #endregion
