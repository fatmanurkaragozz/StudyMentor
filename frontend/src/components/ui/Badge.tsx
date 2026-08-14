import type { HTMLAttributes, FC } from 'react';

type BadgeTone = 'indigo' | 'violet' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  violet: 'text-violet-600 dark:text-violet-400',
  neutral: 'text-slate-500 dark:text-slate-400',
};

export const Badge: FC<BadgeProps> = ({ tone = 'neutral', className = '', children, ...rest }) => (
  <span className={`text-[11px] font-bold uppercase tracking-wider ${TONE_CLASSES[tone]} ${className}`} {...rest}>
    {children}
  </span>
);
