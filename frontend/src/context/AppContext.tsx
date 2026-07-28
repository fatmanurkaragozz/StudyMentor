import React, { createContext, useContext, useState } from 'react';
import type { UserProfile, UserMode, StudySession, Habit, JournalEntry, ExamOrMilestone, AIRecommendation, SubjectOrProject } from '../types';

interface AppContextType {
  user: UserProfile;
  setUserMode: (mode: UserMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sessions: StudySession[];
  addSession: (session: Omit<StudySession, 'id' | 'date' | 'mode'>) => void;
  habits: Habit[];
  toggleHabit: (habitId: string, dateStr: string) => void;
  addHabit: (name: string, category: string) => void;
  journals: JournalEntry[];
  addJournalEntry: (content: string, mood: JournalEntry['mood']) => void;
  milestones: ExamOrMilestone[];
  addMilestone: (milestone: Omit<ExamOrMilestone, 'id'>) => void;
  recommendations: AIRecommendation[];
  subjectsOrProjects: SubjectOrProject[];
}

const initialSubjectsStudent: SubjectOrProject[] = [
  { id: 's1', name: 'Matematik (TÜREV & İNTEGRAL)', category: 'Sayısal', progress: 68, color: 'from-blue-500 to-indigo-600' },
  { id: 's2', name: 'Fizik (AYT Mekanik)', category: 'Sayısal', progress: 54, color: 'from-cyan-500 to-blue-600' },
  { id: 's3', name: 'Kimya (Organik Kimya)', category: 'Sayısal', progress: 82, color: 'from-purple-500 to-indigo-600' },
  { id: 's4', name: 'Türkçe / Paragraf Hız', category: 'Sözel', progress: 90, color: 'from-emerald-500 to-teal-600' },
];

const initialSubjectsLearner: SubjectOrProject[] = [
  { id: 'p1', name: 'Python & FastApi Microservices', category: 'Yazılım', progress: 75, color: 'from-emerald-500 to-teal-600' },
  { id: 'p2', name: 'React + TypeScript Architecture', category: 'Yazılım', progress: 88, color: 'from-blue-500 to-cyan-600' },
  { id: 'p3', name: 'İngilizce Konuşma & Akıcılık', category: 'Dil Öğrenimi', progress: 60, color: 'from-purple-500 to-pink-600' },
  { id: 'p4', name: 'Finansal Okuryazarlık & Yatırım', category: 'Kişisel Gelişim', progress: 45, color: 'from-amber-500 to-orange-600' },
];

const initialSessions: StudySession[] = [
  { id: '1', title: 'Türev Alma Kuralları & Soru Çözümü', subjectOrProjectName: 'Matematik (TÜREV & İNTEGRAL)', durationMinutes: 45, difficulty: 4, productivity: 5, notes: 'Özel tanımlı fonksiyonlar tamamlandı.', date: '2026-07-23', mode: 'STUDENT' },
  { id: '2', title: 'FastAPI Router & Async Handlers', subjectOrProjectName: 'Python & FastApi Microservices', durationMinutes: 60, difficulty: 3, productivity: 5, notes: 'Dependency injection kalıbı uygulandı.', date: '2026-07-23', mode: 'LIFELONG_LEARNER' },
  { id: '3', title: 'Fizik Vektörler & Dinamik Testi', subjectOrProjectName: 'Fizik (AYT Mekanik)', durationMinutes: 50, difficulty: 3, productivity: 4, notes: 'Yanlış sorular incelendi.', date: '2026-07-22', mode: 'STUDENT' },
  { id: '4', title: 'Daily English Listening & Speaking', subjectOrProjectName: 'İngilizce Konuşma & Akıcılık', durationMinutes: 30, difficulty: 2, productivity: 4, notes: 'BBC Learning Podcast dinlendi.', date: '2026-07-22', mode: 'LIFELONG_LEARNER' },
];

const initialHabits: Habit[] = [
  { id: 'h1', name: 'Günlük 30 Sayfa Kitap Okuma', category: 'Gelişim', streakDays: 7, completedDates: ['2026-07-21', '2026-07-22', '2026-07-23'] },
  { id: 'h2', name: 'Erken Kalkış (07:00)', category: 'Rutin', streakDays: 5, completedDates: ['2026-07-22', '2026-07-23'] },
  { id: 'h3', name: 'Su Tüketimi (2.5L)', category: 'Sağlık', streakDays: 12, completedDates: ['2026-07-21', '2026-07-22', '2026-07-23'] },
  { id: 'h4', name: 'Kod / Soru Pratiği (1 Saat)', category: 'Odak', streakDays: 9, completedDates: ['2026-07-21', '2026-07-22', '2026-07-23'] },
];

const initialJournals: JournalEntry[] = [
  {
    id: 'j1',
    content: 'Bugün odaklanma seviyem oldukça yüksekti. Zorlandığım konularda pes etmeyip üzerine gittim. AI Koçun önerdiği tekrar planı çok faydalı oldu.',
    mood: '🚀',
    sentimentScore: 0.85,
    createdAt: '2026-07-23 09:30',
  },
  {
    id: 'j2',
    content: 'Biraz yorgun hissettim ama günlük rutinlerimi aksatmadan tamamladım. Akşam kısa bir yürüyüş iyi geldi.',
    mood: '😊',
    sentimentScore: 0.42,
    createdAt: '2026-07-22 21:15',
  },
];

const initialMilestones: ExamOrMilestone[] = [
  {
    id: 'm1',
    title: 'AYT Genel Genelleme Denemesi #4',
    date: '2026-08-15',
    targetScore: 480,
    resultScore: 462,
    type: 'EXAM',
    details: [
      { subject: 'Matematik', score: 34.5 },
      { subject: 'Fizik', score: 11.25 },
      { subject: 'Kimya', score: 12.0 },
    ],
  },
  {
    id: 'm2',
    title: 'StudyMentor Microservice MVP Release',
    date: '2026-08-01',
    targetScore: 100,
    type: 'PROJECT',
    details: [
      { subject: 'FastAPI Backend', score: 90 },
      { subject: 'React Frontend', score: 85 },
    ],
  },
];

const initialRecommendations: AIRecommendation[] = [
  {
    id: 'r1',
    title: 'Spaced Repetition: Matematik Türev Tekrarı',
    content: 'Son çalışma verilerinize göre Türev konusundaki verim katsayınız yükseliyor. Unutma eğrisini sıfırlamak için bugün 25 dakikalık hızlı soru tekrarı yapmalısınız.',
    type: 'REVISION',
    mode: 'STUDENT',
    actionText: 'Tekrar Oturumu Başlat',
  },
  {
    id: 'r2',
    title: 'Proje Odak Sertleştirme: FastApi Async Handlers',
    content: 'Son 3 gündür Python microservices projenize düzenli odaklanıyorsunuz. Aşırı zihinsel yorgunluğu önlemek için 50dk çalışma sonrası 10dk mola önerilir.',
    type: 'STUDY_PRIORITY',
    mode: 'LIFELONG_LEARNER',
    actionText: 'Odak Zamanlayıcısını Çalıştır',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    id: 'u-1',
    name: 'Fatmanur Karagöz',
    email: 'fatmanur@studymentor.ai',
    mode: 'STUDENT',
    educationLevel: 'HIGH_SCHOOL',
    targetGoal: 'YKS 2026 Derece & Full-Stack AI Engineer',
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sessions, setSessions] = useState<StudySession[]>(initialSessions);
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [journals, setJournals] = useState<JournalEntry[]>(initialJournals);
  const [milestones, setMilestones] = useState<ExamOrMilestone[]>(initialMilestones);
  const [recommendations] = useState<AIRecommendation[]>(initialRecommendations);

  const setUserMode = (mode: UserMode) => {
    setUser(prev => ({
      ...prev,
      mode,
      educationLevel: mode === 'STUDENT' ? 'HIGH_SCHOOL' : 'LIFELONG_LEARNER',
    }));
  };

  const addSession = (sessionData: Omit<StudySession, 'id' | 'date' | 'mode'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mode: user.mode,
    };
    setSessions(prev => [newSession, ...prev]);
  };

