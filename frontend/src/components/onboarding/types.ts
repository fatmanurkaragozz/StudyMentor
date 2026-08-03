import type { EducationLevel, UserMode } from '../../types';

export interface PendingProfile {
  mode: UserMode;
  educationLevel: EducationLevel;
  grade?: number;
}
