import { Suspense } from 'react';
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls } from '@react-three/drei';
import { HeroLights } from './lighting';
import { AmbientBackdrop } from './AmbientBackdrop';
import { DataNetwork } from './DataNetwork';
import { DeskScene } from './DeskScene';
import { useIsMobile } from '../../hooks/useIsMobile';

const HeroCanvas: FC = () => {
  const isMobile = useIsMobile();
  return (
    <Canvas
      camera={{ position: [0, 2.2, 7.4], fov: 42 }}
      onCreated={({ camera }) => camera.lookAt(-1.6, 0.2, 0)}
      dpr={isMobile ? [1, 1.25] : [1, 2]}
      gl={{ alpha: true, antialias: !isMobile }}
    >
      <Suspense fallback={null}>
        <ScrollControls pages={1} damping={0.2}>
          <HeroLights />
          <AmbientBackdrop />
          <DataNetwork />
          <DeskScene />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
};

export default HeroCanvas;
