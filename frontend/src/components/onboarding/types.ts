import type { EducationLevel, UserMode } from '../../types';
import type { ExamCategory } from '../../lib/apiClient';

export interface PendingProfile {
  mode: UserMode;
  educationLevel: EducationLevel;
  grade?: number;
  examCategory?: ExamCategory;
}
