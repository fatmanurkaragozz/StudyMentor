import React, { createContext, useContext, useRef, useState } from 'react';
import type { UserProfile, UserMode } from '../types';

interface AppContextType {
  user: UserProfile;
  setUserMode: (mode: UserMode) => void;
  setUserProfile: (profile: UserProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    id: 'u-1',
    name: 'Fatmanur Karagöz',
    email: 'fatmanur@studymentor.ai',
    mode: 'STUDENT',
    educationLevel: 'HIGH_SCHOOL',
    targetGoal: 'YKS 2026 Derece & Full-Stack AI Engineer',
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Kayıt/giriş sonrası gerçek backend profili burada saklanır - mod önizlemesi
  // (Platform Modu değiştirici) bu gerçek veriyi asla ezmez, sadece geçici bir
  // önizleme gösterir; kullanıcı kendi gerçek moduna dönünce tam olarak geri yüklenir.
  const realProfileRef = useRef<UserProfile | null>(null);

  const setUserProfile = (profile: UserProfile) => {
    realProfileRef.current = profile;
    setUser(profile);
  };

  const setUserMode = (mode: UserMode) => {
    const realProfile = realProfileRef.current;
    if (realProfile && realProfile.mode === mode) {
      setUser(realProfile);
      return;
    }
    setUser(prev => ({
      ...prev,
      mode,
      educationLevel: mode === 'STUDENT' ? 'HIGH_SCHOOL' : 'LIFELONG_LEARNER',
      grade: undefined,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUserMode,
        setUserProfile,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
