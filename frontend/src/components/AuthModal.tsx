import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { ApiError } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import type { PendingProfile } from './onboarding/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'LOGIN' | 'REGISTER';
  onModeChange: (mode: 'LOGIN' | 'REGISTER') => void;
  pendingProfile: PendingProfile | null;
  onSuccess: () => void;
}

type View = 'FORM' | 'VERIFY_EMAIL' | 'FORGOT_EMAIL' | 'FORGOT_RESET' | 'FORGOT_DONE';

const inputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark transition-all';
const plainInputClass =
  'w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark transition-all';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onModeChange, pendingProfile, onSuccess }) => {
  const { login, register, verifyEmail, resendVerification, forgotPassword, resetPassword } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [view, setView] = useState<View>('FORM');
  const [pendingEmail, setPendingEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setError(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (mode === 'REGISTER' && !pendingProfile) {
      onModeChange('REGISTER');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'REGISTER' && pendingProfile) {
        const trimmedName = name.trim();
        const [firstName, ...rest] = trimmedName.split(' ');
        const lastName = rest.join(' ') || firstName;
        await register({
          email,
          password,
          firstName,
          lastName,
          educationLevel: pendingProfile.educationLevel,
          grade: pendingProfile.grade,
          examCategory: pendingProfile.examCategory,
        });
        setPendingEmail(email);
        setCode('');
        setView('VERIFY_EMAIL');
      } else {
        await login(email, password);
        onSuccess();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setPendingEmail(email);
        setCode('');
        setView('VERIFY_EMAIL');
      } else {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await verifyEmail(pendingEmail, code);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Doğrulama başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    resetMessages();
    setLoading(true);
    try {
      await resendVerification(pendingEmail);
      setInfoMessage('Kod tekrar gönderildi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kod gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await forgotPassword(email);
      setPendingEmail(email);
      setCode('');
      setNewPassword('');
      setView('FORGOT_RESET');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await resetPassword(pendingEmail, code, newPassword);
      setView('FORGOT_DONE');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre sıfırlanamadı');
    } finally {
      setLoading(false);
    }
  };

  const backToLogin = () => {
    resetMessages();
    setPassword('');
    setView('FORM');
    onModeChange('LOGIN');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-brand-pink-dark/20 text-slate-900 dark:text-slate-100 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'FORM' && (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {mode === 'LOGIN' ? 'StudyMentor\'e Giriş Yap' : 'Aramıza Katıl & Hesabını Aç'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'LOGIN'
                  ? 'Çalışma ve kişisel gelişim yolculuğuna kaldığın yerden devam et.'
                  : 'Öğrenme hedeflerini AI destekli koçluk ile yönetmeye başla.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => { resetMessages(); onModeChange('LOGIN'); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'LOGIN' ? 'bg-brand-pink-dark text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Giriş Yap
              </button>
              <button
                type="button"
                onClick={() => { resetMessages(); onModeChange('REGISTER'); }}
                className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                  mode === 'REGISTER' ? 'bg-brand-pink-dark text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Kayıt Ol
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'REGISTER' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Ad Soyad</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Fatmanur Karagöz"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="fatmanur@studymentor.ai"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold">Şifre</label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => { resetMessages(); setView('FORGOT_EMAIL'); }}
                      className="text-[10px] font-semibold text-brand-pink-dark dark:text-brand-pink-light hover:underline"
                    >
                      Şifremi unuttum
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg glow-ai flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>{loading ? 'Bağlanıyor...' : mode === 'LOGIN' ? 'Giriş Yap ve Başla' : 'Hesabımı Oluştur'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </>
        )}

        {view === 'VERIFY_EMAIL' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-pink-dark/15 border border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">E-postanı Doğrula</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">{pendingEmail}</strong> adresine 6 haneli bir kod gönderdik.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Gelen kutunda göremiyorsan spam/gereksiz klasörüne de bakmayı unutma.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {infoMessage && (
              <div className="flex items-center gap-2 text-[11px] text-brand-mint-dark dark:text-brand-mint bg-brand-mint/10 border border-brand-mint/30 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyEmail} className="space-y-4 text-xs">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className={`${plainInputClass} text-center text-lg tracking-[0.5em] font-mono`}
                required
              />
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg glow-ai transition-all"
              >
                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Kodu Tekrar Gönder
              </button>
            </form>
          </div>
        )}

        {view === 'FORGOT_EMAIL' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-pink-dark/15 border border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Şifremi Unuttum</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kayıtlı e-posta adresini gir, sana bir sıfırlama kodu gönderelim.</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleForgotEmailSubmit} className="space-y-4 text-xs">
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="fatmanur@studymentor.ai"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg glow-ai transition-all"
              >
                {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
              </button>
              <button
                type="button"
                onClick={backToLogin}
                className="w-full text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Giriş ekranına dön
              </button>
            </form>
          </div>
        )}

        {view === 'FORGOT_RESET' && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Yeni Şifre Belirle</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <strong className="text-slate-700 dark:text-slate-300">{pendingEmail}</strong> adresine gönderilen kodu ve yeni şifreni gir.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                className={`${plainInputClass} text-center text-lg tracking-[0.5em] font-mono`}
                required
              />
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Yeni şifre (en az 8 karakter)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={inputClass}
                  minLength={8}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-lg glow-ai transition-all"
              >
                {loading ? 'Kaydediliyor...' : 'Şifreyi Sıfırla'}
              </button>
            </form>
          </div>
        )}

        {view === 'FORGOT_DONE' && (
          <div className="space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-mint/15 border border-brand-mint/30 text-brand-mint-dark dark:text-brand-mint flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Şifren Güncellendi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Artık yeni şifrenle giriş yapabilirsin.</p>
            <button
              onClick={backToLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 text-white font-bold text-xs shadow-lg glow-ai transition-all"
            >
              Giriş Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
