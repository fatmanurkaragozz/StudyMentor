import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import type { AmbientLight, HemisphereLight } from 'three';

export const HeroLights: FC = () => {
  const scroll = useScroll();
  const ambientRef = useRef<AmbientLight>(null);
  const hemiRef = useRef<HemisphereLight>(null);

  useFrame(() => {
    const progress = scroll.offset;
    if (ambientRef.current) ambientRef.current.intensity = 1.1 + progress * 0.9;
    if (hemiRef.current) hemiRef.current.intensity = 1.2 + progress * 0.9;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1.1} color="#64748b" />
      <hemisphereLight ref={hemiRef} args={['#64748b', '#1e293b', 1.2]} />
    </>
  );
};
