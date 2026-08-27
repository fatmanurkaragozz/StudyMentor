import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getEducationLabel } from '../lib/labels';
import { apiClient, toUserProfile, ApiError } from '../lib/apiClient';
import type { EducationLevel } from '../types';
import { Mail, GraduationCap, Briefcase, Target, LogOut, Pencil, Check, X } from 'lucide-react';
import { MiniDecorScene } from './hero3d/decor/MiniDecorScene';
import { PottedPlant } from './hero3d/decor/PottedPlant';

interface ProfilePageProps {
  onLogout: () => void;
}

// EXAM_PREP kasten disarida birakildi - sinav kategorisi degisimi backend'de henuz
// desteklenmiyor (bkz. updateProfileSchema), o yuzden bu editorde sunulmuyor.
const LEVEL_OPTIONS: { level: EducationLevel; title: string; grades?: number[] }[] = [
  { level: 'MIDDLE_SCHOOL', title: 'Ortaokul', grades: [5, 6, 7, 8] },
  { level: 'HIGH_SCHOOL', title: 'Lise', grades: [9, 10, 11, 12] },
  { level: 'UNIVERSITY', title: 'Üniversite', grades: [1, 2, 3, 4] },
  { level: 'LIFELONG_LEARNER', title: 'İş Hayatım ve Gelişim' },
];

const inputClass =
  'bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-pink-dark transition-all';

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user, setUserMode, setUserProfile } = useApp();
  const { verifyEmail, resendVerification } = useAuth();
  const isStudent = user.mode === 'STUDENT';
  const isExamPrep = user.educationLevel === 'EXAM_PREP';

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(user.educationLevel);
  const [grade, setGrade] = useState<number | undefined>(user.grade);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const selectedLevelOption = LEVEL_OPTIONS.find(o => o.level === educationLevel);

  const startEditing = () => {
    const [first, ...rest] = user.name.split(' ');
    setFirstName(first ?? '');
    setLastName(rest.join(' '));
    setEmail(user.email);
    setEducationLevel(user.educationLevel);
    setGrade(user.grade);
    setError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('Ad, soyad ve e-posta boş bırakılamaz.');
      return;
    }
    setSaving(true);
    setError(null);
    const emailChanged = email.trim() !== user.email;
    try {
      const result = await apiClient.updateMe({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        ...(isExamPrep ? {} : { educationLevel, grade: educationLevel === 'LIFELONG_LEARNER' ? undefined : grade }),
      });
      setUserProfile(toUserProfile(result));
      setIsEditing(false);
      if (emailChanged) {
        setPendingVerification(true);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Bir şeyler ters gitti, tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      await verifyEmail(user.email, verifyCode.trim());
      setPendingVerification(false);
      setVerifyCode('');
    } catch (err) {
      setVerifyError(err instanceof ApiError ? err.message : 'Kod doğrulanamadı.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setVerifyError(null);
    try {
      await resendVerification(user.email);
    } catch (err) {
      setVerifyError(err instanceof ApiError ? err.message : 'Kod tekrar gönderilemedi.');
    }
  };

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

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xl text-brand-pink-dark dark:text-brand-pink-light shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            {isEditing ? (
              <div className="space-y-1.5 min-w-0">
                <div className="flex gap-1.5">
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ad" className={inputClass} />
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Soyad" className={inputClass} />
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" className={`${inputClass} w-full`} />
                </div>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.name}</div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
              </div>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 px-3 py-2 mr-10 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Düzenle</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {isStudent ? <GraduationCap className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              <span>Eğitim Seviyesi</span>
            </div>
            {isEditing && !isExamPrep ? (
              <div className="space-y-2 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {LEVEL_OPTIONS.map(option => (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => {
                        setEducationLevel(option.level);
                        setGrade(undefined);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                        educationLevel === option.level
                          ? 'bg-brand-pink-dark border-brand-pink-dark text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {option.title}
                    </button>
                  ))}
                </div>
                {selectedLevelOption?.grades && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLevelOption.grades.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGrade(g)}
                        className={`w-9 h-9 rounded-lg border text-xs font-bold transition-all ${
                          grade === g
                            ? 'bg-brand-mint-dark border-brand-mint-dark text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{getEducationLabel(user)}</div>
            )}
            {isEditing && isExamPrep && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1">
                Sınav kategorisi şu an profil sayfasından değiştirilemiyor.
              </p>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Target className="w-3.5 h-3.5" />
              <span>Ana Hedef</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.targetGoal}</div>
          </div>
        </div>

        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-pink-light to-brand-pink-dark text-white text-xs font-bold disabled:opacity-50 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
            </button>
            <button
              onClick={cancelEditing}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              <span>Vazgeç</span>
            </button>
          </div>
        )}
        {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}

        {pendingVerification && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              Yeni e-posta adresine bir doğrulama kodu gönderdik. Bir sonraki girişte gerekmemesi için şimdi doğrulayabilirsin.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                placeholder="6 haneli kod"
                className={`${inputClass} flex-1`}
              />
              <button
                onClick={handleVerify}
                disabled={verifying || verifyCode.trim().length !== 6}
                className="px-3 py-1.5 rounded-lg bg-brand-pink-dark text-white text-xs font-bold disabled:opacity-40 transition-all"
              >
                Doğrula
              </button>
            </div>
            <button onClick={handleResend} className="text-[11px] text-slate-500 dark:text-slate-400 underline">
              Kodu tekrar gönder
            </button>
            {verifyError && <p className="text-[11px] text-rose-600 dark:text-rose-400">{verifyError}</p>}
          </div>
        )}

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
