import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Quiz } from './types';

// The data structure for a new quiz, before it's saved (so it doesn't have an id yet)
export type NewQuizData = Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>;

const quizzesCollection = collection(db, 'quizzes');

// GET all quizzes
export async function getQuizzesFromFirestore(): Promise<Quiz[]> {
  const q = query(quizzesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Ensure dates are correctly formatted if needed, though Firestore handles Timestamps
  })) as Quiz[];
}

// SAVE a new quiz
export async function saveQuizToFirestore(quizData: NewQuizData): Promise<string> {
  const docRef = await addDoc(quizzesCollection, {
    ...quizData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// UPDATE an existing quiz
export async function updateQuizInFirestore(id: string, quizData: Partial<Quiz>): Promise<void> {
  const quizDoc = doc(db, 'quizzes', id);
  await updateDoc(quizDoc, {
    ...quizData,
    updatedAt: serverTimestamp(),
  });
}

// DELETE a quiz
export async function deleteQuizFromFirestore(id: string): Promise<void> {
  const quizDoc = doc(db, 'quizzes', id);
  await deleteDoc(quizDoc);
}
