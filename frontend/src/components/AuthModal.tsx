import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserMode } from '../types';
import { X, GraduationCap, Briefcase, Mail, Lock, User, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'LOGIN' | 'REGISTER';
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'LOGIN', onSuccess }) => {
  const { setUserMode } = useApp();
  const [authType, setAuthType] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedUserMode, setSelectedUserMode] = useState<UserMode>('STUDENT');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserMode(selectedUserMode);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-amber-500/20 bg-slate-900/95 text-slate-100 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            {authType === 'LOGIN' ? 'StudyMentor\'e Giriş Yap' : 'Aramıza Katıl & Hesabını Aç'}
          </h2>
          <p className="text-xs text-slate-400">
            {authType === 'LOGIN' 
              ? 'Çalışma ve kişisel gelişim yolculuğuna kaldığın yerden devam et.' 
              : 'Öğrenme hedeflerini AI destekli koçluk ile yönetmeye başla.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setAuthType('LOGIN')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              authType === 'LOGIN' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setAuthType('REGISTER')}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              authType === 'REGISTER' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {authType === 'REGISTER' && (
            <>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ad Soyad</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Fatmanur Karagöz"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Kullanıcı Modu Tercihiniz</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserMode('STUDENT')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedUserMode === 'STUDENT'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <span>Öğrenci</span>
                    </div>
                    <span className="text-[10px] text-slate-400">LGS, YKS, Vize/Final Sınavları</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedUserMode('LIFELONG_LEARNER')}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      selectedUserMode === 'LIFELONG_LEARNER'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      <span>Kariyer / Gelişim</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Yazılım, Projeler, Beceriler</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">E-posta Adresi</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="fatmanur@studymentor.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Şifre</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500 transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg glow-amber flex items-center justify-center gap-2 transition-all mt-2"
          >
            <span>{authType === 'LOGIN' ? 'Giriş Yap ve Başla' : 'Hesabımı Oluştur'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
