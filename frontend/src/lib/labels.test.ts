import { describe, it, expect } from 'vitest';
import { getEducationLabel } from './labels';
import type { UserProfile } from '../types';

const baseUser: UserProfile = {
  id: '1',
  name: 'Test Kullanıcı',
  email: 't@test.com',
  mode: 'STUDENT',
  educationLevel: 'HIGH_SCHOOL',
  grade: 11,
  targetGoal: 'YKS Hazırlık',
};

describe('getEducationLabel', () => {
  it('MIDDLE_SCHOOL icin sinifi gosterir', () => {
    expect(getEducationLabel({ ...baseUser, educationLevel: 'MIDDLE_SCHOOL', grade: 7 })).toBe('🎓 Ortaokul 7. Sınıf');
  });

  it('HIGH_SCHOOL icin sinifi gosterir', () => {
    expect(getEducationLabel(baseUser)).toBe('🎓 Lise 11. Sınıf');
  });

  it('grade tanimsizsa sinif kismini atlar', () => {
    expect(getEducationLabel({ ...baseUser, grade: undefined })).toBe('🎓 Lise');
  });

  it('UNIVERSITY icin sinifi gosterir', () => {
    expect(getEducationLabel({ ...baseUser, educationLevel: 'UNIVERSITY', grade: 2 })).toBe('🎓 Üniversite 2. Sınıf');
  });

  it('LIFELONG_LEARNER icin sabit etiket doner (sinif gostermez)', () => {
    expect(getEducationLabel({ ...baseUser, educationLevel: 'LIFELONG_LEARNER', grade: undefined })).toBe(
      '💼 İş Hayatım ve Gelişim',
    );
  });

  it('EXAM_PREP icin sabit etiket doner', () => {
    expect(getEducationLabel({ ...baseUser, educationLevel: 'EXAM_PREP', grade: undefined })).toBe(
      '🎯 Bağımsız Sınav Hazırlığı',
    );
  });
});
