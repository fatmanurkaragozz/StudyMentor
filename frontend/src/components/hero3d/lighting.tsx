import type {} from '@react-three/fiber';
import type { FC } from 'react';

export const HeroLights: FC = () => (
  <>
    <ambientLight intensity={0.18} color="#1e293b" />
    <hemisphereLight args={['#1e2947', '#020617', 0.25]} />
  </>
);
