import React, { useState } from 'react';
import { AuthModal } from '../AuthModal';
import { EducationLevelStep } from './EducationLevelStep';
import { DataEntryStep } from './DataEntryStep';
import type { PendingProfile } from './types';
import type { UserMode } from '../../types';

type Step = 'MODE_LEVEL' | 'AUTH' | 'DATA_ENTRY';

interface OnboardingFlowProps {
  initialStep: 'MODE_LEVEL' | 'AUTH';
  initialAuthMode: 'LOGIN' | 'REGISTER';
  initialPendingProfile?: PendingProfile | null;
  initialPresetMode?: UserMode | null;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialStep,
  initialAuthMode,
  initialPendingProfile = null,
  initialPresetMode = null,
  onClose,
  onComplete,
}) => {
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

  // AuthContext basarili giris/dogrulama sonrasi AppContext'teki gercek profili
  // zaten kendi icinde guncelliyor - burada sadece hangi adima gecilecegine karar veriliyor.
  const handleAuthSuccess = () => {
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
