import React, { useState } from 'react';
import { GraduationCap, School, Landmark, Briefcase, ArrowRight, X } from 'lucide-react';
import type { EducationLevel, UserMode } from '../../types';
import type { PendingProfile } from './types';

interface LevelOption {
  level: EducationLevel;
  mode: UserMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  grades?: number[];
}

const LEVEL_OPTIONS: LevelOption[] = [
  {
    level: 'MIDDLE_SCHOOL',
    mode: 'STUDENT',
    title: 'Ortaokul',
    description: 'LGS Hazırlık',
    icon: <School className="w-6 h-6" />,
    accent: 'pink',
    grades: [5, 6, 7, 8],
  },
  {
    level: 'HIGH_SCHOOL',
    mode: 'STUDENT',
    title: 'Lise',
    description: 'YKS Hazırlık',
    icon: <GraduationCap className="w-6 h-6" />,
    accent: 'pink',
    grades: [9, 10, 11, 12],
  },
  {
    level: 'UNIVERSITY',
    mode: 'STUDENT',
    title: 'Üniversite',
    description: 'Vize / Final',
    icon: <Landmark className="w-6 h-6" />,
    accent: 'pink',
    grades: [1, 2, 3, 4],
  },
  {
    level: 'LIFELONG_LEARNER',
    mode: 'LIFELONG_LEARNER',
    title: 'İş Hayatım ve Gelişim',
    description: 'Çalışanlar & Yetişkinler İçin',
    icon: <Briefcase className="w-6 h-6" />,
    accent: 'mint',
    grades: undefined,
  },
];

interface EducationLevelStepProps {
  onClose: () => void;
  onContinue: (profile: PendingProfile) => void;
  presetMode?: UserMode | null;
}

export const EducationLevelStep: React.FC<EducationLevelStepProps> = ({ onClose, onContinue, presetMode = null }) => {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const options = presetMode ? LEVEL_OPTIONS.filter(o => o.mode === presetMode) : LEVEL_OPTIONS;
  const gridColsClass = options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4';
  const selectedOption = options.find(o => o.level === selectedLevel) ?? null;
  const needsGrade = !!selectedOption?.grades;
  const canContinue = !!selectedOption && (!needsGrade || selectedGrade !== null);

  const handleSelectLevel = (option: LevelOption) => {
    setSelectedLevel(option.level);
    setSelectedGrade(null);
  };

  const handleContinue = () => {
    if (!selectedOption || !canContinue) return;
    onContinue({
      mode: selectedOption.mode,
      educationLevel: selectedOption.level,
      grade: needsGrade ? selectedGrade ?? undefined : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-brand-pink-dark/20 text-slate-900 dark:text-slate-100 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Eğitim Seviyeni Seç</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sana uygun içerik ve tekrar önerilerini hazırlayabilmemiz için önce seviyeni öğrenmemiz gerekiyor.
          </p>
        </div>

        <div className={`grid ${gridColsClass} gap-3`}>
          {options.map(option => {
            const isSelected = selectedLevel === option.level;
            const activeClasses =
              option.accent === 'pink'
                ? 'bg-brand-pink-dark/20 border-brand-pink-dark text-brand-pink-light'
                : 'bg-brand-mint/20 border-brand-mint text-brand-mint';
            return (
              <button
                key={option.level}
                type="button"
                onClick={() => handleSelectLevel(option)}
                className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                  isSelected ? activeClasses : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <div className={option.accent === 'pink' ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}>{option.icon}</div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{option.title}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedOption?.grades && (
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5 text-xs">
              {selectedOption.level === 'UNIVERSITY' ? 'Kaçıncı sınıf/yıldasın?' : 'Kaçıncı sınıftasın?'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {selectedOption.grades.map(grade => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedGrade(grade)}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    selectedGrade === grade
                      ? 'bg-brand-pink-dark border-brand-pink-dark text-white'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-pink-dark to-brand-mint-dark hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg glow-ai flex items-center justify-center gap-2 transition-all"
        >
          <span>Devam Et</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
