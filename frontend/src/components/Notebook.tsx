import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  NotebookPen,
  X,
  CalendarCheck,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  apiClient,
  type StudySessionRow,
  type DailyTaskRow,
  type SubjectWithTopics,
  type MySubject,
} from '../lib/apiClient';
import { addDays, formatPlanTime, localDateKey, localMonthRange, parseDateKey, timeOfDay } from '../lib/dateKey';
import type { UserMode } from '../types';
import { NoCoursesHint } from './NoCoursesHint';

const WEEKDAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'];

// Oturumun saat araligi: startedAt varsa ondan. Eski kayitlarda (startedAt yok) kayit anindan
// geriye dogru tahmin ediliyor ve arayuzde "≈" ile isaretleniyor.
function sessionTimeRange(s: StudySessionRow) {
  const durationMs = s.durationMinutes * 60_000;
  if (s.startedAt) {
    const start = new Date(s.startedAt);
    return { start, end: new Date(start.getTime() + durationMs), approximate: false };
  }
  const end = new Date(s.createdAt);
  return { start: new Date(end.getTime() - durationMs), end, approximate: true };
}

type DaySession = { session: StudySessionRow } & ReturnType<typeof sessionTimeRange>;

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} dk`;
  return m > 0 ? `${h} sa ${m} dk` : `${h} sa`;
};

export const Notebook: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const mode = user.mode;
  const isStudent = mode === 'STUDENT';
  const todayKey = localDateKey();

  const [selectedKey, setSelectedKey] = useState(todayKey);
  const monthKey = `${selectedKey.slice(0, 7)}-01`;
  const isFuture = selectedKey > todayKey;
  const isPast = selectedKey < todayKey;

  // Ayin oturumlari tek istekle gelir: hem mini takvimdeki noktalar hem secili gunun listesi bundan.
  const [monthSessions, setMonthSessions] = useState<StudySessionRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionsVersion, setSessionsVersion] = useState(0);

  const [tasks, setTasks] = useState<DailyTaskRow[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksVersion, setTasksVersion] = useState(0);

  const [error, setError] = useState<string | null>(null);

  const [planTitle, setPlanTitle] = useState('');
  const [planStart, setPlanStart] = useState('');
  const [planEnd, setPlanEnd] = useState('');
  const [addingPlan, setAddingPlan] = useState(false);

  const [showEntryModal, setShowEntryModal] = useState(false);

  // Gunler/aylar arasinda hizli gecerken eski bir cevap yenisinin uzerine yazmasin (ignore bayragi).
  useEffect(() => {
    let ignore = false;
    setLoadingSessions(true);
    apiClient
      .getStudySessions(mode, localMonthRange(monthKey))
      .then(data => {
        if (!ignore) setMonthSessions(data);
      })
      .catch(err => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Çalışma kayıtları yüklenemedi');
      })
      .finally(() => {
        if (!ignore) setLoadingSessions(false);
      });
    return () => {
      ignore = true;
    };
  }, [mode, monthKey, sessionsVersion]);

  useEffect(() => {
    let ignore = false;
    setLoadingTasks(true);
    apiClient
      .getDailyTasks(mode, selectedKey)
      .then(data => {
        if (!ignore) setTasks(data);
      })
      .catch(err => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Planlar yüklenemedi');
      })
      .finally(() => {
        if (!ignore) setLoadingTasks(false);
      });
    return () => {
      ignore = true;
    };
  }, [mode, selectedKey, tasksVersion]);

  const sessionsByDay = useMemo(() => {
    const byDay = new Map<string, DaySession[]>();
    for (const session of monthSessions) {
      const range = sessionTimeRange(session);
      const key = localDateKey(range.start);
      byDay.set(key, [...(byDay.get(key) ?? []), { session, ...range }]);
    }
    for (const list of byDay.values()) list.sort((a, b) => a.start.getTime() - b.start.getTime());
    return byDay;
  }, [monthSessions]);

  const daySessions = sessionsByDay.get(selectedKey) ?? [];
  const dayTotal = daySessions.reduce((sum, { session }) => sum + session.durationMinutes, 0);

  const accentText = isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint';
  const accentButton = isStudent ? 'bg-brand-pink-dark hover:opacity-90' : 'bg-brand-mint-dark hover:opacity-90';

  const runTaskAction = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
      setTasksVersion(v => v + 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız oldu');
      return false;
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle.trim()) return;
    if (planEnd && !planStart) {
      setError('Bitiş saati için başlangıç saatini de gir.');
      return;
    }
    if (planStart && planEnd && planEnd <= planStart) {
      setError('Bitiş saati başlangıçtan sonra olmalı.');
      return;
    }
    setAddingPlan(true);
    const added = await runTaskAction(() =>
      apiClient.createDailyTask({
        title: planTitle.trim(),
        startTime: planStart || undefined,
        endTime: planEnd || undefined,
        date: selectedKey,
        mode,
      }),
    );
    if (added) {
      setPlanTitle('');
      setPlanStart('');
      setPlanEnd('');
    }
    setAddingPlan(false);
  };

  // Mini takvim: secili gunun ayi, Pazartesi ile baslayan hafta satirlari.
  const monthStart = parseDateKey(monthKey);
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  const leadingBlanks = (monthStart.getDay() + 6) % 7;
  const monthLabel = monthStart.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const shiftMonth = (delta: number) =>
    setSelectedKey(localDateKey(new Date(monthStart.getFullYear(), monthStart.getMonth() + delta, 1)));

  const dayTitle = parseDateKey(selectedKey).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            isStudent
              ? 'bg-brand-pink-dark/10 border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light'
              : 'bg-brand-mint-dark/10 border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint'
          }`}
        >
          📓 Çalışma Defteri
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Defterim</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {isStudent
            ? 'Hangi gün hangi saatlerde hangi derse çalıştığını gör, günlerine plan ve not yaz.'
            : 'Hangi gün hangi saatlerde hangi uğraşına zaman ayırdığını gör, günlerine plan ve not yaz.'}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Gun gezinmesi */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setSelectedKey(addDays(selectedKey, -1))}
              aria-label="Önceki gün"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{dayTitle}</div>
              {selectedKey !== todayKey && (
                <button type="button" onClick={() => setSelectedKey(todayKey)} className={`text-[11px] font-semibold ${accentText} hover:underline`}>
                  Bugüne dön
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setSelectedKey(addDays(selectedKey, 1))}
              aria-label="Sonraki gün"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Ne calistim */}
          <section className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <NotebookPen className={`w-4 h-4 ${accentText}`} />
                <span>Ne çalıştım</span>
              </h3>
              <div className="flex items-center gap-3">
                {dayTotal > 0 && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">toplam {formatMinutes(dayTotal)}</span>
                )}
                {!isFuture && (
                  <button
                    type="button"
                    onClick={() => setShowEntryModal(true)}
                    className={`px-2.5 py-1.5 rounded-lg text-white font-semibold text-[11px] flex items-center gap-1 ${accentButton}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Geçmişe ekle</span>
                  </button>
                )}
              </div>
            </div>

            {isFuture ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Bu gün henüz gelmedi; aşağıya planını yazabilirsin.</p>
            ) : loadingSessions ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yükleniyor...</span>
              </div>
            ) : daySessions.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bu gün için kayıtlı bir çalışma yok. Sayaçla çalıştığında burada otomatik görünür; sayaçsız çalıştıysan "Geçmişe ekle"yi kullan.
              </p>
            ) : (
              <ul className="space-y-2">
                {daySessions.map(({ session, start, end, approximate }) => (
                  <li
                    key={session.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span
                          className="font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0"
                          title={approximate ? 'Eski kayıt: saat aralığı tahmini' : undefined}
                        >
                          {approximate ? '≈' : ''}
                          {timeOfDay(start)}–{timeOfDay(end)}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {session.subjectName} — {session.topicName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                        {formatMinutes(session.durationMinutes)} · zorluk {session.difficulty}/5 · verim {session.productivity}/5
                      </span>
                    </div>
                    {session.notes && <p className="mt-1.5 text-[11px] italic text-slate-500 dark:text-slate-400">“{session.notes}”</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Planlar & notlar */}
          <section className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarCheck className={`w-4 h-4 ${accentText}`} />
              <span>Planlar & notlar</span>
            </h3>

            {loadingTasks ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Yükleniyor...</span>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Bu gün için plan ya da not yok.</p>
            ) : (
              <ul className="space-y-2">
                {tasks.map(task => {
                  const done = task.status === 'DONE';
                  const time = formatPlanTime(task.startTime, task.endTime);
                  return (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() =>
                          runTaskAction(() => apiClient.updateDailyTask(task.id, { status: done ? 'PLANNED' : 'DONE' }))
                        }
                        aria-label={done ? 'Yapılmadı olarak işaretle' : 'Yapıldı olarak işaretle'}
                        className={`w-4 h-4 shrink-0 ${isStudent ? 'accent-brand-pink-dark' : 'accent-brand-mint-dark'}`}
                      />
                      {time && <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300 shrink-0">{time}</span>}
                      <span
                        className={`flex-1 min-w-0 ${
                          done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title ?? `${task.subjectName} — ${task.topicName}`}
                      </span>
                      {!done && isPast && (
                        <button
                          type="button"
                          onClick={() => runTaskAction(() => apiClient.updateDailyTask(task.id, { date: todayKey }))}
                          className={`text-[11px] font-semibold ${accentText} hover:underline shrink-0`}
                        >
                          Bugüne taşı
                        </button>
                      )}
                      {!done && task.topicId && selectedKey === todayKey && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('planner')}
                          title="Çalışma & Odak ekranında oturumu başlat"
                          className={`text-[11px] font-semibold ${accentText} hover:underline flex items-center gap-1 shrink-0`}
                        >
                          <Play className="w-3 h-3" />
                          <span>Başlat</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => runTaskAction(() => apiClient.deleteDailyTask(task.id))}
                        aria-label="Sil"
                        className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <form onSubmit={handleAddPlan} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                value={planTitle}
                onChange={e => setPlanTitle(e.target.value)}
                placeholder={isStudent ? 'Örn: Fizik deneme çöz, hocaya soruları sor' : 'Örn: Blog yazısının taslağını bitir'}
                maxLength={200}
                className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={planStart}
                  onChange={e => setPlanStart(e.target.value)}
                  aria-label="Başlangıç saati (isteğe bağlı)"
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
                <input
                  type="time"
                  value={planEnd}
                  onChange={e => setPlanEnd(e.target.value)}
                  aria-label="Bitiş saati (isteğe bağlı)"
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addingPlan || !planTitle.trim()}
                  className={`px-3 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 ${accentButton}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ekle</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Mini ay takvimi */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Önceki ay"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">{monthLabel}</span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Sonraki ay"
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map(label => (
              <div key={label} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">
                {label}
              </div>
            ))}
            {Array.from({ length: leadingBlanks }, (_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const key = addDays(monthKey, i);
              const studied = sessionsByDay.has(key);
              const selected = key === selectedKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-label={`${i + 1}${studied ? ', çalışma var' : ''}`}
                  aria-pressed={selected}
                  className={`relative aspect-square rounded-lg text-[11px] font-medium transition-all ${
                    selected
                      ? `text-white ${isStudent ? 'bg-brand-pink-dark' : 'bg-brand-mint-dark'}`
                      : key === todayKey
                        ? `border ${isStudent ? 'border-brand-pink-dark/50' : 'border-brand-mint-dark/50'} text-slate-800 dark:text-slate-200`
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {i + 1}
                  {studied && (
                    <span
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        selected ? 'bg-white' : isStudent ? 'bg-brand-pink-dark' : 'bg-brand-mint-dark'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Noktalı günler çalışma kaydı olan günler.</p>
        </div>
      </div>

      {showEntryModal && (
        <PastSessionModal
          mode={mode}
          defaultDate={selectedKey}
          maxDate={todayKey}
          onClose={() => setShowEntryModal(false)}
          onSaved={() => {
            setShowEntryModal(false);
            setSessionsVersion(v => v + 1);
          }}
        />
      )}
    </div>
  );
};

const RatingPicker: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div>
    <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{label}</span>
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          className={`w-8 h-8 rounded-lg border text-xs font-semibold ${
            value === n
              ? 'bg-brand-gold-dark/20 border-brand-gold-dark/50 text-brand-gold-dark dark:text-brand-gold'
              : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  </div>
);

// Sayac kullanilmadan yapilan bir calismayi gecmise ekler - normal bir oturum gibi kaydedilir
// (istatistiklere ve AI onerilerine yansir).
const PastSessionModal: React.FC<{
  mode: UserMode;
  defaultDate: string;
  maxDate: string;
  onClose: () => void;
  onSaved: () => void;
}> = ({ mode, defaultDate, maxDate, onClose, onSaved }) => {
  const isStudent = mode === 'STUDENT';
  const [date, setDate] = useState(defaultDate);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(isStudent);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [pursuits, setPursuits] = useState<MySubject[]>([]);
  const [pursuitName, setPursuitName] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [productivity, setProductivity] = useState(4);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isStudent) {
      apiClient
        .getTopics(mode)
        .then(data => {
          setSubjects(data);
          if (data.length > 0) {
            setSubjectId(data[0].subjectId);
            setTopicId(data[0].topics[0]?.id ?? '');
          }
        })
        .catch(err => setError(err instanceof Error ? err.message : 'Dersler yüklenemedi'))
        .finally(() => setLoadingSubjects(false));
    } else {
      apiClient
        .getMySubjects(mode)
        .then(setPursuits)
        .catch(() => {
          // Oneri listesi; yuklenemese de uğraş adi elle yazilabilir.
        });
    }
  }, [isStudent, mode]);

  const selectedSubject = subjects.find(s => s.subjectId === subjectId) ?? null;
  const canSave = !!start && !!end && (isStudent ? !!topicId : !!pursuitName.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // "YYYY-MM-DDTHH:mm" (offset'siz) tarayicida yerel saat olarak yorumlanir.
    const startAt = new Date(`${date}T${start}`);
    const endAt = new Date(`${date}T${end}`);
    if (endAt <= startAt) {
      setError('Bitiş saati başlangıçtan sonra olmalı.');
      return;
    }
    if (endAt.getTime() > Date.now()) {
      setError('Henüz bitmemiş bir çalışma eklenemez.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let sid = subjectId;
      let tid = topicId;
      if (!isStudent) {
        const created = await apiClient.createCustomSubject({ name: pursuitName.trim(), mode });
        sid = created.subjectId;
        tid = created.topicId;
      }
      await apiClient.createStudySession({
        subjectId: sid,
        topicId: tid,
        durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60_000),
        difficulty,
        productivity,
        notes: notes.trim() || undefined,
        startedAt: startAt.toISOString(),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    'w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none';

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Geçmişe çalışma ekle</h3>
          <button type="button" onClick={onClose} aria-label="Kapat" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-2">
            <label className="col-span-3 sm:col-span-1">
              <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Tarih</span>
              <input type="date" value={date} max={maxDate} onChange={e => setDate(e.target.value)} required className={fieldClass} />
            </label>
            <label>
              <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Başlangıç</span>
              <input type="time" value={start} onChange={e => setStart(e.target.value)} required className={fieldClass} />
            </label>
            <label>
              <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Bitiş</span>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)} required className={fieldClass} />
            </label>
          </div>

          {isStudent ? (
            loadingSubjects ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dersler yükleniyor...</span>
              </div>
            ) : subjects.length === 0 ? (
              <NoCoursesHint student />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <label>
                  <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Ders</span>
                  <select
                    value={subjectId}
                    onChange={e => {
                      setSubjectId(e.target.value);
                      setTopicId(subjects.find(s => s.subjectId === e.target.value)?.topics[0]?.id ?? '');
                    }}
                    className={fieldClass}
                  >
                    {subjects.map(s => (
                      <option key={s.subjectId} value={s.subjectId}>
                        {s.subjectName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Konu</span>
                  <select value={topicId} onChange={e => setTopicId(e.target.value)} className={fieldClass}>
                    {selectedSubject?.topics.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )
          ) : (
            <label className="block">
              <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Neyle uğraştın?</span>
              <input
                type="text"
                list="notebook-pursuits"
                value={pursuitName}
                onChange={e => setPursuitName(e.target.value)}
                placeholder="Örn: Gitar Pratiği"
                className={fieldClass}
              />
              <datalist id="notebook-pursuits">
                {pursuits.map(p => (
                  <option key={p.subjectId} value={p.subjectName} />
                ))}
              </datalist>
            </label>
          )}

          <RatingPicker label="Zorluk (1-5)" value={difficulty} onChange={setDifficulty} />
          <RatingPicker label="Verim (1-5)" value={productivity} onChange={setProductivity} />

          <label className="block">
            <span className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Not (isteğe bağlı)</span>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${fieldClass} h-16 resize-none`} />
          </label>

          {error && (
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold">
              İptal
            </button>
            <button
              type="submit"
              disabled={saving || !canSave}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50 ${
                isStudent ? 'bg-brand-pink-dark hover:opacity-90' : 'bg-brand-mint-dark hover:opacity-90'
              }`}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
