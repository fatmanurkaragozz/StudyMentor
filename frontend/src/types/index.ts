export type UserMode = 'STUDENT' | 'LIFELONG_LEARNER';

export type EducationLevel = 'MIDDLE_SCHOOL' | 'HIGH_SCHOOL' | 'UNIVERSITY' | 'LIFELONG_LEARNER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mode: UserMode;
  educationLevel: EducationLevel;
  grade?: number; // Kaçıncı sınıf/yıl (LIFELONG_LEARNER'da yok)
  targetGoal: string; // e.g. "YKS 2026 Derece" or "Full-Stack Dev & AI Specialist"
}
