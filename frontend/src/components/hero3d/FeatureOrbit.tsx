import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh } from 'three';

interface FeatureIcon {
  id: string;
  color: string;
  geometry: 'box' | 'torus' | 'octahedron' | 'cone';
}

const FEATURES: FeatureIcon[] = [
  { id: 'planner', color: '#f59e0b', geometry: 'box' },
  { id: 'calendar', color: '#e11d48', geometry: 'torus' },
  { id: 'growth', color: '#10b981', geometry: 'cone' },
  { id: 'insights', color: '#6366f1', geometry: 'octahedron' },
];

const RADIUS = 1.15;

const FeatureMesh: FC<{ feature: FeatureIcon; angle: number }> = ({ feature, angle }) => {
  const meshRef = useRef<Mesh>(null);
  const x = Math.cos(angle) * RADIUS;
  const z = Math.sin(angle) * RADIUS;

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.6;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  return (
    <mesh ref={meshRef} position={[x, 0, z]}>
      {feature.geometry === 'box' && <boxGeometry args={[0.32, 0.32, 0.32]} />}
      {feature.geometry === 'torus' && <torusGeometry args={[0.2, 0.08, 12, 24]} />}
      {feature.geometry === 'cone' && <coneGeometry args={[0.22, 0.4, 16]} />}
      {feature.geometry === 'octahedron' && <octahedronGeometry args={[0.26]} />}
      <meshStandardMaterial color={feature.color} roughness={0.35} metalness={0.15} />
    </mesh>
  );
};

interface FeatureOrbitProps {
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export const FeatureOrbit: FC<FeatureOrbitProps> = ({ position = [0, 0, -1], reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.3} metalness={0.2} emissive="#f59e0b" emissiveIntensity={0.25} />
      </mesh>
      {FEATURES.map((feature, idx) => (
        <FeatureMesh key={feature.id} feature={feature} angle={(idx / FEATURES.length) * Math.PI * 2} />
      ))}
    </group>
  );
};
