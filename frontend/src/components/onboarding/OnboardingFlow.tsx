import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from '../AuthModal';
import { EducationLevelStep } from './EducationLevelStep';
import { DataEntryStep } from './DataEntryStep';
import type { PendingProfile } from './types';
import type { BackendUser } from '../../lib/apiClient';
import type { UserProfile, UserMode, EducationLevel } from '../../types';

type Step = 'MODE_LEVEL' | 'AUTH' | 'DATA_ENTRY';

interface OnboardingFlowProps {
  initialStep: 'MODE_LEVEL' | 'AUTH';
  initialAuthMode: 'LOGIN' | 'REGISTER';
  initialPendingProfile?: PendingProfile | null;
  initialPresetMode?: UserMode | null;
  onClose: () => void;
  onComplete: () => void;
}

const TARGET_GOALS: Record<EducationLevel, string> = {
  MIDDLE_SCHOOL: 'LGS Hazırlık',
  HIGH_SCHOOL: 'YKS Hazırlık',
  UNIVERSITY: 'Üniversite Akademik Başarısı',
  LIFELONG_LEARNER: 'Kişisel ve Kariyer Gelişimi',
};

function toUserProfile(backendUser: BackendUser): UserProfile {
  const mode: UserMode = backendUser.educationLevel === 'LIFELONG_LEARNER' ? 'LIFELONG_LEARNER' : 'STUDENT';
  return {
    id: backendUser.id,
    name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
    email: backendUser.email,
    mode,
    educationLevel: backendUser.educationLevel,
    grade: backendUser.grade ?? undefined,
    targetGoal: TARGET_GOALS[backendUser.educationLevel],
  };
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStep,
  initialAuthMode,
  initialPendingProfile = null,
  initialPresetMode = null,
  onClose,
  onComplete,
}) => {
  const { setUserProfile } = useApp();
  const [step, setStep] = useState<Step>(initialStep);
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(initialAuthMode);
  const [pendingProfile, setPendingProfile] = useState<PendingProfile | null>(initialPendingProfile);
  const [presetMode, setPresetMode] = useState<UserMode | null>(initialPresetMode);

  const handleLevelContinue = (profile: PendingProfile) => {
    setPendingProfile(profile);
    setAuthMode('REGISTER');
    setStep('AUTH');
  };

  const handleAuthModeChange = (mode: 'LOGIN' | 'REGISTER') => {
    if (mode === 'REGISTER' && !pendingProfile) {
      setPresetMode(null);
      setAuthMode('REGISTER');
      setStep('MODE_LEVEL');
      return;
    }
    setAuthMode(mode);
  };

  const handleAuthSuccess = ({ user }: { token: string; user: BackendUser }) => {
    setUserProfile(toUserProfile(user));
    if (authMode === 'REGISTER') {
      setStep('DATA_ENTRY');
    } else {
      onComplete();
    }
  };

  if (step === 'MODE_LEVEL') {
    return <EducationLevelStep onClose={onClose} onContinue={handleLevelContinue} presetMode={presetMode} />;
  }

  if (step === 'AUTH') {
    return (
      <AuthModal
        isOpen
        onClose={onClose}
        mode={authMode}
        onModeChange={handleAuthModeChange}
        pendingProfile={pendingProfile}
        onSuccess={handleAuthSuccess}
      />
    );
  }

  return <DataEntryStep onFinish={onComplete} />;
};
