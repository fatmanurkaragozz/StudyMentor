import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type HeroIntroStage = 'desk' | 'hand' | 'route' | 'modes';

const STAGE_ORDER: HeroIntroStage[] = ['desk', 'hand', 'route', 'modes'];
const STAGE_DELAYS_MS = [0, 800, 1800, 3500];

export function useHeroIntroSequence(): HeroIntroStage {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<HeroIntroStage>(reducedMotion ? 'modes' : 'desk');

  useEffect(() => {
    if (reducedMotion) {
      setStage('modes');
      return;
    }

    const timers = STAGE_ORDER.map((s, i) => setTimeout(() => setStage(s), STAGE_DELAYS_MS[i]));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return stage;
}
