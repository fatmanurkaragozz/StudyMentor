export type UserMode = 'STUDENT' | 'LIFELONG_LEARNER';

export type EducationLevel = 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY' | 'LIFELONG_LEARNER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mode: UserMode;
  educationLevel: EducationLevel;
  targetGoal: string; // e.g. "YKS 2026 Derece" or "Full-Stack Dev & AI Specialist"
}

export interface SubjectOrProject {
  id: string;
  name: string;
  category: string; // e.g., "Matematik", "Yazılım", "İngilizce"
  progress: number; // 0 - 100
  color: string;
}

export interface StudySession {
  id: string;
  title: string;
  subjectOrProjectName: string;
  durationMinutes: number;
  difficulty: number; // 1-5
  productivity: number; // 1-5
  notes?: string;
  date: string;
  mode: UserMode;
}

export interface ExamOrMilestone {
  id: string;
  title: string;
  date: string;
  targetScore: number;
  resultScore?: number;
  type: 'EXAM' | 'PROJECT';
  details: { subject: string; score: number }[];
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  streakDays: number;
  completedDates: string[]; // YYYY-MM-DD
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: '😊' | '🚀' | '😐' | '😔' | '😴';
  sentimentScore: number; // -1.0 to 1.0
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  content: string;
  type: 'STUDY_PRIORITY' | 'REVISION' | 'GENERAL';
  mode: UserMode;
  actionText: string;
  link?: string;
}
