import type { PriorityLevel } from '../../lib/apiClient';

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  YUKSEK: 'Yüksek Öncelik',
  ORTA: 'Orta Öncelik',
  DUSUK: 'Düşük Öncelik',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  YUKSEK: 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300',
  ORTA: 'bg-brand-gold-dark/15 border-brand-gold-dark/40 text-brand-gold-dark dark:text-brand-gold',
  DUSUK: 'bg-brand-mint-dark/15 border-brand-mint-dark/40 text-brand-mint-dark dark:text-brand-mint',
};
