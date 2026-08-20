import type { HTMLAttributes, FC } from 'react';

type CardAccent = 'indigo' | 'violet' | 'none';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: CardAccent;
}

const ACCENT_HOVER_CLASSES: Record<CardAccent, string> = {
  indigo: 'hover:border-brand-pink-dark hover:shadow-xl',
  violet: 'hover:border-brand-mint-dark hover:shadow-xl',
  none: '',
};

export const Card: FC<CardProps> = ({ accent = 'none', className = '', children, ...rest }) => (
  <div
    className={`glass-panel rounded-3xl border border-slate-300 dark:border-slate-800 p-6 sm:p-8 transition-all duration-300 ${ACCENT_HOVER_CLASSES[accent]} ${className}`}
    {...rest}
  >
    {children}
  </div>
);
