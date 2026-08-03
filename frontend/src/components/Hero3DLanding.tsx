import { lazy, Suspense, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { StaticHeroFallback, hasWebGLSupport } from './hero3d/WebGLFallback';
import { useReducedMotion } from './hero3d/useReducedMotion';
import {
  GraduationCap,
  Briefcase,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react';

const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));

interface Hero3DLandingProps {
  onEnterApp: () => void;
}

interface OnboardingState {
  open: boolean;
  step: 'MODE_LEVEL' | 'AUTH';
  authMode: 'LOGIN' | 'REGISTER';
  pendingProfile: PendingProfile | null;
  presetMode: 'STUDENT' | 'LIFELONG_LEARNER' | null;
}

const CLOSED_ONBOARDING: OnboardingState = {
  open: false,
  step: 'MODE_LEVEL',
  authMode: 'REGISTER',
  pendingProfile: null,
  presetMode: null,
};

export const Hero3DLanding: FC<Hero3DLandingProps> = ({ onEnterApp }) => {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const webglSupported = useMemo(() => hasWebGLSupport(), []);

  const [onboarding, setOnboarding] = useState<OnboardingState>(CLOSED_ONBOARDING);
  const [hoveredMode, setHoveredMode] = useState<'STUDENT' | 'LEARNER' | null>(null);

  const openLogin = () => {
    setOnboarding({ open: true, step: 'AUTH', authMode: 'LOGIN', pendingProfile: null, presetMode: null });
  };

  const openRegister = () => {
    setOnboarding({ open: true, step: 'MODE_LEVEL', authMode: 'REGISTER', pendingProfile: null, presetMode: null });
  };

  const closeOnboarding = () => setOnboarding(CLOSED_ONBOARDING);

  const handleSelectModeAndEnter = (mode: 'STUDENT' | 'LIFELONG_LEARNER') => {
    if (mode === 'LIFELONG_LEARNER') {
      setOnboarding({
        open: true,
        step: 'AUTH',
        authMode: 'REGISTER',
        pendingProfile: { mode: 'LIFELONG_LEARNER', educationLevel: 'LIFELONG_LEARNER' },
        presetMode: null,
      });
    } else {
      setOnboarding({ open: true, step: 'MODE_LEVEL', authMode: 'REGISTER', pendingProfile: null, presetMode: 'STUDENT' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-amber-500 selection:text-white transition-colors duration-300">
      <header className="relative z-30 h-20 px-6 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg glow-amber">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">StudyMentor</h1>
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase">AI Learning &amp; Habit Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:scale-105 transition-all shadow-sm"
            title="Aydınlık / Karanlık Mod Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </button>

          <button
            onClick={openLogin}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            Giriş Yap
          </button>

          <button
            onClick={openRegister}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white shadow-lg glow-amber transition-all transform hover:-translate-y-0.5"
          >
            Ücretsiz Kayıt Ol
          </button>
        </div>
      </header>

      {/* 3D Hero Viewport */}
      <div className="relative w-full min-h-[640px] flex-1 overflow-hidden">
        {webglSupported ? (
          <Suspense fallback={<StaticHeroFallback />}>
            <LazyHeroCanvas reducedMotion={reducedMotion} />
          </Suspense>
        ) : (
          <StaticHeroFallback />
        )}

        <h2 className="absolute z-10 top-[8%] left-[5%] sm:left-[7%] text-6xl sm:text-8xl font-black tracking-tight bg-gradient-to-r from-amber-600 via-rose-500 to-amber-500 bg-clip-text text-transparent pointer-events-none select-none">
          STUDY
        </h2>
        <h2 className="absolute z-10 bottom-[6%] right-[5%] sm:right-[7%] text-6xl sm:text-8xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent pointer-events-none select-none">
          MENTOR
        </h2>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch">
          <div
            onMouseEnter={() => setHoveredMode('STUDENT')}
            onMouseLeave={() => setHoveredMode(null)}
            className={`lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border transition-all duration-300 text-left flex flex-col justify-between space-y-6 relative overflow-hidden group ${
              hoveredMode === 'STUDENT'
                ? 'border-amber-500 scale-[1.02] shadow-2xl glow-amber'
                : 'border-slate-300 dark:border-slate-800'
            }`}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                  Müfredat &amp; Sınav Odaklı
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">🎓 Öğrenci Modu</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  LGS, YKS, Üniversite vize/final sınavlarına yönelik ders takibi, deneme netleri ve Spaced Repetition algoritması.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Ders ve Konu Bazlı Spaced Repetition (Tekrar)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Deneme Sınavları &amp; Ders Net Analizi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Pomodoro Zamanlayıcısı ve Oturum Değerlendirme</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectModeAndEnter('STUDENT')}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Öğrenci Modunu Keşfet</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg font-black text-xs">
              VS
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3 text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <ArrowLeft className="w-4 h-4 animate-pulse" />
                <span>Öğrenci</span>
              </div>
              <div className="h-12 w-0.5 bg-gradient-to-b from-amber-500 to-emerald-500 rounded-full"></div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span>Gelişim</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>

          <div
            onMouseEnter={() => setHoveredMode('LEARNER')}
            onMouseLeave={() => setHoveredMode(null)}
            className={`lg:col-span-3 glass-panel p-6 sm:p-8 rounded-3xl border transition-all duration-300 text-left flex flex-col justify-between space-y-6 relative overflow-hidden group ${
              hoveredMode === 'LEARNER'
                ? 'border-emerald-500 scale-[1.02] shadow-2xl glow-sage'
                : 'border-slate-300 dark:border-slate-800'
            }`}
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Briefcase className="w-7 h-7" />
              </div>

              <div>
                <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  Beceri &amp; Proje Odaklı
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">💼 İş Hayatım ve Gelişim</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Yazılım projeleri, dil öğrenimi, kişisel okumalar ve rutin alışkanlık takibi yapan yetişkinler ve çalışanlar için.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Proje &amp; Beceriler İlerleme Paneli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Alışkanlık Zinciri (Habit Tracker Matrix)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>AI Sentiment Skorlu Günlük &amp; Duygu Değerlendirmesi</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectModeAndEnter('LIFELONG_LEARNER')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <span>Bu Modu Keşfet</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-6 border-t border-slate-300/40 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 StudyMentor. All rights reserved. Doğa ve İnsan Odaklı Öğrenme Mimarisi.</p>
      </footer>

      {onboarding.open && (
        <OnboardingFlow
          initialStep={onboarding.step}
          initialAuthMode={onboarding.authMode}
          initialPendingProfile={onboarding.pendingProfile}
          initialPresetMode={onboarding.presetMode}
          onClose={closeOnboarding}
          onComplete={onEnterApp}
        />
      )}
    </div>
  );
};
