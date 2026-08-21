import type { UserProfile } from '../types';

export function getEducationLabel(user: UserProfile): string {
  switch (user.educationLevel) {
    case 'MIDDLE_SCHOOL':
      return `🎓 Ortaokul${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'HIGH_SCHOOL':
      return `🎓 Lise${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'UNIVERSITY':
      return `🎓 Üniversite${user.grade ? ` ${user.grade}. Sınıf` : ''}`;
    case 'LIFELONG_LEARNER':
      return '💼 İş Hayatım ve Gelişim';
    case 'EXAM_PREP':
      return '🎯 Bağımsız Sınav Hazırlığı';
  }
}
