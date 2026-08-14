import { useState } from 'react';
import type { FC } from 'react';
import { Bell, Minus, Plus } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface ReminderPromptProps {
  topicId: string;
  initialIntervalDays: number;
}

// StudyPlanner ve TopicCheckModal'in oturum-sonu ekranlarinin ikisinde de kullanilir -
// ML bir oncelik hesaplayip henuz aktif bir hatirlatmasi olmayan bir konu bulunca
// backend bu prompt'u tetikleyen `proposedReminder` alanini dolduruyor (bkz.
// scoreAndRecommend cagrisindan sonraki proposeReminder()).
export const ReminderPrompt: FC<ReminderPromptProps> = ({ topicId, initialIntervalDays }) => {
  const [intervalDays, setIntervalDays] = useState(initialIntervalDays);
  const [status, setStatus] = useState<'ASKING' | 'SUBMITTING' | 'ACCEPTED' | 'DECLINED'>('ASKING');

  const respond = async (accept: boolean) => {
    setStatus('SUBMITTING');
    try {
      await apiClient.respondToTopicReminder(topicId, intervalDays, accept);
    } catch {
      // Hatirlatma ikincil bir ozellik - kaydedilmese bile ana akisi (oturum zaten
      // kaydedildi) bozmuyoruz, sessizce kullaniciya "tamam" gibi davraniyoruz.
    }
    setStatus(accept ? 'ACCEPTED' : 'DECLINED');
  };

  if (status === 'DECLINED') return null;

  if (status === 'ACCEPTED') {
    return (
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
        <Bell className="w-4 h-4 shrink-0" />
        <span>Tamam, {intervalDays} günde bir bu konuyu tekrar etmeni hatırlatacağım.</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 space-y-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
        <Bell className="w-3.5 h-3.5" />
        <span>Hatırlatma Önerisi</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
        Bu gidişata göre <strong>{intervalDays} günde bir</strong> bu konuyu tekrar etmen senin için önemli görünüyor. Hatırlatma eklememi ister misin?
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIntervalDays((d) => Math.max(1, d - 1))}
          disabled={status === 'SUBMITTING'}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-16 text-center">{intervalDays} gün</span>
        <button
          type="button"
          onClick={() => setIntervalDays((d) => Math.min(60, d + 1))}
          disabled={status === 'SUBMITTING'}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          disabled={status === 'SUBMITTING'}
          onClick={() => respond(false)}
          className="py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] disabled:opacity-50 transition-all"
        >
          Hayır, gerek yok
        </button>
        <button
          type="button"
          disabled={status === 'SUBMITTING'}
          onClick={() => respond(true)}
          className="py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] disabled:opacity-50 transition-all"
        >
          Evet, hatırlat
        </button>
      </div>
    </div>
  );
};
