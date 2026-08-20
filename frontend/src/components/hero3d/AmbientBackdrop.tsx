import type { FC } from 'react';
import { Sparkles } from '@react-three/drei';
import { useIsMobile } from '../../hooks/useIsMobile';

interface AmbientBackdropProps {
  color?: string;
}

export const AmbientBackdrop: FC<AmbientBackdropProps> = ({ color = '#f59e0b' }) => {
  const isMobile = useIsMobile();
  return (
    <Sparkles count={isMobile ? 15 : 40} scale={[6, 4, 4]} size={2.5} speed={0.15} color={color} opacity={0.35} position={[0, 1, -1]} />
  );
};
