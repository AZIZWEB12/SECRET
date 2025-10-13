import type { Timestamp } from 'firebase/firestore';

export type UserSegment = 'direct' | 'professionnel';
export type UserRole = 'user' | 'admin';
export type SubscriptionType = 'gratuit' | 'premium';

export interface UserProfile {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  competitionType: UserSegment;
  role: UserRole;
  subscription_type: SubscriptionType;
  createdAt: Timestamp;
}

export type QuizDifficulty = 'facile' | 'moyen' | 'difficile';
export type QuizAccessType = 'gratuit' | 'premium';

export interface QuizQuestionData {
  question: string;
  options: string[];
  correctAnswers: string[];
  explanation?: string;
}

export interface Quiz {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: QuizDifficulty;
  access_type: QuizAccessType;
  duration_minutes: number;
  isMockExam?: boolean;
  scheduledFor?: any; // Can be Timestamp or Date
  questions: QuizQuestionData[];
  total_questions: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Document {
    id: string;
    title: string;
    type: 'pdf' | 'video';
    category: string;
    access_type: QuizAccessType;
    url: string;
    createdAt: Timestamp;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  createdAt: Timestamp;
  details: Record<string, { question: string; selected: string[]; correct: string[]; explanation: string; }>;
}
