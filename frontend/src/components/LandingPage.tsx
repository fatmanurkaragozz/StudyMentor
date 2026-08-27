import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { apiClient, ApiError } from '../lib/apiClient';
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
  Mail,
  AlertCircle,
} from 'lucide-react';

const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));

// lucide-react 1.x'te marka/logo ikonları (Github, Linkedin vb.) kaldırıldığı için
// footer'daki sosyal linkler için minimal inline SVG logomark kullanılıyor.
const GithubIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedinIcon: FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

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
  const [feedbackRef, feedbackInView] = useInViewOnce<HTMLDivElement>();
  const [footerRef, footerInView] = useInViewOnce<HTMLElement>();
  const [heroScrollStarted, setHeroScrollStarted] = useState(false);

  useEffect(() => {
    if (heroScrollStarted) return;
    const markStarted = () => setHeroScrollStarted(true);
    window.addEventListener('wheel', markStarted, { passive: true, once: true });
    window.addEventListener('touchmove', markStarted, { passive: true, once: true });
    // Klavye (Page Down/End/ok tuşları) veya scrollbar sürükleme gibi wheel/touchmove
    // tetiklemeyen kaydırma yöntemlerinde de ipucunun kalıcı olarak takılı kalmaması için.
    window.addEventListener('scroll', markStarted, { passive: true, once: true });
    return () => {
      window.removeEventListener('wheel', markStarted);
      window.removeEventListener('touchmove', markStarted);
      window.removeEventListener('scroll', markStarted);
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

  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleFeedbackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setFeedbackLoading(true);
    try {
      await apiClient.submitFeedback({ email: feedbackEmail, message: feedbackMessage });
      setFeedbackSuccess(true);
      setFeedbackEmail('');
      setFeedbackMessage('');
    } catch (err) {
      setFeedbackError(err instanceof ApiError ? err.message : 'Geri bildirim gönderilemedi. Lütfen tekrar dene.');
    } finally {
      setFeedbackLoading(false);
    }
  };

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
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-brand-pink-dark selection:text-white transition-colors duration-300 bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-900">
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

      <div className="relative">
        <StarMap
          extended
          className="[mask-image:linear-gradient(to_bottom,black,black_70%,transparent_100%)]"
        />

        <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">
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
                    LGS, YKS ve üniversite vize/finaline hazırlananlar kadar; hiçbir okula ya da üniversiteye bağlı olmadan AGS, KPSS, ALES, DGS veya YDS gibi bir sınava bağımsız hazırlananlar için de: ders/konu takibi, deneme netleri ve akıllı tekrar hatırlatmaları. Okulun olsun ya da olmasın, hedefin bir sınavsa modun bu.
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
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                    <span>Okula/Üniversiteye Bağlı Olmadan Bağımsız Sınav Hazırlığı</span>
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
                    Mesleğin ne olursa olsun — ya da hiçbir mesleğin olmasa bile: spor, İngilizce, tiyatro, müzik gibi kişisel uğraşların; yazılım/kişisel proje geliştirme; kişisel okumalar ve rutin alışkanlık takibi. Sınav ve okul ilişkisi olmayan her kişisel gelişim hedefi burada.
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

        <div className="min-h-viewport flex flex-col">
          <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 mt-20 w-full flex-1 flex flex-col justify-center">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Bu platformu nasıl daha iyi geliştirebiliriz?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Fikirlerin, önerilerin ya da karşılaştığın bir sorun mu var? E-posta adresini bırak, doğrudan sana
                yanıt verelim.
              </p>
            </div>

            <div
              ref={feedbackRef}
              className={`transition-all duration-700 ease-out ${
                feedbackInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
            >
              <Card className="max-w-xl mx-auto text-left">
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                  {feedbackError && (
                    <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}

                  {feedbackSuccess && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Geri bildirimin için teşekkürler! En kısa sürede okuyacağız.</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-posta Adresin</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="sen@ornek.com"
                        value={feedbackEmail}
                        onChange={e => setFeedbackEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Geri Bildirimin</label>
                    <textarea
                      placeholder="Bu platformu nasıl daha iyi hale getirebiliriz?"
                      value={feedbackMessage}
                      onChange={e => setFeedbackMessage(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark h-28 resize-none"
                      maxLength={2000}
                      required
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={feedbackLoading} className="w-full glow-ai">
                    <span>{feedbackLoading ? 'Gönderiliyor...' : 'Geri Bildirim Gönder'}</span>
                  </Button>
                </form>
              </Card>
            </div>
          </section>

          <footer
            ref={footerRef}
            className={`relative z-20 py-10 border-t border-slate-300/40 dark:border-slate-800 transition-all duration-700 ease-out ${
              footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-pink-dark to-brand-mint-dark flex items-center justify-center shadow-sm">
                  <Compass className="w-4 h-4 text-white" strokeWidth={1.75} />
                </div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">StudyMentor</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/fatmanurkaragozz"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
                >
                  <GithubIcon className="w-4 h-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/fatma-nur-karag%C3%B6z-78678a294/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-1.5 sm:gap-0 text-xs text-slate-600 dark:text-slate-400">
              <span className="text-center sm:text-left">© 2026 Fatma Nur Karagöz.</span>
              <span className="text-center">Tüm hakları saklıdır.</span>
              <span className="hidden sm:block" aria-hidden="true" />
            </div>
          </footer>
        </div>
      </div>

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
