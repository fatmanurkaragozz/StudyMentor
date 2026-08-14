import { useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { DeskHeroAnimation } from './DeskHeroAnimation';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
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
  const stage = useHeroIntroSequence();

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
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      {/* Ambient arka plan - çok düşük opaklıkta iki renk lekesi, dikkat çekmeyen bir doku */}
      <div className="absolute top-10 right-[10%] w-72 h-72 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/[0.05] blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-24 left-[6%] w-80 h-80 rounded-full bg-violet-500/[0.06] dark:bg-violet-500/[0.05] blur-3xl pointer-events-none select-none" />

      <header className="relative z-30 h-20 px-6 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">StudyMentor</h1>
            <span className="hidden sm:block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              Akıllı Çalışma Planlayıcı
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-indigo-300 hover:scale-105 transition-all shadow-sm"
            title="Aydınlık / Karanlık Mod Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </button>

          <Button variant="ghost" size="sm" onClick={openLogin}>
            Giriş Yap
          </Button>

          <Button variant="primary" size="sm" onClick={openRegister}>
            Ücretsiz Kayıt Ol
          </Button>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pt-10 sm:pt-14 pb-8 text-center">
        <DeskHeroAnimation stage={stage} />
        <h2 className="mt-8 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Çalışma rotanı planla,
          <br className="hidden sm:block" /> ilerlemeni takip et.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          StudyMentor; ders ve konu takibini, alışkanlıklarını ve yapay zeka destekli tekrar önerilerini tek yerde
          birleştirir.
        </p>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">
        <div
          className={`w-full grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch transition-all duration-700 ease-out ${
            stage === 'modes' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <Card accent="indigo" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-indigo-600/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
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
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span>Ders ve Konu Bazlı Akıllı Tekrar Planı</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span>Deneme Sınavları &amp; Ders Net Analizi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md font-black text-xs">
              VS
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3 text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>Öğrenci</span>
              </div>
              <div className="h-12 w-0.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <span>Gelişim</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <Card accent="violet" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-violet-600/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
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
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
                  <span>Proje &amp; Beceriler İlerleme Paneli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
                  <span>Alışkanlık Zinciri (Habit Tracker Matrix)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
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
