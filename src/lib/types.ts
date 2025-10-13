import type { Timestamp } from 'firebase/firestore';

export type UserSegment = 'direct' | 'professionnel';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  email?: string;
  phone: string;
  displayName?: string;
  segment: UserSegment;
  role: UserRole;
  isPremium: boolean;
  premiumActivatedAt?: Timestamp | null;
  premiumUntil?: Timestamp | null;
  createdAt: Timestamp;
}

export type QuizDifficulty = 'facile' | 'moyen' | 'difficile';

export interface QuizQuestionOption {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface QuizQuestionData {
  question: string;
  options: QuizQuestionOption[];
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  segment: UserSegment;
  difficulty: QuizDifficulty;
  premiumOnly: boolean;
  durationMinutes?: number;
  questions: QuizQuestionData[];
  createdBy?: string;
  createdAt: Timestamp;
  questionCount?: number;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  explanation?: string;
  createdAt: Timestamp;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  quizTitle: string; // Add quiz title for easier display
  totalQuestions: number;
  correctCount: number;
  // Store a map of question index to the selected option labels and correct labels
  details: Record<string, { question: string; selected: string[]; correct: string[]; explanation: string; }>;
  createdAt: Timestamp;
  score: number;
}

export interface PDF {
  id: string;
  title: string;
  segment: UserSegment;
  fileUrl: string;
  premiumOnly: boolean;
  createdBy?: string;
  createdAt: Timestamp;
}

export interface Video {
  id: string;
  title: string;
  segment: UserSegment;
  videoUrl: string;
  thumbnailUrl?: string;
  premiumOnly: boolean;
  createdBy?: string;
  createdAt: Timestamp;
}


export interface Formation {
  id: string;
  title: string;
  description?: string;
  segment: UserSegment;
  premiumOnly: boolean;
  createdBy?: string;
  createdAt: Timestamp;
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface Payment {
  id: string;
  userId: string;
  amountCFA: number;
  provider: 'orange_money';
  reference?: string;
  otpCode?: string;
  status: PaymentStatus;
  createdAt: Timestamp;
  approvedAt?: Timestamp;
}

    