
import { db } from './firebase';
import { collection, addDoc, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, doc, updateDoc, query, where, orderBy, deleteDoc, serverTimestamp, getDoc, writeBatch, limit, onSnapshot } from 'firebase/firestore';

/**
 * Define the structure of a Quiz document
 */
export interface Quiz {
  id?: string;
  title: string;
  description: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswers: string[];
    explanation?: string;
  }>;
  category: string;
  difficulty: 'facile' | 'moyen' | 'difficile';
  access_type: 'gratuit' | 'premium';
  duration_minutes: number;
  total_questions: number;
  createdAt: Date;
  isMockExam?: boolean;
  scheduledFor?: Date;
}

/**
 * Define the structure of a User document from Firestore
 */
export interface AppUser {
  uid: string;
  fullName?: string;
  email?: string;
  phone?: string;
  competitionType?: string;
  createdAt: Date;
  role?: 'admin' | 'user';
  subscription_type?: 'premium' | 'gratuit';
  subscription_tier?: 'mensuel' | 'annuel';
  subscription_expires_at?: Date | Timestamp | null;
  photoURL?: string;
}

/**
 * Define the structure of an Attempt document
 */
export interface Attempt {
  id?: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correctCount: number;
  createdAt: Date;
  details?: Record<string, { 
      question: string;
      selected: string[];
      correct: string[];
      explanation: string;
  }>;
}

/**
 * Define the structure of a Library Document
 */
export interface LibraryDocument {
  id: string;
  title: string;
  type: 'pdf' | 'video';
  access_type: 'gratuit' | 'premium';
  category: string;
  url: string; // URL to the file in Firebase Storage
  thumbnailUrl?: string;
  createdAt: Date;
}

export type LibraryDocumentFormData = Omit<LibraryDocument, 'id' | 'createdAt'>;

/**
 * Type for creating a new quiz. `id` and `createdAt` are handled by Firestore.
 */
export type NewQuizData = Omit<Quiz, 'id' | 'createdAt'>;

/**
 * Structure for a Training Path
 */
export interface TrainingPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: 'En cours' | 'Non commencé' | 'Terminé';
  progress: number;
}

/**
 * Structure for Notifications
 */
export interface AppNotification {
  id: string;
  userId: string; // The user who receives the notification
  title: string;
  description: string;
  href: string; // Link to navigate to
  isRead: boolean;
  createdAt: Date;
}

/**
 * Parses Firestore date fields into JavaScript Date objects.
 * Handles Timestamp, serialized Timestamp, and fallback to current date.
 */
const parseFirestoreDate = (dateField: any): Date => {
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

/**
 * Deletes a quiz from Firestore by ID.
 */
export const deleteQuizFromFirestore = async (quizId: string) => {
  try {
    await deleteDoc(doc(db, "quizzes", quizId));
  } catch (e) {
    console.error("Error deleting quiz: ", e);
    throw new Error("Could not delete quiz");
  }
};

/**
 * Updates a quiz in Firestore by ID.
 */
export const updateQuizInFirestore = async (quizId: string, quizData: Partial<Quiz>) => {
  try {
    const quizDocRef = doc(db, 'quizzes', quizId);
    // Ensure createdAt is not overwritten by removing it from the update object
    const { createdAt, ...restOfData } = quizData;
    await updateDoc(quizDocRef, { ...restOfData });
  } catch (e) {
    console.error("Error updating quiz: ", e);
    throw new Error("Could not update quiz");
  }
};

/**
 * Saves a new quiz to Firestore.
 */
export const saveQuizToFirestore = async (quizData: NewQuizData) => {
  try {
    const quizDataToSave = { ...quizData };
    if (!quizDataToSave.isMockExam) {
      delete quizDataToSave.scheduledFor;
    }

    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quizDataToSave,
      createdAt: serverTimestamp() // Use server-side timestamp for consistency
    });
    console.log("Quiz document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not save quiz");
  }
};

/**
 * Retrieves all quizzes from Firestore.
 */
