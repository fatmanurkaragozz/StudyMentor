import React, { createContext, useContext, useState, useEffect } from 'react';

// Bölüm rehberi kartlarının "bir daha gösterme" durumu ve ilk kayıt karşılama
// bayrağı. Deseni ThemeContext ile aynı: lazy init'te localStorage'dan oku,
// effect ile geri yaz. Sadece tarayıcıda saklanır (cihaza bağlı) - bir onboarding
// ipucu için bu kabul edilebilir.

const DISMISSED_KEY = 'studymentor_intros_dismissed';
const WELCOME_KEY = 'studymentor_welcome_pending';

interface IntroContextType {
  /** Bu rehber/ipucu kartı "bir daha gösterme" ile kalıcı kapatıldı mı? */
  isDismissed: (key: string) => boolean;
  /** Kartı kalıcı gizle (checkbox işaretliyken "Kapat") */
  dismiss: (key: string) => void;
  /** Gizlenen tüm kartları geri getir (ProfilePage) */
  resetAll: () => void;
  /** ProfilePage'deki "(N)" sayacı için */
  dismissedCount: number;
  /** İlk kayıttan sonra dashboard'da karşılama şeridi gösterilsin mi? */
  welcomePending: boolean;
  /** OnboardingFlow'un REGISTER dalında çağrılır */
  beginWelcome: () => void;
  /** WelcomeBanner kapatılınca çağrılır */
  endWelcome: () => void;
}

const IntroContext = createContext<IntroContextType | undefined>(undefined);

function readDismissed(): string[] {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function readWelcomePending(): boolean {
  try {
    return localStorage.getItem(WELCOME_KEY) === '1';
  } catch {
    return false;
  }
}

export const IntroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dismissedKeys, setDismissedKeys] = useState<string[]>(readDismissed);
  const [welcomePending, setWelcomePending] = useState<boolean>(readWelcomePending);

  useEffect(() => {
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedKeys));
    } catch {
      // gizli sekme / kota dolu - kalıcı olmasa da uygulama çalışmaya devam etsin
    }
  }, [dismissedKeys]);

  const isDismissed = (key: string) => dismissedKeys.includes(key);

  const dismiss = (key: string) => {
    setDismissedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const resetAll = () => setDismissedKeys([]);

  const beginWelcome = () => {
    setWelcomePending(true);
    try {
      localStorage.setItem(WELCOME_KEY, '1');
    } catch {
      // yoksay
    }
  };

  const endWelcome = () => {
    setWelcomePending(false);
    try {
      localStorage.removeItem(WELCOME_KEY);
    } catch {
      // yoksay
    }
  };

  return (
    <IntroContext.Provider
      value={{
        isDismissed,
        dismiss,
        resetAll,
        dismissedCount: dismissedKeys.length,
        welcomePending,
        beginWelcome,
        endWelcome,
      }}
    >
      {children}
    </IntroContext.Provider>
  );
};

export const useIntros = () => {
  const context = useContext(IntroContext);
  if (!context) {
    throw new Error('useIntros must be used within an IntroProvider');
  }
  return context;
};
