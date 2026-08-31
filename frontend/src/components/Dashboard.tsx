import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient, type StudySessionRow, type HabitRow, type ExamDto } from '../lib/apiClient';
import { useRecommendations } from '../hooks/useRecommendations';
import { getWelcomeMessage } from '../lib/labels';
import { IntroHint } from './IntroHint';
import {
  Clock,
  Flame,
  Target,
  ArrowUpRight,
  CheckCircle2,
  Play,
  Zap,
  BookOpen,
  TrendingUp,
  Compass,
  Loader2,
  Sparkles,
  Repeat,
  PlusCircle,
  AlertCircle,
  CalendarClock,
  Bell
} from 'lucide-react';

interface DueTopic {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  nextReview: string;
  // 'reminder' = kullanicinin kendi kabul ettigi kisisel hatirlatma (TopicReminder),
  // 'ml' = modelin oncelik hesabina gore onerdigi genel tekrar tarihi (Topic.nextReview).
  source: 'ml' | 'reminder';
}

interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalTopics: number;
  studiedTopics: number;
  progress: number;
}

const PROGRESS_COLORS = [
  'from-brand-pink-light to-brand-pink-dark',
  'from-brand-mint to-brand-mint-dark',
  'from-brand-gold to-brand-gold-dark',
  'from-brand-violet to-brand-violet-hover',
  'from-brand-pink-dark to-brand-violet',
  'from-brand-mint-dark to-brand-gold-dark',
];

const todayLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export const Dashboard: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [sessions, setSessions] = useState<StudySessionRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [habits, setHabits] = useState<HabitRow[]>([]);

  // Metrics Calculations
  const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgProductivity = (
    sessions.reduce((acc, s) => acc + s.productivity, 0) / (sessions.length || 1)
  ).toFixed(1);

  const activeHabitStreak = Math.max(...habits.map(h => h.streakDays), 0);

  const { recommendations: aiRecommendations, loading: loadingRecommendations } = useRecommendations();

  const [dueTopics, setDueTopics] = useState<DueTopic[]>([]);
  const [loadingDue, setLoadingDue] = useState(true);
  const [dueError, setDueError] = useState<string | null>(null);
  const [addedTaskTopicIds, setAddedTaskTopicIds] = useState<Set<string>>(new Set());

  const [exams, setExams] = useState<ExamDto[]>([]);

  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    apiClient
      .getStudySessions(user.mode)
      .then(setSessions)
      .finally(() => setLoadingSessions(false));
    apiClient.getHabits(user.mode).then(setHabits);
    apiClient.getExams(user.mode).then(setExams);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    Promise.all([apiClient.getTopics(user.mode), apiClient.getDueTopicReminders()])
      .then(([subjectsWithTopics, dueReminders]) => {
        // Kisisel hatirlatmasi olan bir konu, ML'in genel nextReview'inde de tekrar
        // gorunmesin diye once o topicId'leri cikariyoruz - ayni konu iki kez listelenmez.
        const reminderTopicIds = new Set(dueReminders.map(r => r.topicId));
        const mlDue: DueTopic[] = subjectsWithTopics
          .flatMap(s =>
            s.topics
              .filter(t => t.nextReview && new Date(t.nextReview) <= endOfToday && !reminderTopicIds.has(t.id))
              .map(t => ({
                subjectId: s.subjectId,
                subjectName: s.subjectName,
                topicId: t.id,
                topicName: t.name,
                nextReview: t.nextReview as string,
                source: 'ml' as const,
              }))
          );
        const reminderDue: DueTopic[] = dueReminders.map(r => ({
          subjectId: r.subjectId,
          subjectName: r.subjectName,
          topicId: r.topicId,
          topicName: r.topicName,
          nextReview: r.nextReminderAt,
          source: 'reminder' as const,
        }));
        const due = [...mlDue, ...reminderDue].sort(
          (a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
        );
        setDueTopics(due);

        const progress = subjectsWithTopics.map(s => {
          const total = s.topics.length;
          const studied = s.topics.filter(t => t.lastStudied).length;
          return {
            subjectId: s.subjectId,
            subjectName: s.subjectName,
            totalTopics: total,
            studiedTopics: studied,
            progress: total > 0 ? Math.round((studied / total) * 100) : 0,
          };
        });
        setSubjectProgress(progress);
      })
      .catch(err => setDueError(err instanceof Error ? err.message : 'Tekrar listesi yüklenemedi'))
      .finally(() => {
        setLoadingDue(false);
        setLoadingProgress(false);
      });
  }, [user.mode]);

  const handleAddDueToToday = async (topic: DueTopic) => {
    setDueError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      await apiClient.createDailyTask({ subjectId: topic.subjectId, topicId: topic.topicId, date: today });
      setAddedTaskTopicIds(prev => new Set(prev).add(topic.topicId));
    } catch (err) {
      setDueError(err instanceof Error ? err.message : 'Eklenemedi');
    }
  };

  const latestRecommendation = aiRecommendations[0] ?? null;

  const startOfToday = new Date(new Date().toDateString());
  const upcomingExam = exams
    .filter(e => new Date(e.date) >= startOfToday)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] ?? null;
  const daysToExam = upcomingExam
    ? Math.ceil((new Date(upcomingExam.date).getTime() - startOfToday.getTime()) / 86400000)
    : null;
  const dueForExamCount = upcomingExam
    ? dueTopics.filter(t => upcomingExam.subjects.some(s => s.name === t.subjectName)).length
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className={`relative overflow-hidden rounded-2xl glass-panel p-6 border ${isStudent ? 'border-brand-pink-dark/20' : 'border-brand-mint-dark/20'}`}>
        <div className={`absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${isStudent ? 'bg-brand-pink-dark/10' : 'bg-brand-mint-dark/10'}`}></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${isStudent
                  ? 'bg-brand-pink-dark/10 border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light'
                  : 'bg-brand-mint-dark/10 border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint'
                }`}>
                {isStudent ? '🎓 Öğrenci Modu' : '💼 Kişisel Gelişim & Kariyer Modu'}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">| {todayLabel}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Tekrar Hoş Geldin, {user.name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {getWelcomeMessage(user)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center gap-2 shadow-lg ${isStudent
                  ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 glow-pink'
                  : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 glow-mint'
                }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isStudent ? 'Sınav Çalışması Başlat' : 'Proje Odaklanması Başlat'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Study Time */}
        <div className="glass-card p-4 rounded-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Toplam Odak Süresi</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isStudent ? 'bg-brand-pink-dark/10 text-brand-pink-dark dark:text-brand-pink-light' : 'bg-brand-mint-dark/10 text-brand-mint-dark dark:text-brand-mint'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalHours} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Saat</span></div>
          <div className="mt-2 text-[11px] text-brand-mint-dark dark:text-brand-mint flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{sessions.length} kayıtlı oturum</span>
          </div>
        </div>

        {/* Card 2: Productivity Score */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Verimlilik Skoru</span>
            <div className="w-8 h-8 rounded-lg bg-brand-gold-dark/10 text-brand-gold-dark dark:text-brand-gold flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{avgProductivity} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ 5.0</span></div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {Number(avgProductivity) >= 4.0 ? '🔥 Yüksek Derin Odaklanma Seviyesi' : '⚡ Dengeli Çalışma Ritmi'}
          </div>
        </div>

        {/* Card 3: Active Habit Streak */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Alışkanlık Zinciri (Streak)</span>
            <div className="w-8 h-8 rounded-lg bg-brand-pink-dark/10 text-brand-pink-dark dark:text-brand-pink-light flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activeHabitStreak} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">Gün</span></div>
          <div className="mt-2 text-[11px] text-brand-pink-dark dark:text-brand-pink-light font-medium">
            <span>Zinciri kırma! Düzenli rutini koruyorsun.</span>
          </div>
        </div>

        {/* Card 4: Next Exam/Goal Countdown */}
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isStudent ? 'Yaklaşan Sınav Hedefi' : 'Yaklaşan Hedef'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-gold-dark/10 text-brand-gold-dark dark:text-brand-gold flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
            {upcomingExam?.name || (isStudent ? 'Henüz sınav eklenmedi' : 'Henüz hedef eklenmedi')}
          </div>
          <div className="mt-2 text-[11px] text-brand-gold-dark dark:text-brand-gold font-medium">
            <span>{upcomingExam?.targetScore != null ? `Hedef Puan/Skor: ${upcomingExam.targetScore}` : "Takvim'den ekleyebilirsin"}</span>
          </div>
        </div>
      </div>

      {/* Kaptan (AI Koç) Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-brand-violet/30 relative overflow-hidden">
        <div className="mb-3">
          <IntroHint kind="feature" id="kaptan" />
        </div>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-violet/20 border border-brand-violet/30 text-brand-violet-hover dark:text-brand-violet flex items-center justify-center shrink-0 glow-violet">
            <Compass className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-brand-violet/20 text-brand-violet-hover dark:text-brand-violet border border-brand-violet/30">
                Kaptan
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Senin AI Rehberin</span>
            </div>

            {loadingRecommendations && (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Kaptan verilerine bakıyor...</span>
              </div>
            )}

            {!loadingRecommendations && latestRecommendation && (
              <>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{latestRecommendation.kaptan.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {latestRecommendation.kaptan.content}
                </p>
                {latestRecommendation.topicId && (
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-violet-hover dark:text-brand-violet hover:opacity-80 transition-opacity"
                  >
                    <span>AI Analiz'e Git</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}

            {!loadingRecommendations && !latestRecommendation && (
              <>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kaptan henüz sana dair bir şey bilmiyor</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Bir konu seç ve ilk mini kontrolünü yap, Kaptan sana özel önerilerini oluşturmaya başlasın.
                </p>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-violet-hover dark:text-brand-violet hover:opacity-80 transition-opacity"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isStudent ? 'Derslerime Git' : 'Uğraşlarıma Git'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sınav Geri Sayımı */}
      {upcomingExam && (
        <div className="glass-panel p-5 rounded-2xl border border-brand-gold-dark/30 bg-brand-gold/5 dark:bg-brand-gold-dark/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-brand-gold-dark dark:text-brand-gold" />
                <span>{upcomingExam.name}'e Geri Sayım</span>
              </h3>
              {dueForExamCount > 0 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {isStudent ? 'Bu sınava bağlı derslerden' : 'Bu hedefe bağlı uğraşlardan'} {dueForExamCount} konu tekrar bekliyor.
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-brand-gold-dark dark:text-brand-gold leading-none">{daysToExam}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">gün kaldı</div>
            </div>
          </div>
        </div>
      )}

      {/* Aralıklı Tekrar - Bugün Tekrar Zamanı */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <IntroHint kind="feature" id="spaced-repetition" />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Repeat className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>Bugün Tekrar Zamanı</span>
          </h3>
          {dueTopics.length > 0 && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{dueTopics.length} konu</span>
          )}
        </div>

        {dueError && (
          <div className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{dueError}</span>
          </div>
        )}

        {loadingDue ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Kontrol ediliyor...</span>
          </div>
        ) : dueTopics.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">Şu an tekrar bekleyen bir konu yok, gemi rotada 🧭</p>
        ) : (
          <div className="space-y-2">
            {dueTopics.map(topic => {
              const added = addedTaskTopicIds.has(topic.topicId);
              return (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{topic.topicName}</span>
                      {topic.source === 'reminder' && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-brand-pink-dark/15 border border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light text-[9px] font-bold uppercase tracking-wide">
                          <Bell className="w-2.5 h-2.5" />
                          <span>Kişisel Hatırlatma</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{topic.subjectName}</div>
                  </div>
                  {added ? (
                    <span className="flex items-center gap-1 text-brand-mint-dark dark:text-brand-mint font-semibold text-[10px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Bugüne Eklendi</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddDueToToday(topic)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[10px] flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Bugüne Ekle</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Column Section: Active Subjects/Projects & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Subjects / Projects Progress */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`} />
                <span>{isStudent ? 'Aktif Müfredat Dersleri & İlerleme' : 'Aktif Beceriler & Proje Takibi'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Konu bazlı gerçek çalışma ilerlemen</p>
            </div>
            <button
              onClick={() => setActiveTab('courses')}
              className={`text-xs hover:underline ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`}
            >
              Tümünü Gör
            </button>
          </div>

          {loadingProgress && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Dersler yükleniyor...</span>
            </div>
          )}

          {!loadingProgress && subjectProgress.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isStudent ? 'Henüz ders eklemedin. "Derslerim" sekmesinden başlayabilirsin.' : 'Henüz uğraş eklemedin. "Uğraşlarım" sekmesinden başlayabilirsin.'}
            </p>
          )}

          <div className="space-y-3">
            {subjectProgress.slice(0, 5).map((item, idx) => (
              <div key={item.subjectId} className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{item.subjectName}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                      {item.studiedTopics}/{item.totalTopics} konu
                    </span>
                    <span className={`font-bold ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`}>{item.progress}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${PROGRESS_COLORS[idx % PROGRESS_COLORS.length]} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Recent Activity / Sessions */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint" />
              <span>Son Oturum Kayıtları</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{sessions.length} Kayıt</span>
          </div>

          {loadingSessions && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Oturumlar yükleniyor...</span>
            </div>
          )}

          {!loadingSessions && sessions.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Henüz kayıtlı bir çalışma oturumun yok.</p>
          )}

          <div className="space-y-3">
            {sessions.slice(0, 3).map(session => (
              <div key={session.id} className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{session.topicName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{session.durationMinutes} dk</span>
                </div>
                <div className={`text-[11px] font-medium ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`}>{session.subjectName}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 pt-1">
                  <span>Verim: {'⭐'.repeat(session.productivity)}</span>
                  <span>{new Date(session.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
