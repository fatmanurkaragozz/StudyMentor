import type { FC } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NoCoursesHintProps {
  /** true = STUDENT ("ders"), false = LIFELONG_LEARNER ("uğraş") */
  student?: boolean;
  className?: string;
}

/**
 * Kullanıcı henüz ders/uğraş eklemediğinde ders-konu seçici gösteren yerlerde
 * boş `<select>` kutuları yerine gösterilir - ne yapılacağını söyler ve
 * Derslerim sekmesine götürür.
 */
export const NoCoursesHint: FC<NoCoursesHintProps> = ({ student = true, className = '' }) => {
  const { setActiveTab } = useApp();
  const label = student ? 'ders' : 'uğraş';

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-3.5 py-3 text-xs text-slate-600 dark:text-slate-300 ${className}`}
    >
      <BookOpen className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500" />
      <span className="flex-1">
        Önce{' '}
        <strong className="font-semibold text-slate-800 dark:text-slate-200">
          {student ? 'Derslerim' : 'Uğraşlarım'}
        </strong>{' '}
        sekmesinden bir {label} ekle; sonra buradan seçebilirsin.
      </span>
      <button
        type="button"
        onClick={() => setActiveTab('courses')}
        className="inline-flex items-center justify-center gap-1 shrink-0 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all"
      >
        <span>{student ? 'Derslere git' : 'Uğraşlara git'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