export const getQuizzesFromFirestore = async (): Promise<Quiz[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "quizzes"));
    const quizzes = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
        scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
      } as Quiz;
    });
    return quizzes;
  } catch (e) {
    console.error("Error getting documents: ", e);
    throw new Error("Could not fetch quizzes");
  }
};

/**
 * Retrieves a single quiz by ID from Firestore.
 */
export const getQuizByIdFromFirestore = async (quizId: string): Promise<Quiz | null> => {
  try {
    const docSnap = await getDoc(doc(db, "quizzes", quizId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
        scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
      } as Quiz;
    }
    return null;
  } catch (e) {
    console.error("Error getting quiz: ", e);
    throw new Error("Could not fetch quiz");
  }
};

/**
 * Retrieves all users from Firestore.
 */
export const getUsersFromFirestore = async (): Promise<AppUser[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: parseFirestoreDate(data.createdAt),
        subscription_expires_at: data.subscription_expires_at ? parseFirestoreDate(data.subscription_expires_at) : null,
      } as AppUser;
    });
  } catch (e) {
    console.error("Error getting users: ", e);
    throw new Error("Could not fetch users");
  }
};

/**
 * Retrieves the admin user ID from Firestore.
 */
export const getAdminUserId = async (): Promise<string | null> => {
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'), orderBy('createdAt'), limit(1));
    const adminSnapshot = await getDocs(q);
    if (!adminSnapshot.empty) {
      return adminSnapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.warn("Could not query for admin user, probably because index is not ready.", error);
    return null;
  }
};

/**
 * Updates a user's role in Firestore.
 */
export const updateUserRoleInFirestore = async (uid: string, role: 'admin' | 'user') => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role });
  } catch (e) {
    console.error("Error updating user role: ", e);
    throw new Error("Could not update user role");
  }
};

/**
 * Updates a user's subscription in Firestore.
 */
export const updateUserSubscriptionInFirestore = async (uid: string, subscription: { type: 'gratuit' | 'premium', tier: 'mensuel' | 'annuel' | null }) => {
  try {
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
      updateData.subscription_tier = null;
    }

    await updateDoc(userDocRef, updateData as any);
  } catch (e) {
    console.error("Error updating user subscription: ", e);
    throw new Error("Could not update user subscription");
  }
};

/**
 * Saves an attempt to Firestore.
 */
export const saveAttemptToFirestore = async (attemptData: Omit<Attempt, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "attempts"), attemptData);
    return docRef.id;
  } catch (e) {
    console.error("Error saving attempt: ", e);
    throw new Error("Could not save attempt");
  }
};

/**
 * Retrieves attempts for a specific user from Firestore.
 */
export const getAttemptsFromFirestore = async (userId: string): Promise<Attempt[]> => {
  try {
    const attemptsRef = collection(db, "attempts");
    const q = query(attemptsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
      } as Attempt;
    });
  } catch (e) {
    console.error("Error getting attempts: ", e);
    // Don't throw, just return empty array if index is building
    return [];
  }
};

/**
 * Retrieves attempts for a specific quiz from Firestore.
 */
export const getAttemptsByQuizIdFromFirestore = async (quizId: string): Promise<Attempt[]> => {
  try {
    const attemptsRef = collection(db, "attempts");
    const q = query(attemptsRef, where("quizId", "==", quizId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
      } as Attempt;
    });
  } catch (e) {
    console.error("Error getting attempts by quiz: ", e);
    return [];
  }
};

/**
 * Retrieves all library documents from Firestore.
 */
export const getDocumentsFromFirestore = async (): Promise<LibraryDocument[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "documents"));
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
      } as LibraryDocument;
    });
  } catch (e) {
    console.error("Error getting library documents: ", e);
    throw new Error("Could not fetch library documents");
  }
};

/**
 * Adds a new document to Firestore.
 */
