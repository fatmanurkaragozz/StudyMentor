import React from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Timer, 
  CalendarDays, 
  Sparkles, 
  Flame, 
  GraduationCap,
  Briefcase,
  TrendingUp,
  Sun,
  Moon,
  Home,
  UserCircle,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  onGoToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onGoToLanding }) => {
  const { activeTab, setActiveTab, user, setUserMode } = useApp();
  const { theme, toggleTheme } = useTheme();

  const isStudent = user.mode === 'STUDENT';

  const menuItems = [
    { id: 'dashboard', label: 'Ana Dashboard', icon: LayoutDashboard },
    ...(isStudent ? [{ id: 'courses', label: 'Derslerim', icon: BookOpen }] : []),
    { id: 'planner', label: isStudent ? 'Çalışma & Pomodoro' : 'Odak & Zamanlayıcı', icon: Timer },
    { id: 'calendar', label: isStudent ? 'Takvim' : 'Proje & Milestones', icon: CalendarDays },
    { id: 'growth', label: 'Habit & Journal Hub', icon: Flame },
    { id: 'insights', label: 'AI Analiz & Koç', icon: Sparkles },
    { id: 'profile', label: 'Profilim', icon: UserCircle },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 min-h-screen shrink-0">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md glow-indigo">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 dark:text-white tracking-tight leading-none">StudyMentor</h1>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">AI Learning & Habit</span>
            </div>
          </div>

          {/* Return to Landing Page Button */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              title="Açılış Sayfasına Dön"
            >
              <Home className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Profil Özeti */}
        <div className="bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 mb-6">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-2 font-semibold">
            <span>Platform Modu:</span>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:scale-105 transition-all shadow-sm"
              title="Aydınlık / Karanlık Mod Değiştir"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-950 rounded-xl">
            <button
              onClick={() => setUserMode('STUDENT')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                isStudent
                  ? 'bg-indigo-600 text-white shadow-md glow-indigo'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Öğrenci</span>
            </button>
            <button
              onClick={() => setUserMode('LIFELONG_LEARNER')}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                !isStudent
                  ? 'bg-emerald-600 text-white shadow-md glow-emerald'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Gelişim</span>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? isStudent 
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shadow-sm' 
                      : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isStudent ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target Goal Summary Box */}
      <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 font-semibold">
          <span>Ana Hedef:</span>
          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
        </div>
        <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">
          {user.targetGoal}
        </p>
      </div>
    </aside>
  );
};
