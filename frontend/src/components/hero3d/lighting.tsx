import type { FC } from 'react';

export const HeroLights: FC = () => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 6, 4]} intensity={1.4} />
    <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#a5b4fc" />
  </>
);
