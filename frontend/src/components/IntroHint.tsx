import { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
import { Info, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useIntros } from '../context/IntroContext';
import {
  getSectionIntro,
  getFeatureHint,
  SECTION_MAX_WIDTH,
  DEFAULT_SECTION_MAX_WIDTH,
} from '../lib/introContent';

interface IntroHintProps {
  /**
   * 'section': <main>'in ilk çocuğu, sekmeye özel, açık başlar (kapatılmadıysa),
   *   kapatılınca küçük "Bu bölüm nedir?" düğmesine küçülür.
   * 'feature': bir aracın yanına konur, her zaman sessiz bir "... nedir?"
   *   bağlantısı olarak başlar, "bir daha gösterme" ile tamamen kaybolur.
   */
  kind: 'section' | 'feature';
  /** section için activeTab, feature için ipucu id'si */
  id: string;
}

export const IntroHint: FC<IntroHintProps> = ({ kind, id }) => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';
  const { isDismissed, dismiss } = useIntros();

  const isSection = kind === 'section';
  const content = isSection ? getSectionIntro(id, isStudent) : getFeatureHint(id, isStudent);
  const storeKey = `${kind}:${id}`;
  const dismissed = isDismissed(storeKey);

  // section kapatılmadıysa açık başlar; feature her zaman kapalı (bağlantı) başlar.
  const [expanded, setExpanded] = useState(() => isSection && !dismissed);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // ProfilePage'deki resetAll monteli bir bölüm kartını yeniden açsın.
  useEffect(() => {
    if (isSection && !dismissed) setExpanded(true);
  }, [isSection, dismissed]);

  // Açıkken Esc ile kapat - NotificationBell'deki keydown listener deseni.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  if (!content) return null;
  // feature: kalıcı gizlendiyse bağlantı bile gösterme.
  if (!isSection && dismissed) return null;

  const accentText = isStudent
    ? 'text-brand-pink-dark dark:text-brand-pink-light'
    : 'text-brand-mint-dark dark:text-brand-mint';
  const accentBox = isStudent ? 'accent-brand-pink-dark' : 'accent-brand-mint-dark';

  const close = () => {
    if (dontShowAgain) dismiss(storeKey);
    setExpanded(false);
  };

  const sectionWrap = (node: ReactNode) =>
    isSection ? (
      <div className={`${SECTION_MAX_WIDTH[id] ?? DEFAULT_SECTION_MAX_WIDTH} mx-auto px-6 pt-6`}>{node}</div>
    ) : (
      node
    );

  if (!expanded) {
    return sectionWrap(
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-expanded={false}
        className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
          isSection
            ? 'text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            : 'text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        }`}
      >
        <Info className="w-3.5 h-3.5" />
        <span>{isSection ? 'Bu bölüm nedir?' : `${content.title} nedir?`}</span>
      </button>,
    );
  }

  return sectionWrap(
    <section
      role="note"
      aria-label={`${content.title} — ${isSection ? 'bölüm rehberi' : 'ipucu'}`}
      className={
        isSection
          ? `relative glass-panel rounded-2xl border ${
              isStudent ? 'border-brand-pink-dark/30' : 'border-brand-mint-dark/30'
            } p-5 space-y-3`
          : 'relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 space-y-2'
      }
    >
      <button
        type="button"
        onClick={close}
        aria-label={isSection ? 'Rehberi kapat' : 'İpucunu kapat'}
        className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      <div
        className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${accentText}`}
      >
        <Info className="w-3.5 h-3.5" />
        <span>{isSection ? 'Bölüm Rehberi' : 'İpucu'}</span>
      </div>

      <div className="space-y-1.5 pr-7">
        <p
          className={`font-bold text-slate-900 dark:text-slate-100 ${isSection ? 'text-base' : 'text-sm'}`}
        >
          {content.title}
        </p>
        <p
          className={`text-slate-600 dark:text-slate-300 leading-relaxed ${
            isSection ? 'text-sm' : 'text-xs'
          }`}
        >
          {content.body}
        </p>
      </div>

      <ul className="space-y-1.5">
        {content.steps.map((step, i) => (
          <li
            key={i}
            className={`flex items-start gap-1.5 text-slate-600 dark:text-slate-300 leading-relaxed ${
              isSection ? 'text-sm' : 'text-xs'
            }`}
          >
            <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 ${accentText}`} />
            <span>{step}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className={`w-4 h-4 rounded border-slate-300 dark:border-slate-600 ${accentBox}`}
          />
          <span>{isSection ? 'Bu bölüm için bir daha gösterme' : 'Bir daha gösterme'}</span>
        </label>
        <button
          type="button"
          onClick={close}
          className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
        >
          {isSection ? 'Kapat' : 'Anladım'}
        </button>
      </div>
    </section>,
  );
};
