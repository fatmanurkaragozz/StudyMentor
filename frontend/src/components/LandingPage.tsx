import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { DeskHeroAnimation } from './DeskHeroAnimation';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { StarMap } from './StarMap';
import {
  GraduationCap,
  Briefcase,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Compass,
  Sparkles,
  LogIn,
} from 'lucide-react';

const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

interface LandingPageProps {
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

export const LandingPage: FC<LandingPageProps> = ({ onEnterApp }) => {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const webglSupported = useMemo(() => hasWebGLSupport(), []);
  const showStatic = !webglSupported || reducedMotion;
  const legacyStage = useHeroIntroSequence();
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();
  const [heroScrollStarted, setHeroScrollStarted] = useState(false);

  useEffect(() => {
    if (heroScrollStarted) return;
    const markStarted = () => setHeroScrollStarted(true);
    window.addEventListener('wheel', markStarted, { passive: true, once: true });
    window.addEventListener('touchmove', markStarted, { passive: true, once: true });
    return () => {
      window.removeEventListener('wheel', markStarted);
      window.removeEventListener('touchmove', markStarted);
    };
  }, [heroScrollStarted]);

  const [onboarding, setOnboarding] = useState<OnboardingState>(CLOSED_ONBOARDING);

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
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-brand-pink-dark selection:text-white transition-colors duration-300 bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-950">
      <div
        className={`absolute top-10 right-[10%] w-72 h-72 rounded-full bg-brand-pink-dark/[0.06] dark:bg-brand-pink-dark/[0.05] blur-3xl pointer-events-none select-none ${reducedMotion ? '' : 'animate-aurora'}`}
        style={{ animationDuration: '14s' }}
      />
      <div
        className={`absolute bottom-24 left-[6%] w-80 h-80 rounded-full bg-brand-mint/[0.06] dark:bg-brand-mint/[0.05] blur-3xl pointer-events-none select-none ${reducedMotion ? '' : 'animate-aurora'}`}
        style={{ animationDuration: '18s', animationDelay: '1.5s' }}
      />
      <div
        className={`absolute top-1/3 left-1/2 w-56 h-56 rounded-full bg-brand-gold/[0.045] dark:bg-brand-gold/[0.04] blur-3xl pointer-events-none select-none ${reducedMotion ? '' : 'animate-aurora'}`}
        style={{ animationDuration: '11s', animationDelay: '3s' }}
      />

      <header className="relative z-30 h-20 px-4 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-pink-dark to-brand-mint-dark flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">StudyMentor</h1>
            <span className="hidden sm:block text-[10px] font-semibold text-brand-pink-dark dark:text-brand-pink-light tracking-wider uppercase">
              Akıllı Çalışma Planlayıcı
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-brand-pink-light hover:scale-105 transition-all shadow-sm"
            title="Aydınlık / Karanlık Mod Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </button>

          <Button variant="ghost" size="sm" onClick={openLogin} aria-label="Giriş Yap">
            <LogIn className="w-4 h-4 sm:hidden" />
            <span className="hidden sm:inline">Giriş Yap</span>
          </Button>

          <Button variant="primary" size="sm" onClick={openRegister}>
            <span className="sm:hidden">Kayıt Ol</span>
            <span className="hidden sm:inline">Ücretsiz Kayıt Ol</span>
          </Button>
        </div>
      </header>

      <div className="relative z-10 w-full h-hero-viewport bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-950">
        {showStatic ? (
          <DeskHeroAnimation stage={legacyStage} />
        ) : (
          <Suspense fallback={null}>
            <LazyHeroCanvas />
          </Suspense>
        )}

        <div
          className={`absolute bottom-8 inset-x-0 h-20 bg-gradient-to-r from-brand-pink-dark/0 via-brand-pink-dark/25 to-brand-mint-dark/25 blur-2xl pointer-events-none ${
            reducedMotion ? '' : 'animate-hero-pulse'
          }`}
        />

        <div
          className={`absolute top-[68%] inset-x-0 h-28 overflow-hidden opacity-[0.14] pointer-events-none ${
            reducedMotion ? '' : 'animate-wave-flow'
          }`}
        >
          <div className="flex w-[200%] h-full">
            <svg className="w-1/2 h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C2255C" />
                  <stop offset="100%" stopColor="#16916C" />
                </linearGradient>
              </defs>
              <path
                d="M0,60 Q25,20 50,60 T100,60 T150,60 T200,60 T250,60 T300,60 T350,60 T400,60 T450,60 T500,60 T550,60 T600,60 T650,60 T700,60 T750,60 T800,60"
                stroke="url(#waveGradA)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M0,65 Q25,50 50,65 T100,65 T150,65 T200,65 T250,65 T300,65 T350,65 T400,65 T450,65 T500,65 T550,65 T600,65 T650,65 T700,65 T750,65 T800,65"
                stroke="url(#waveGradA)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
            </svg>
            <svg className="w-1/2 h-full" viewBox="0 0 800 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="waveGradB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#C2255C" />
                  <stop offset="100%" stopColor="#16916C" />
                </linearGradient>
              </defs>
              <path
                d="M0,60 Q25,20 50,60 T100,60 T150,60 T200,60 T250,60 T300,60 T350,60 T400,60 T450,60 T500,60 T550,60 T600,60 T650,60 T700,60 T750,60 T800,60"
                stroke="url(#waveGradB)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M0,65 Q25,50 50,65 T100,65 T150,65 T200,65 T250,65 T300,65 T350,65 T400,65 T450,65 T500,65 T550,65 T600,65 T650,65 T700,65 T750,65 T800,65"
                stroke="url(#waveGradB)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-b from-transparent to-brand-ivory-deep dark:to-slate-950 pointer-events-none" />

        <div className="absolute top-[40%] left-6 sm:left-40 -translate-y-1/2 z-20 max-w-[85vw] sm:max-w-md pointer-events-none">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-gold-dark dark:text-brand-gold pointer-events-auto">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            AI Destekli Çalışma Planlayıcısı
          </span>
          <h2 className="mt-3 font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-slate-900 dark:text-white pointer-events-auto">
            Daha planlı çalış.
            <br />
            Daha az yorul.
            <br />
            Daha çok ilerle.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 pointer-events-auto">
            StudyMentor, çalışma alışkanlıklarını analiz eder ve sana özel çalışma rotanı oluşturur.
          </p>
          <div className="mt-6 pointer-events-auto">
            <Button variant="primary" onClick={openRegister} className="glow-ai">
              Ücretsiz Başla
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 pointer-events-auto">
            {['Kişisel plan', 'İlerleme takibi', 'AI önerileri'].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-mint-dark dark:text-brand-mint" strokeWidth={2} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div
          className={`fixed inset-x-0 bottom-8 z-20 flex flex-col items-center gap-1 pointer-events-none transition-opacity duration-500 ${
            heroScrollStarted ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">Kaydır</span>
          <ChevronDown className="w-6 h-6 text-slate-600 dark:text-slate-300 animate-bounce" strokeWidth={1.75} />
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">
        <StarMap />
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Çalışma rotanı planla,
            <br className="hidden sm:block" /> ilerlemeni takip et.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            StudyMentor; ders ve konu takibini, alışkanlıklarını ve yapay zeka destekli tekrar önerilerini tek yerde
            birleştirir.
          </p>
        </div>

        <div
          ref={modesRef}
          className={`w-full grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch transition-all duration-700 ease-out ${
            modesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <Card id="mode-student-card" accent="indigo" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-brand-pink-dark/40 text-brand-pink-dark dark:text-brand-pink-light flex items-center justify-center">
                <GraduationCap className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div>
                <Badge tone="indigo" className="block mb-1">
                  Müfredat &amp; Sınav Odaklı
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Öğrenci Modu</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  LGS, YKS, Üniversite vize/final sınavlarına yönelik ders takibi, deneme netleri ve akıllı tekrar hatırlatmaları.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                  <span>Ders ve Konu Bazlı Akıllı Tekrar Planı</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                  <span>Deneme Sınavları &amp; Ders Net Analizi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                  <span>Pomodoro Zamanlayıcısı ve Oturum Değerlendirme</span>
                </li>
              </ul>
            </div>

            <Button variant="primary" onClick={() => handleSelectModeAndEnter('STUDENT')} className="w-full">
              <span>Öğrenci Modunu Keşfet</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Card>

          <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-pink-dark to-brand-mint-dark text-white flex items-center justify-center shadow-md font-black text-xs">
              VS
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3 text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1 text-brand-pink-dark dark:text-brand-pink-light">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>Öğrenci</span>
              </div>
              <div
                className={`h-12 w-0.5 rounded-full bg-gradient-to-b from-brand-pink-dark to-brand-mint-dark ${
                  !reducedMotion && modesInView ? 'animate-neon-line' : ''
                }`}
                style={{ boxShadow: '0 0 10px rgba(194, 37, 92, 0.55), 0 0 14px rgba(22, 145, 108, 0.45)' }}
              ></div>
              <div className="flex items-center gap-1 text-brand-mint-dark dark:text-brand-mint">
                <span>Gelişim</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <Card id="mode-growth-card" accent="violet" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-brand-mint-dark/40 text-brand-mint-dark dark:text-brand-mint flex items-center justify-center">
                <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div>
                <Badge tone="violet" className="block mb-1">
                  Beceri &amp; Proje Odaklı
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">İş Hayatım ve Gelişim</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Yazılım projeleri, dil öğrenimi, kişisel okumalar ve rutin alışkanlık takibi yapan yetişkinler ve çalışanlar için.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
                  <span>Proje &amp; Beceriler İlerleme Paneli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
                  <span>Alışkanlık Zinciri (Habit Tracker Matrix)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
                  <span>AI Sentiment Skorlu Günlük &amp; Duygu Değerlendirmesi</span>
                </li>
              </ul>
            </div>

            <Button variant="secondary" onClick={() => handleSelectModeAndEnter('LIFELONG_LEARNER')} className="w-full">
              <span>Bu Modu Keşfet</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </main>

      <footer className="relative z-20 py-6 border-t border-slate-300/40 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 StudyMentor. Tüm hakları saklıdır.</p>
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
