import React, { createContext, useContext, useState } from 'react';
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
    name: 'Örnek Kullanıcı',
    email: 'ornek@studymentor.app',
    mode: 'STUDENT',
    educationLevel: 'HIGH_SCHOOL',
    targetGoal: 'YKS 2026',
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const setUserProfile = (profile: UserProfile) => {
    setUser(profile);
  };

  // Sadece bir arayuz/kopya onizlemesi - "Platform Modu" degistiricisinin (Sidebar/ProfilePage)
  // karsiligi. Hicbir apiClient cagrisi artik user.mode'u backend'e gondermiyor (mode her zaman
  // sunucuda kullanicinin gercek educationLevel'indan turetiliyor), o yuzden bu sadece Derslerim/
  // Uğraşlarım gibi ekranlardaki metni/temayi degistirir - gercek verisi hangi moddaysa o kalir.
  // educationLevel/grade kasten degistirilmiyor - onlar gercek hesap bilgisi, onizlemeyle degismez.
  const setUserMode = (mode: UserMode) => {
    setUser(prev => ({ ...prev, mode }));
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
