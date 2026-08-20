import React from 'react';
import { useApp } from '../context/AppContext';
import { getNavItems } from '../lib/navItems';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab, user } = useApp();
  const isStudent = user.mode === 'STUDENT';
  const menuItems = getNavItems(isStudent);

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 glass-panel border-t border-slate-200 dark:border-slate-800 flex items-stretch justify-around px-1"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-semibold transition-all ${
              isActive
                ? isStudent
                  ? 'text-brand-pink-dark dark:text-brand-pink-light'
                  : 'text-brand-mint-dark dark:text-brand-mint'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="truncate max-w-[54px]">{item.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
};
