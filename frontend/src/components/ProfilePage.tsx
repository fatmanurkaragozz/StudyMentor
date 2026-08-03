import React from 'react';
import { useApp } from '../context/AppContext';
import { getEducationLabel } from '../lib/labels';
import { Mail, GraduationCap, Briefcase, Target, LogOut } from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
          isStudent ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          Hesap Bilgileri
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Profilim</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Kayıt sırasında girdiğin bilgiler burada yer alır.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xl text-indigo-600 dark:text-indigo-400 shrink-0">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              <span>Eğitim Seviyesi</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getEducationLabel(user)}</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Target className="w-3.5 h-3.5" />
              <span>Ana Hedef</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.targetGoal}</div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-xs hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};
