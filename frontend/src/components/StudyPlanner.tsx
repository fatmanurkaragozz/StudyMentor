import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient, type SubjectWithTopics, type RecommendationResult, type DailyTaskRow, type MySubject } from '../lib/apiClient';
import { PRIORITY_LABELS, PRIORITY_COLORS } from './onboarding/priorityLabels';
import { getKaptanSessionMessage } from '../lib/kaptan';
import { ReminderPrompt } from './ReminderPrompt';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Star,
  Sparkles,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  ListTodo,
  PlusCircle,
  Trash2,
  Compass,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const todayKey = () => new Date().toISOString().split('T')[0];
const SIDEBAR_PAGE_SIZE = 5;

export const StudyPlanner: React.FC = () => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  // Timer states
  const [durations, setDurations] = useState<Record<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK', number>>({
    POMODORO: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
  });
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CUSTOM'>('POMODORO');

  // Real ders/konu data
  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [pursuitName, setPursuitName] = useState('');

  // Gelisim modu icin kendi ugraslarim - getTopics() ile KARISTIRMIYORUZ, cunku o
  // uc nokta LIFELONG_LEARNER icin de seed.ts'teki global ornek dersleri ("Yazilim
  // Gelistirme" vb.) donuyor. /subjects/mine ise sadece bu kullanicinin kendi
  // ekledigi ugraslari donuyor (ayni MyCourses.tsx'in kullandigi uc nokta).
  const [myPursuits, setMyPursuits] = useState<MySubject[]>([]);
  const [loadingPursuits, setLoadingPursuits] = useState(true);

  // Form states for log modal
  const [difficulty, setDifficulty] = useState<number>(3);
  const [productivity, setProductivity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<RecommendationResult | null>(null);

  // Günlük to-do listesi
  const [dailyTasks, setDailyTasks] = useState<DailyTaskRow[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [taskError, setTaskError] = useState<string | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  // Yan panelde ders/uğraş listesi uzadıkça sayfa aşağı doğru uzamasın diye sayfalama.
  const [sidebarPage, setSidebarPage] = useState(1);

  useEffect(() => {
    apiClient
      .getTopics(user.mode)
      .then(data => {
        setSubjects(data);
        if (isStudent && data.length > 0) {
          setSelectedSubjectId(data[0].subjectId);
          if (data[0].topics.length > 0) setSelectedTopicId(data[0].topics[0].id);
        }
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Dersler yüklenemedi'))
      .finally(() => setLoadingSubjects(false));
  }, [isStudent, user.mode]);

  useEffect(() => {
    if (isStudent) return;
    setLoadingPursuits(true);
    apiClient
      .getMySubjects(user.mode)
      .then(setMyPursuits)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Uğraşlar yüklenemedi'))
      .finally(() => setLoadingPursuits(false));
  }, [isStudent, user.mode]);

  const loadTasks = () => {
    apiClient
      .getDailyTasks(todayKey())
      .then(setDailyTasks)
      .catch(err => setTaskError(err instanceof Error ? err.message : 'Görevler yüklenemedi'))
      .finally(() => setLoadingTasks(false));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowCompleteModal(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const switchMode = (mode: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setIsRunning(false);
    setTimerMode(mode);
    setSecondsLeft(durations[mode] * 60);
  };

  const handleDurationChange = (minutes: number) => {
    if (timerMode === 'CUSTOM') return;
    const clamped = Math.max(1, Math.min(180, Math.round(minutes) || 1));
    setDurations(prev => ({ ...prev, [timerMode]: clamped }));
    if (!isRunning) setSecondsLeft(clamped * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId) ?? null;
  const activeTopicName = isStudent
    ? selectedSubject?.topics.find(t => t.id === selectedTopicId)?.name ?? null
    : pursuitName.trim() || null;

  const sidebarItems = isStudent ? subjects : myPursuits;
  const sidebarTotalPages = Math.max(1, Math.ceil(sidebarItems.length / SIDEBAR_PAGE_SIZE));
  useEffect(() => {
    setSidebarPage(p => Math.min(p, sidebarTotalPages));
  }, [sidebarTotalPages]);
  const pagedSidebarItems = sidebarItems.slice((sidebarPage - 1) * SIDEBAR_PAGE_SIZE, sidebarPage * SIDEBAR_PAGE_SIZE);

  const sidebarPagination = sidebarTotalPages > 1 ? (
    <div className="flex items-center justify-center gap-1 pt-1">
      <button
        type="button"
        onClick={() => setSidebarPage(p => Math.max(1, p - 1))}
        disabled={sidebarPage === 1}
        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-all"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {Array.from({ length: sidebarTotalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          type="button"
          onClick={() => setSidebarPage(page)}
          className={`min-w-[26px] px-1.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
            page === sidebarPage
              ? isStudent
                ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark text-white'
                : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark text-white'
              : 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setSidebarPage(p => Math.min(sidebarTotalPages, p + 1))}
        disabled={sidebarPage === sidebarTotalPages}
        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 transition-all"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  ) : null;

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = subjects.find(s => s.subjectId === subjectId);
    setSelectedTopicId(subject?.topics[0]?.id ?? '');
  };

  const canSubmit = isStudent ? !!selectedTopicId : pursuitName.trim().length > 0;

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      let subjectId = selectedSubjectId;
      let topicId = selectedTopicId;

      if (!isStudent) {
        const created = await apiClient.createCustomSubject({ name: pursuitName.trim(), mode: user.mode });
        subjectId = created.subjectId;
        topicId = created.topicId;
      }

      if (!subjectId || !topicId) return;

      const totalSeconds = durations[timerMode === 'CUSTOM' ? 'POMODORO' : timerMode] * 60;
      const durationMins = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60)) || durations.POMODORO;
      const res = await apiClient.createStudySession({
        subjectId,
        topicId,
        durationMinutes: durationMins,
        difficulty,
        productivity,
        notes: notes.trim() || undefined,
      });
      setSubmitResult(res);
      if (activeTaskId) {
        await apiClient.completeDailyTask(activeTaskId, res.studySession.id);
        loadTasks();
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Kayıt başarısız oldu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowCompleteModal(false);
    setActiveTaskId(null);
    setNotes('');
    setPursuitName('');
    setSubmitResult(null);
    setSubmitError(null);
    setSecondsLeft(durations[timerMode === 'CUSTOM' ? 'POMODORO' : timerMode] * 60);
  };

  const handleAddTask = async () => {
    setAddingTask(true);
    setTaskError(null);
    try {
      let subjectId = selectedSubjectId;
      let topicId = selectedTopicId;

      if (!isStudent) {
        if (!pursuitName.trim()) return;
        const created = await apiClient.createCustomSubject({ name: pursuitName.trim(), mode: user.mode });
        subjectId = created.subjectId;
        topicId = created.topicId;
      }

      if (!subjectId || !topicId) return;
      await apiClient.createDailyTask({ subjectId, topicId, date: todayKey() });
      loadTasks();
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Eklenemedi');
    } finally {
      setAddingTask(false);
    }
  };

  const handleStartTaskSession = (task: DailyTaskRow) => {
    setActiveTaskId(task.id);
    setSelectedSubjectId(task.subjectId);
    setSelectedTopicId(task.topicId);
    setSecondsLeft(durations[timerMode === 'CUSTOM' ? 'POMODORO' : timerMode] * 60);
    setIsRunning(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient.deleteDailyTask(taskId);
      loadTasks();
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Silinemedi');
    }
  };

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    const label = isStudent ? 'dersi' : 'uğraşı';
    if (!window.confirm(`"${subjectName}" ${label} silmek istediğine emin misin? Bu derse ait tüm konular ve çalışma kayıtları da silinecek.`)) {
      return;
    }
    setDeletingSubjectId(subjectId);
    setLoadError(null);
    try {
      await apiClient.deleteSubject(subjectId);
      const data = await apiClient.getTopics(user.mode);
      setSubjects(data);
      if (selectedSubjectId === subjectId) {
        setSelectedSubjectId(data[0]?.subjectId ?? '');
        setSelectedTopicId(data[0]?.topics[0]?.id ?? '');
      }
      if (!isStudent) {
        const mine = await apiClient.getMySubjects(user.mode);
        setMyPursuits(mine);
        if (pursuitName === subjectName) setPursuitName('');
      }
      loadTasks();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            isStudent
              ? 'bg-brand-pink-dark/10 border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light'
              : 'bg-brand-mint-dark/10 border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint'
          }`}>
            {isStudent ? '🎓 Ders & Konu Odaklanması' : '💼 Proje & Beceriler Zamanlayıcısı'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            {isStudent ? 'Çalışma & Pomodoro Zirvesi' : 'Derin Odaklanma (Deep Work) Zamanlayıcısı'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Odaklanma sürenizi takip edin, oturum sonunda zorluk ve verimlilik verilerini kaydederek AI modelini eğitin.
          </p>
        </div>
      </div>

      {/* Günlük To-Do Listesi */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 shrink-0">
            <ListTodo className={`w-4 h-4 ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`} />
            <span>Bugün Ne Çalışacağım?</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {isStudent ? (
              <>
                <select
                  value={selectedSubjectId}
                  onChange={e => handleSelectSubject(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-pink-dark"
                >
                  {subjects.map(s => (
                    <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                  ))}
                </select>
                <select
                  value={selectedTopicId}
                  onChange={e => setSelectedTopicId(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-pink-dark"
                >
                  {selectedSubject?.topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </>
            ) : (
              <input
                type="text"
                placeholder="Örn: Python Öğreniyorum, Gitar Pratiği"
                value={pursuitName}
                onChange={e => setPursuitName(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-brand-mint-dark"
              />
            )}
            <button
              onClick={handleAddTask}
              disabled={addingTask || (isStudent ? !selectedTopicId : !pursuitName.trim())}
              className={`px-3 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shrink-0 ${
                isStudent ? 'bg-brand-pink-dark hover:opacity-90' : 'bg-brand-mint-dark hover:opacity-90'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Bugüne Ekle</span>
            </button>
          </div>
        </div>

        {taskError && (
          <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{taskError}</span>
          </div>
        )}

        {loadingTasks ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Görevler yükleniyor...</span>
          </div>
        ) : dailyTasks.length === 0 ? (
          <div className="text-xs text-slate-500 dark:text-slate-500">Bugün için henüz bir çalışma maddesi eklemedin.</div>
        ) : (
          <div className="space-y-2">
            {dailyTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                  task.status === 'DONE'
                    ? 'bg-brand-mint-dark/10 border-brand-mint-dark/30'
                    : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{task.subjectName}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{task.topicName}</div>
                </div>
                {task.status === 'DONE' ? (
                  <span className="flex items-center gap-1 text-brand-mint-dark dark:text-brand-mint font-semibold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tamamlandı</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartTaskSession(task)}
                      className={`px-2.5 py-1.5 rounded-lg text-white font-semibold text-[10px] ${
                        isStudent ? 'bg-brand-pink-dark hover:opacity-90' : 'bg-brand-mint-dark hover:opacity-90'
                      }`}
                    >
                      Oturum Başlat
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Timer Box */}
        <div className="lg:col-span-2 lg:sticky lg:top-6 glass-panel p-8 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-6 text-center">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => switchMode('POMODORO')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'POMODORO'
                  ? (isStudent ? 'bg-brand-pink-dark text-white' : 'bg-brand-mint-dark text-white')
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Odak (25dk)
            </button>
            <button
              onClick={() => switchMode('SHORT_BREAK')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'SHORT_BREAK' ? 'bg-brand-gold-dark text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Kısa Mola (5dk)
            </button>
            <button
              onClick={() => switchMode('LONG_BREAK')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'LONG_BREAK' ? 'bg-brand-violet text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Uzun Mola (15dk)
            </button>
          </div>

          {activeTaskId && (
            <div className={`flex items-center gap-1.5 text-[11px] font-semibold rounded-lg px-3 py-1.5 border ${
              isStudent
                ? 'text-brand-pink-dark dark:text-brand-pink-light bg-brand-pink-dark/10 border-brand-pink-dark/30'
                : 'text-brand-mint-dark dark:text-brand-mint bg-brand-mint-dark/10 border-brand-mint-dark/30'
            }`}>
              <ListTodo className="w-3.5 h-3.5" />
              <span>
                Şu an çalışıyorsun: {selectedSubject?.subjectName ?? ''}
                {activeTopicName ? ` — ${activeTopicName}` : ''}
              </span>
            </div>
          )}

          {/* Süre Ayarı */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span>Süre (dakika):</span>
            <input
              type="number"
              min={1}
              max={180}
              value={durations[timerMode === 'CUSTOM' ? 'POMODORO' : timerMode]}
              disabled={isRunning}
              onChange={e => handleDurationChange(Number(e.target.value))}
              className="w-16 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1 text-center text-slate-900 dark:text-slate-200 disabled:opacity-50 focus:outline-none focus:border-brand-pink-dark"
            />
          </div>

          {/* Big Time Display */}
          <div className="relative my-4">
            <div className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-slate-100 tracking-wider font-mono">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {isRunning ? '🔥 Derin Odaklanma Süreci Devam Ediyor...' : 'Zamanlayıcı Duraklatıldı'}
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                isRunning
                  ? 'bg-brand-gold-dark hover:opacity-90'
                  : isStudent
                    ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 glow-pink'
                    : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 glow-mint'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(durations[timerMode === 'CUSTOM' ? 'POMODORO' : timerMode] * 60);
              }}
              className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                setActiveTaskId(null);
                setShowCompleteModal(true);
              }}
              className="px-4 py-3 rounded-xl bg-brand-mint-dark/10 border border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint font-semibold text-xs hover:bg-brand-mint-dark/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Oturumu Kaydet</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Subject Picker & AI Tip */}
        <div className="space-y-6">
          {isStudent && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light" />
                <span>Ders / Konu Seçimi</span>
              </h3>

              {loadingSubjects && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dersler yükleniyor...</span>
                </div>
              )}

              {loadError && (
                <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              <div className="space-y-2">
                {pagedSidebarItems.map(item => (
                  <div
                    key={item.subjectId}
                    onClick={() => handleSelectSubject(item.subjectId)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      selectedSubjectId === item.subjectId
                        ? 'bg-brand-pink-dark/20 border-brand-pink-dark/50 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{item.subjectName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{item.topics.length} konu</div>
                    </div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSubject(item.subjectId, item.subjectName);
                      }}
                      disabled={deletingSubjectId === item.subjectId}
                      title={isStudent ? 'Dersi Sil' : 'Uğraşı Sil'}
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 shrink-0 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {sidebarPagination}
            </div>
          )}

          {!isStudent && (
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint" />
                <span>Uğraşlarım</span>
              </h3>

              {loadingPursuits && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uğraşlar yükleniyor...</span>
                </div>
              )}

              {loadError && (
                <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              {!loadingPursuits && myPursuits.length === 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  Henüz bir uğraş eklemedin - yukarıya yazıp oturum kaydettiğinde burada listelenecek.
                </div>
              )}

              <div className="space-y-2">
                {pagedSidebarItems.map(item => (
                  <div
                    key={item.subjectId}
                    onClick={() => setPursuitName(item.subjectName)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      pursuitName === item.subjectName
                        ? 'bg-brand-mint-dark/20 border-brand-mint-dark/50 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{item.subjectName}</div>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteSubject(item.subjectId, item.subjectName);
                      }}
                      disabled={deletingSubjectId === item.subjectId}
                      title="Uğraşı Sil"
                      className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 shrink-0 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              {sidebarPagination}
            </div>
          )}

          <div className="glass-panel p-4 rounded-xl border border-brand-gold-dark/30 bg-brand-gold/5 dark:bg-brand-gold-dark/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-gold-dark dark:text-brand-gold">
              <Sparkles className="w-4 h-4" />
              <span>ML Algoritma Hatırlatması</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              {isStudent
                ? 'Oturum sonundaki zorluk (1-5) ve verim (1-5) puanlaması, Spaced Repetition (Aralıklı Tekrar) algoritmasının bir sonraki tekrar tarihinizi hesaplaması için kritiktir.'
                : 'Oturumu kaydederken neyle uğraştığını yazacaksın, AI Koç Kaptan bu veriyle sana özel bir öncelik hesaplayacak.'}
            </p>
          </div>
        </div>
      </div>

      {/* Save Session Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-mint-dark dark:text-brand-mint" />
              <span>Çalışma Oturumunu Kaydet</span>
            </h3>

            {!submitResult ? (
              <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
                {isStudent ? (
                  <>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Ders</label>
                      <select
                        value={selectedSubjectId}
                        onChange={e => handleSelectSubject(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark"
                      >
                        {subjects.map(s => (
                          <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Konu</label>
                      <select
                        value={selectedTopicId}
                        onChange={e => setSelectedTopicId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark"
                      >
                        {selectedSubject?.topics.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Neyle uğraşıyorsun?</label>
                    <input
                      type="text"
                      placeholder="Örn: Python Öğreniyorum, Gitar Pratiği"
                      value={pursuitName}
                      onChange={e => setPursuitName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-mint-dark"
                    />
                  </div>
                )}

                {/* Difficulty Rating */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Zorluk Algısı (1: Çok Kolay - 5: Çok Zor)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setDifficulty(star)}
                        className={`p-2 rounded-lg border transition-all ${
                          difficulty >= star
                            ? 'bg-brand-gold-dark/20 border-brand-gold-dark/50 text-brand-gold-dark dark:text-brand-gold'
                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Productivity Rating */}
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Verimlilik Algısı (1: Düşük - 5: Zirve Odak)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setProductivity(star)}
                        className={`p-2 rounded-lg border transition-all ${
                          productivity >= star
                            ? isStudent
                              ? 'bg-brand-pink-dark/20 border-brand-pink-dark/50 text-brand-pink-dark dark:text-brand-pink-light'
                              : 'bg-brand-mint-dark/20 border-brand-mint-dark/50 text-brand-mint-dark dark:text-brand-mint'
                            : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Ek Notlar (Opsiyonel)</label>
                  <textarea
                    placeholder="Eksik kalan kısımlar veya sonraki tekrar için notlar..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark h-20 resize-none"
                  />
                </div>

                {submitError && (
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !canSubmit}
                    className={`px-5 py-2.5 rounded-xl disabled:opacity-50 text-white font-semibold shadow-lg ${
                      isStudent
                        ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 glow-pink'
                        : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 glow-mint'
                    }`}
                  >
                    {submitting ? 'Kaydediliyor...' : 'Veritabanına Kaydet'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                {submitResult.mlAvailable && submitResult.priority ? (
                  <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 font-semibold ${PRIORITY_COLORS[submitResult.priority]}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{PRIORITY_LABELS[submitResult.priority]}</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                    ML servisi şu anda ulaşılamıyor, verilerin kaydedildi.
                  </div>
                )}

                {(() => {
                  const message = getKaptanSessionMessage({
                    id: submitResult.recommendation?.id ?? selectedTopicId ?? 'kaptan-session',
                    firstName: user.name.split(' ')[0],
                    priority: submitResult.priority,
                    difficulty,
                    productivity,
                    topicName: activeTopicName,
                    subjectName: selectedSubject?.subjectName ?? null,
                  });
                  return (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-violet-hover dark:text-brand-violet">
                        <Compass className="w-3.5 h-3.5" />
                        <span>Kaptan</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{message.title}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{message.content}</p>
                    </div>
                  );
                })()}

                {submitResult.proposedReminder && (
                  <ReminderPrompt
                    topicId={selectedTopicId}
                    initialIntervalDays={submitResult.proposedReminder.intervalDays}
                  />
                )}

                <button
                  onClick={handleCloseModal}
                  className={`w-full py-2.5 rounded-xl text-white font-semibold shadow-lg ${
                    isStudent
                      ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 glow-pink'
                      : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 glow-mint'
                  }`}
                >
                  Kapat
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
