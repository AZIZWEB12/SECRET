import type { Timestamp } from 'firebase/firestore';

export type UserSegment = 'direct' | 'professionnel';
export type UserRole = 'user' | 'admin';
export type SubscriptionType = 'gratuit' | 'premium';

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  segment: UserSegment;
  role: UserRole;
  isPremium: boolean;
  premiumActivatedAt?: Timestamp;
  createdAt: Timestamp;
}

export type QuizDifficulty = 'facile' | 'moyen' | 'difficile';
export type QuizAccessType = 'gratuit' | 'premium';

export interface QuizQuestionOption {
    label: string;
    text: string;
    is_correct: boolean;
}

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
  segment: UserSegment;
  difficulty: QuizDifficulty;
  premiumOnly: boolean;
  durationMinutes?: number;
  questions: QuizQuestionData[];
  createdAt: Timestamp;
}

export interface PDF {
    id: string;
    title: string;
    segment: UserSegment;
    premiumOnly: boolean;
    fileUrl: string;
    createdAt: Timestamp;
}

export interface Video {
    id: string;
    title: string;
    segment: UserSegment;
    premiumOnly: boolean;
    videoUrl: string;
    thumbnailUrl?: string;
    createdAt: Timestamp;
}


export interface Formation {
    id: string;
    title: string;
    description: string;
    segment: UserSegment;
    premiumOnly: boolean;
    createdAt: Timestamp;
}

export interface Payment {
    id: string;
    userId: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
    approvedAt?: Timestamp;
}


export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string;
  correctCount: number;
  totalQuestions: number;
  score: number;
  createdAt: Timestamp;
  details: Record<string, {
      question: string;
      selected: string[];
      correct: string[];
      explanation: string;
  }>;
}