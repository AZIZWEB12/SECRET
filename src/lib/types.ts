import type { Timestamp } from 'firebase/firestore';

export type UserCompetitionType = 'direct' | 'professionnel';
export type UserRole = 'user' | 'admin';
export type SubscriptionType = 'gratuit' | 'premium';

// Renamed from Profile to UserProfile and collection to 'users'
export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  fullName: string;
  email: string;
  phone: string;
  competitionType: UserCompetitionType;
  role: UserRole;
  subscription_type: SubscriptionType;
  subscriptionActivatedAt?: Timestamp;
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
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: QuizDifficulty;
  access_type: QuizAccessType;
  duration_minutes: number;
  isMockExam: boolean;
  scheduledFor?: Timestamp;
  questions: QuizQuestionData[];
  total_questions: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Document {
    id: string;
    title: string;
    type: 'pdf' | 'video';
    category: string;
    access_type: QuizAccessType;
    url: string;
    thumbnailUrl?: string; // Kept from previous version, useful for videos
    createdAt: Timestamp;
}

export interface Formation {
    id: string;
    title: string;
    description: string;
    segment: UserCompetitionType; // Aligning with UserProfile
    premiumOnly: boolean;
    createdAt: Timestamp;
}

export interface Transaction {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
    approvedAt?: Timestamp;
}

// Renamed from QuizAttempt to Attempt
export interface Attempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  score: number; // Number of correct answers
  totalQuestions: number;
  percentage: number; // The calculated percentage score
  createdAt: Timestamp;
  details?: Record<string, { // Kept details from previous version for correction page
      question: string;
      selected: string[];
      correct: string[];
      explanation: string;
  }>;
}
