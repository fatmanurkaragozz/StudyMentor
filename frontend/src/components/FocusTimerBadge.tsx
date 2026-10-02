import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Timer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFocusTimer } from '../context/FocusTimerContext';
import { formatTime, secondsUntil } from '../lib/focusTimer';

// Odak sayaci calisirken baska bir sekmedeysen ust barda kalan sureyi gosterir, tiklayinca sayac
// ekranina doner. Sadece aktif modun sayaci - diger modun sayaci bu modda gorunmez.
export const FocusTimerBadge: FC = () => {
  const { user, activeTab, setActiveTab } = useApp();
  const { endsAt } = useFocusTimer(user.mode);
  const isVisible = endsAt !== null && activeTab !== 'planner';

  // Header her saniye render olmasin diye saniyelik yenileme sadece bu bilesende.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const left = secondsUntil(endsAt);
  const isStudent = user.mode === 'STUDENT';

  return (
    <button
      type="button"
      onClick={() => setActiveTab('planner')}
      aria-label={left === 0 ? 'Odak sayacı: süre doldu' : `Odak sayacı: ${formatTime(left)} kaldı`}
      className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-semibold hover:opacity-80 transition-all ${
        isStudent
          ? 'text-brand-pink-dark dark:text-brand-pink-light bg-brand-pink-dark/10 border-brand-pink-dark/30'
          : 'text-brand-mint-dark dark:text-brand-mint bg-brand-mint-dark/10 border-brand-mint-dark/30'
      }`}
    >
      <Timer className="w-4 h-4" />
      <span className="tabular-nums">{left === 0 ? 'Süre doldu' : formatTime(left)}</span>
    </button>
  );
};
