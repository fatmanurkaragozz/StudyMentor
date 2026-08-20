import type { FC } from 'react';

interface HangingIvyPlanterProps {
  position?: [number, number, number];
  scale?: number;
  planterColor?: string;
  vineColors?: string[];
  vineCount?: number;
}

const BASE_VINES = [
  { x: -0.24, len: 0.5, tilt: -0.12 },
  { x: -0.1, len: 0.62, tilt: 0.06 },
  { x: 0.06, len: 0.44, tilt: -0.08 },
  { x: 0.22, len: 0.56, tilt: 0.1 },
];

export const HangingIvyPlanter: FC<HangingIvyPlanterProps> = ({
  position = [0, 0, 0],
  scale = 1,
  planterColor = '#334155',
  vineColors = ['#059669', '#10b981', '#047857', '#059669'],
  vineCount = 4,
}) => {
  const vines = BASE_VINES.slice(0, vineCount).map((vine, i) => ({
    ...vine,
    color: vineColors[i % vineColors.length],
  }));

  return (
    <group position={position} scale={scale}>
      <mesh>
        <boxGeometry args={[0.7, 0.16, 0.16]} />
        <meshStandardMaterial color={planterColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.06, 0.02]}>
        <boxGeometry args={[0.62, 0.03, 0.14]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      {vines.map((vine) => (
        <group key={vine.x} position={[vine.x, -0.06, 0.03]}>
          <mesh position={[0, -vine.len * 0.28, 0.01]} rotation={[0, 0, vine.tilt]}>
            <capsuleGeometry args={[0.014, vine.len * 0.5, 4, 8]} />
            <meshStandardMaterial color={vine.color} roughness={0.7} />
          </mesh>
          <mesh position={[vine.tilt * vine.len * 0.6, -vine.len * 0.72, 0.02]} rotation={[0, 0, vine.tilt * 2.2]}>
            <capsuleGeometry args={[0.011, vine.len * 0.46, 4, 8]} />
            <meshStandardMaterial color={vine.color} roughness={0.7} />
          </mesh>
          {[0.32, 0.58, 0.85].map((t) => (
            <mesh key={t} position={[vine.tilt * vine.len * t * 0.8, -vine.len * t, 0.03]} scale={[0.055, 0.038, 0.03]}>
              <sphereGeometry args={[1, 8, 6]} />
              <meshStandardMaterial color={vine.color} roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};
