import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, setAccessToken, setAuthEventHandlers, toUserProfile, type BackendUser } from '../lib/apiClient';
import { useApp } from './AppContext';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type RegisterInput = Parameters<typeof apiClient.register>[0];

interface AuthContextType {
  status: AuthStatus;
  login: (email: string, password: string) => Promise<BackendUser>;
  register: (input: RegisterInput) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<BackendUser>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AppProvider'in icinde render edilmeli (useApp() kullaniyor) - basarili her auth
// isleminden sonra AppContext'teki gercek profili gunceller, OnboardingFlow'un
// bugun zaten yaptigi ayni "bir context digerinin setter'ini cagirir" deseni.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUserProfile } = useApp();
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    setAuthEventHandlers({ onExpired: () => setStatus('unauthenticated') });
  }, []);

  useEffect(() => {
    // Erisim tokeni sadece bellekte tutuluyor, sayfa yenilemesinde kaybolur - kalicilik
    // httpOnly refresh cookie'sinden geliyor, bu yuzden her yuklemede bir kere sessizce
    // /auth/refresh deniyoruz. Anonim ziyaretci icin de zararsizca 401 doner.
    apiClient
      .refresh()
      .then(result => {
        setAccessToken(result.accessToken);
        setUserProfile(toUserProfile(result.user));
        setStatus('authenticated');
      })
      .catch(() => setStatus('unauthenticated'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const result = await apiClient.login({ email, password });
    setAccessToken(result.accessToken);
    setUserProfile(toUserProfile(result.user));
    setStatus('authenticated');
    return result.user;
  };

  // Kayit basariliysa dogrudan oturum acilmiyor - e-posta dogrulanana kadar
  // AuthContext.status 'unauthenticated' kalir (AuthModal'daki mevcut davranisla ayni).
  const register = async (input: RegisterInput) => {
    await apiClient.register(input);
  };

  const verifyEmail = async (email: string, code: string) => {
    const result = await apiClient.verifyEmail({ email, code });
    setAccessToken(result.accessToken);
    setUserProfile(toUserProfile(result.user));
    setStatus('authenticated');
    return result.user;
  };

  const resendVerification = async (email: string) => {
    await apiClient.resendVerification({ email });
  };

  const forgotPassword = async (email: string) => {
    await apiClient.forgotPassword({ email });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await apiClient.resetPassword({ email, code, newPassword });
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // Sunucuya ulasilamasa bile client tarafinda oturumu kapatmaya devam et.
    }
    setAccessToken(null);
    setStatus('unauthenticated');
  };

  return (
    <AuthContext.Provider value={{ status, login, register, verifyEmail, resendVerification, forgotPassword, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