export const addDocumentToFirestore = async (documentData: LibraryDocumentFormData) => {
  try {
    await addDoc(collection(db, "documents"), {
      ...documentData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add document");
  }
};

/**
 * Updates a document in Firestore.
 */
export const updateDocumentInFirestore = async (id: string, documentData: LibraryDocumentFormData) => {
  try {
    const docRef = doc(db, "documents", id);
    await updateDoc(docRef, documentData as any);
  } catch (e) {
    console.error("Error updating document: ", e);
    throw new Error("Could not update document");
  }
};

/**
 * Deletes a document from Firestore.
 */
export const deleteDocumentFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, "documents", id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Could not delete document");
  }
};

/**
 * Retrieves all training paths from Firestore.
 */
export const getTrainingPathsFromFirestore = async (): Promise<TrainingPath[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "training_paths"));
    return querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as TrainingPath;
    });
  } catch (e) {
    console.error("Error getting training paths: ", e);
    return [];
  }
};

/**
 * Creates a new training path in Firestore.
 */
export const createTrainingPathInFirestore = async (pathData: Omit<TrainingPath, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, "training_paths"), pathData);
    return docRef.id;
  } catch (e) {
    console.error("Error creating training path: ", e);
    throw new Error("Could not create training path");
  }
};

/**
 * Updates a training path in Firestore.
 */
export const updateTrainingPathInFirestore = async (id: string, pathData: Partial<TrainingPath>) => {
  try {
    const docRef = doc(db, "training_paths", id);
    await updateDoc(docRef, pathData as any);
  } catch (e) {
    console.error("Error updating training path: ", e);
    throw new Error("Could not update training path");
  }
};

/**
 * Deletes a training path from Firestore.
 */
export const deleteTrainingPathFromFirestore = async (id: string) => {
  try {
    await deleteDoc(doc(db, "training_paths", id));
  } catch (e) {
    console.error("Error deleting training path: ", e);
    throw new Error("Could not delete training path");
  }
};

/**
 * Creates a notification in Firestore.
 */
export const createNotification = async (notificationData: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
  try {
    await addDoc(collection(db, "notifications"), {
      ...notificationData,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.error("Error creating notification: ", e);
    // Do not throw an error to the user, just log it.
    // This is a background task and should not block the user's flow.
  }
};

/**
 * Retrieves user notifications from Firestore.
 */
export const getUserNotifications = async (userId: string): Promise<AppNotification[]> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: parseFirestoreDate(doc.data().createdAt),
    } as AppNotification));
  } catch (e) {
    console.error("Error getting notifications: ", e);
    return [];
  }
};

/**
 * Marks a notification as read in Firestore.
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notifDocRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifDocRef, { isRead: true });
  } catch (e) {
    console.error("Error marking notification as read: ", e);
  }
};

/**
 * Marks all notifications as read for a user in Firestore.
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });
    await batch.commit();
  } catch (e) {
    console.error("Error marking all notifications as read: ", e);
  }
};

/**
 * Deletes a notification from Firestore.
 */
export const deleteNotificationFromFirestore = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
  } catch (e) {
    console.error("Error deleting notification: ", e);
    throw new Error("Could not delete notification");
  }
};

/**
 * Retrieves a single user by ID from Firestore.
 */
export async function getUser(uid: string): Promise<AppUser | null> {
  const userDoc = await getDoc(doc(db, `users/${uid}`));
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      uid: userDoc.id,
      ...data,
      createdAt: parseFirestoreDate(data.createdAt),
      subscription_expires_at: data.subscription_expires_at ? parseFirestoreDate(data.subscription_expires_at) : null,
    } as AppUser;
  }
  return null;
};

/**
 * Subscribes to real-time updates for quizzes.
 */
export const subscribeToQuizzes = (callback: (quizzes: Quiz[]) => void) => {
  const q = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const quizzes = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: parseFirestoreDate(data.createdAt),
        scheduledFor: data.scheduledFor ? parseFirestoreDate(data.scheduledFor) : undefined,
      } as Quiz;
    });
    callback(quizzes);
  });
  return unsubscribe;
};

/**
 * Subscribes to real-time updates for user notifications.
 */
export const subscribeToUserNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(10)
  );
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: parseFirestoreDate(doc.data().createdAt),
    } as AppNotification));
    callback(notifications);
  });
  return unsubscribe;
};
