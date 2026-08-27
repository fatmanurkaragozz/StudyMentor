import React, { useEffect, useRef, useState } from 'react';
import { Bell, CalendarClock, Sparkles } from 'lucide-react';
import { apiClient, type DueTopicReminder } from '../lib/apiClient';
import { useRecommendations } from '../hooks/useRecommendations';

// Ayri bir "Notification" modeli/servisi kurmak yerine zaten var olan iki ozelligi
// (useRecommendations - Dashboard/AIInsights'in kullandigi ayni /recommendations
// fetch'i - ve TopicReminder due listesi) birlestiren hafif bir panel. Header'i
// sismesin diye ayri dosyada.
export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { recommendations, loading: recsLoading, reload: reloadRecommendations } = useRecommendations();
  const unread = recommendations.filter(r => !r.isRead);
  const [dueReminders, setDueReminders] = useState<DueTopicReminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const refreshReminders = async () => {
    setRemindersLoading(true);
    try {
      setDueReminders(await apiClient.getDueTopicReminders());
    } catch {
      // Bildirim paneli ikincil bir ozellik - sessizce bos gosterilir.
    } finally {
      setRemindersLoading(false);
    }
  };

  useEffect(() => {
    refreshReminders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) {
      reloadRecommendations();
      refreshReminders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const markRead = async (id: string) => {
    try {
      await apiClient.markRecommendationRead(id);
    } catch {
      // sessizce yut
    } finally {
      reloadRecommendations();
    }
  };

  const snoozeReminder = async (reminder: DueTopicReminder) => {
    setDueReminders(prev => prev.filter(r => r.topicId !== reminder.topicId));
    try {
      await apiClient.respondToTopicReminder(reminder.topicId, reminder.intervalDays, true);
    } catch {
      // sessizce yut
    }
  };

  const total = unread.length + dueReminders.length;
  const loading = recsLoading || remindersLoading;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-xl transition-all"
        aria-label="Bildirimler"
      >
        <Bell className="w-4 h-4" />
        {total > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-pink-dark animate-pulse" />}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto glass-panel border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-40 p-2 space-y-1.5">
          {loading && total === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-4">Yükleniyor...</p>
          )}
          {!loading && total === 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center py-4">Yeni bildirimin yok.</p>
          )}

          {dueReminders.map(reminder => (
            <div key={reminder.topicId} className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <CalendarClock className="w-3.5 h-3.5" />
                <span>Tekrar Zamanı</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-200">
                <strong>{reminder.topicName}</strong> ({reminder.subjectName}) konusunu tekrar etme zamanı geldi.
              </p>
              <button
                type="button"
                onClick={() => snoozeReminder(reminder)}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {reminder.intervalDays} gün sonra tekrar hatırlat
              </button>
            </div>
          ))}

          {unread.map(rec => (
            <button
              key={rec.id}
              type="button"
              onClick={() => markRead(rec.id)}
              className="w-full text-left p-3 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-brand-pink-dark/40 transition-all space-y-1"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-pink-dark dark:text-brand-pink-light">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{rec.kaptan.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{rec.kaptan.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
