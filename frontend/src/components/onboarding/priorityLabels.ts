import type { PriorityLevel } from '../../lib/apiClient';

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  YUKSEK: 'Yüksek Öncelik',
  ORTA: 'Orta Öncelik',
  DUSUK: 'Düşük Öncelik',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  YUKSEK: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
  ORTA: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
  DUSUK: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
};
