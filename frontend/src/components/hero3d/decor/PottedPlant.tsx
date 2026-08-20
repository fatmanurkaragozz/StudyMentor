import type { FC } from 'react';

interface PottedPlantProps {
  position?: [number, number, number];
  scale?: number;
  potColor?: string;
  foliageColor?: string;
}

export const PottedPlant: FC<PottedPlantProps> = ({
  position = [0, 0, 0],
  scale = 1,
  potColor = '#334155',
  foliageColor = '#059669',
}) => (
  <group position={position} scale={scale}>
    <mesh>
      <cylinderGeometry args={[0.14, 0.1, 0.2, 12]} />
      <meshStandardMaterial color={potColor} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.25, 0]}>
      <coneGeometry args={[0.22, 0.4, 8]} />
      <meshStandardMaterial color={foliageColor} roughness={0.8} />
    </mesh>
  </group>
);
