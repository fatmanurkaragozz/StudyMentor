import type { FC } from 'react';
import { Compass, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIntros } from '../context/IntroContext';
import { getFirstWelcomeMessage } from '../lib/labels';

// İlk kayıttan sonra dashboard'da bir kez gösterilen karşılama şeridi. Görünürlüğü
// App.tsx MainLayout kontrol eder: welcomePending && activeTab === 'dashboard'.
// Görsel kimlik Dashboard'daki "Kaptan (AI Koç)" bannerıyla aynı - menekşe Compass.
export const WelcomeBanner: FC = () => {
  const { user } = useApp();
  const { endWelcome } = useIntros();
  const { title, body } = getFirstWelcomeMessage(user);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <div role="status" className="relative glass-panel rounded-2xl border border-brand-violet/30 p-5">
        <button
          type="button"
          onClick={endWelcome}
          aria-label="Karşılamayı kapat"
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pr-7">
          <div className="w-12 h-12 rounded-xl bg-brand-violet/20 border border-brand-violet/30 text-brand-violet-hover dark:text-brand-violet flex items-center justify-center shrink-0 glow-violet">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
