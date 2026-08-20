import React from 'react';
import { useApp } from '../context/AppContext';
import { getEducationLabel } from '../lib/labels';
import { Mail, GraduationCap, Briefcase, Target, LogOut } from 'lucide-react';
import { MiniDecorScene } from './hero3d/decor/MiniDecorScene';
import { PottedPlant } from './hero3d/decor/PottedPlant';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user, setUserMode } = useApp();
  const isStudent = user.mode === 'STUDENT';

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
          isStudent ? 'bg-brand-pink-dark/10 border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light' : 'bg-brand-mint-dark/10 border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint'
        }`}>
          Hesap Bilgileri
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Profilim</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Kayıt sırasında girdiğin bilgiler burada yer alır.</p>
      </div>

      <div className="relative glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        <MiniDecorScene className="absolute -top-4 -right-4 w-24 h-24" cameraPosition={[0, 0.4, 2.4]}>
          <PottedPlant position={[0, -0.1, 0]} scale={1.4} />
        </MiniDecorScene>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xl text-brand-pink-dark dark:text-brand-pink-light shrink-0">
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

        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Platform Modu</div>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/80 dark:bg-slate-950 rounded-xl">
            <button
              onClick={() => setUserMode('STUDENT')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                isStudent
                  ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark text-white shadow-md glow-pink'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Öğrenci</span>
            </button>
            <button
              onClick={() => setUserMode('LIFELONG_LEARNER')}
              className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                !isStudent
                  ? 'bg-gradient-to-r from-brand-mint to-brand-mint-dark text-white shadow-md glow-mint'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Gelişim</span>
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold text-xs hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};
