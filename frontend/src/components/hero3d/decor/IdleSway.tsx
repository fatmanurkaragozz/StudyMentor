import { useRef } from 'react';
import type { FC, ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface IdleSwayProps {
  children: ReactNode;
  speed?: number;
  amount?: number;
}

export const IdleSway: FC<IdleSwayProps> = ({ children, speed = 0.6, amount = 0.05 }) => {
  const groupRef = useRef<Group>(null);
  const reducedMotion = useReducedMotion();

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * speed) * amount;
  });

  return <group ref={groupRef}>{children}</group>;
};
