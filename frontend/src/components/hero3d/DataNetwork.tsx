import { useMemo, useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, type Group } from 'three';

// Duvarın world-space alanının (x:[-3.5,3.5], y:[-0.3,2.9]) dışında - üstünde ve yanlarında -
// tutuluyor, aksi halde opak duvar arkasındaki her şeyi tamamen gizler.
const NETWORK_POINTS: [number, number, number][] = [
  [-4.5, 3.6, -3.5], [-3, 4.2, -4.5], [-1.5, 3.8, -3], [0, 4.6, -5],
  [1.5, 3.9, -3.8], [3, 4.4, -4.2], [4.5, 3.7, -3.2], [-2, 5.2, -4.8],
  [2, 5.4, -4.5], [0.5, 3.4, -2.8],
  [4.8, 1.5, -3], [5.5, 2.4, -4], [4.6, 0.2, -3.6], [5.8, -0.5, -4.5],
  [-4.8, 1.2, -3.2], [-5.5, 2.1, -4.3], [-4.5, -0.3, -3.8], [-5.8, 0.6, -4.6],
  [-4.2, 3.0, -3.6], [5.2, 3.2, -3.4],
];
const CONNECTION_DISTANCE = 2.4;
const NETWORK_COLOR = '#94a3b8';

export const DataNetwork: FC = () => {
  const groupRef = useRef<Group>(null);

  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < NETWORK_POINTS.length; i++) {
      for (let j = i + 1; j < NETWORK_POINTS.length; j++) {
        const [x1, y1, z1] = NETWORK_POINTS[i];
        const [x2, y2, z2] = NETWORK_POINTS[j];
        if (Math.hypot(x1 - x2, y1 - y2, z1 - z2) < CONNECTION_DISTANCE) {
          positions.push(x1, y1, z1, x2, y2, z2);
        }
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = -state.pointer.x * 0.3;
    const targetY = -state.pointer.y * 0.2;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.03;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.03;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color={NETWORK_COLOR} transparent opacity={0.25} />
      </lineSegments>
      {NETWORK_POINTS.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color={NETWORK_COLOR} transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};
