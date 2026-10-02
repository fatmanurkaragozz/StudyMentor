import React, { createContext, useCallback, useContext, useState } from 'react';
import type { UserMode } from '../types';

// Calisan odak sayacinin bitis ani (ms), mod basina. Sayac ekrani (StudyPlanner) ile ust bardaki
// gosterge (FocusTimerBadge) ayni degeri okusun diye burada; sayacin geri kalan durumu
// (sure ayari, secili ders, aktif gorev) StudyPlanner'da kaliyor.
interface FocusTimerContextType {
  endsAtByMode: Partial<Record<UserMode, number>>;
  setEndsAt: (mode: UserMode, endsAt: number | null) => void;
}

const FocusTimerContext = createContext<FocusTimerContextType | undefined>(undefined);

export const FocusTimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [endsAtByMode, setEndsAtByMode] = useState<Partial<Record<UserMode, number>>>({});

  const setEndsAt = useCallback((mode: UserMode, endsAt: number | null) => {
    setEndsAtByMode(prev => {
      const next = { ...prev };
      if (endsAt === null) delete next[mode];
      else next[mode] = endsAt;
      return next;
    });
  }, []);

  return <FocusTimerContext.Provider value={{ endsAtByMode, setEndsAt }}>{children}</FocusTimerContext.Provider>;
};

export const useFocusTimer = (mode: UserMode) => {
  const context = useContext(FocusTimerContext);
  if (!context) {
    throw new Error('useFocusTimer must be used within a FocusTimerProvider');
  }
  const { endsAtByMode, setEndsAt } = context;
  return {
    endsAt: endsAtByMode[mode] ?? null,
    setEndsAt: useCallback((endsAt: number | null) => setEndsAt(mode, endsAt), [setEndsAt, mode]),
  };
};
