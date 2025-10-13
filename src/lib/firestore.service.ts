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
  fullName: string;
  email: string;
  phone: string;
  competitionType: 'direct' | 'professionnel';
  role: 'user' | 'admin';
  subscription_type: 'gratuit' | 'premium';
  profilePictureUrl?: string;
  preferences?: {
    preferredCategory?: string;
    notificationsEnabled?: boolean;
    theme?: string;
  };
  streakDays?: number;
  createdAt: Date;
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
  scheduledFor?: Date;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
    type: 'multiple_choice' | 'true_false';
  }>;
  total_questions: number;
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  attemptCount?: number;
}
export type NewQuizData = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'attemptCount'>;

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
  createdBy: string;
  createdAt: Date;
}
export type LibraryDocumentFormData = Omit<LibraryDocument, 'id' | 'createdAt' | 'createdBy' | 'summary' | 'fileSize'>;

export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: Array<{
    questionIndex: number;
    selectedAnswers: string[];
    isCorrect: boolean;
  }>;
  timeTaken?: number;
  createdAt: Date;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  paymentId?: string;
}

export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: 'quiz_attempt' | 'document_view' | 'login' | 'signup';
  data: object;
  timestamp: Date;
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

export const updateQuizInFirestore = async (quizId: string, quizData: Partial<NewQuizData>): Promise<void> => {
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

export const updateUserSubscriptionInFirestore = async (uid: string, type: 'gratuit' | 'premium'): Promise<void> => {
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { subscription_type: type });
};


// #endregion


// #region -------- ATTEMPT FUNCTIONS --------

export const saveAttemptToFirestore = async (attemptData: Omit<Attempt, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, "attempts"), {
    ...attemptData,
    createdAt: serverTimestamp()
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
