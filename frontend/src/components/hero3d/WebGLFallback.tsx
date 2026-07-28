import type { FC } from 'react';

export function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export const StaticHeroFallback: FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[18%] right-[10%] w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/25 to-rose-500/15 blur-2xl animate-pulse" />
    <div className="absolute bottom-[18%] left-[8%] w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 blur-2xl" />
  </div>
);
