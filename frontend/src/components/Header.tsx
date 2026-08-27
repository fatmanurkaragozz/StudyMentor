import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getEducationLabel } from '../lib/labels';
import { Search, UserCheck } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export const Header: React.FC = () => {
  const { user, setActiveTab } = useApp();
  const isStudent = user.mode === 'STUDENT';
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchPlaceholder = isStudent ? 'Ders, konu veya sınav ara...' : 'Proje, beceri veya not ara...';

  return (
    <header className="h-16 glass-panel border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      {mobileSearchOpen ? (
        <div className="sm:hidden relative flex-1 min-w-0 mr-2">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            onBlur={() => setMobileSearchOpen(false)}
            type="text"
            placeholder={searchPlaceholder}
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-pink-dark transition-all"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-xl transition-all"
          aria-label="Ara"
        >
          <Search className="w-4 h-4" />
        </button>
      )}

      <div className="hidden sm:block relative w-80">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-pink-dark transition-all"
        />
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <NotificationBell />

        {/* User Profile Info */}
        <button
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 pl-2 border-l border-slate-300 dark:border-slate-800 hover:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-brand-pink-dark dark:text-brand-pink-light">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{user.name}</span>
              <UserCheck className="w-3.5 h-3.5 text-brand-mint-dark dark:text-brand-mint" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {getEducationLabel(user)}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
