import { Suspense } from 'react';
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroLights } from './lighting';
import { Mascot } from './Mascot';
import { FeatureOrbit } from './FeatureOrbit';
import { DeskScene } from './DeskScene';

interface HeroCanvasProps {
  reducedMotion: boolean;
}

const HeroCanvas: FC<HeroCanvasProps> = ({ reducedMotion }) => (
  <div className="absolute inset-0">
    <Canvas camera={{ position: [0, 1, 9], fov: 40 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
      <Suspense fallback={null}>
        <HeroLights />
        <Mascot reducedMotion={reducedMotion} />
        <FeatureOrbit reducedMotion={reducedMotion} />
        <DeskScene reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  </div>
);

export default HeroCanvas;