  const toggleHabit = (habitId: string, dateStr: string) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== habitId) return habit;
        const exists = habit.completedDates.includes(dateStr);
        const updatedDates = exists
          ? habit.completedDates.filter(d => d !== dateStr)
          : [...habit.completedDates, dateStr];
        return {
          ...habit,
          completedDates: updatedDates,
          streakDays: exists ? Math.max(0, habit.streakDays - 1) : habit.streakDays + 1,
        };
      })
    );
  };

  const addHabit = (name: string, category: string) => {
    const newHabit: Habit = {
      id: 'h-' + Date.now(),
      name,
      category,
      streakDays: 0,
      completedDates: [],
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const addJournalEntry = (content: string, mood: JournalEntry['mood']) => {
    // Simple sentiment analyzer mock score
    const positiveWords = ['harika', 'iyi', 'başarılı', 'yüksek', 'verimli', 'sevindim', 'güzel'];
    const lower = content.toLowerCase();
    let score = 0.2;
    positiveWords.forEach(w => {
      if (lower.includes(w)) score += 0.25;
    });
    score = Math.min(1.0, Math.max(-1.0, score));

    const newEntry: JournalEntry = {
      id: 'j-' + Date.now(),
      content,
      mood,
      sentimentScore: Number(score.toFixed(2)),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setJournals(prev => [newEntry, ...prev]);
  };

  const addMilestone = (milestoneData: Omit<ExamOrMilestone, 'id'>) => {
    const newMilestone: ExamOrMilestone = {
      ...milestoneData,
      id: 'm-' + Date.now(),
    };
    setMilestones(prev => [newMilestone, ...prev]);
  };

  const subjectsOrProjects = user.mode === 'STUDENT' ? initialSubjectsStudent : initialSubjectsLearner;

  return (
    <AppContext.Provider
      value={{
        user,
        setUserMode,
        activeTab,
        setActiveTab,
        sessions,
        addSession,
        habits,
        toggleHabit,
        addHabit,
        journals,
        addJournalEntry,
        milestones,
        addMilestone,
        recommendations,
        subjectsOrProjects,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
