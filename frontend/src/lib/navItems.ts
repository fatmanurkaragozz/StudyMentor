import type { ComponentType } from 'react';
import { LayoutDashboard, Timer, CalendarDays, Sparkles, Flame, UserCircle, BookOpen, type LucideProps } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  shortLabel: string;
  icon: ComponentType<LucideProps>;
}

export function getNavItems(isStudent: boolean): NavItem[] {
  return [
    { id: 'dashboard', label: 'Ana Dashboard', shortLabel: 'Panel', icon: LayoutDashboard },
    { id: 'courses', label: isStudent ? 'Derslerim' : 'Uğraşlarım', shortLabel: isStudent ? 'Dersler' : 'Uğraşlar', icon: BookOpen },
    { id: 'planner', label: isStudent ? 'Çalışma & Pomodoro' : 'Odak & Zamanlayıcı', shortLabel: 'Pomodoro', icon: Timer },
    { id: 'calendar', label: 'Takvim', shortLabel: 'Takvim', icon: CalendarDays },
    { id: 'growth', label: 'Habit & Journal Hub', shortLabel: 'Habit', icon: Flame },
    { id: 'insights', label: 'AI Analiz & Koç', shortLabel: 'AI Koç', icon: Sparkles },
    { id: 'profile', label: 'Profilim', shortLabel: 'Profil', icon: UserCircle },
  ];
}
