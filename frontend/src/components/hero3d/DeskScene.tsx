import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group, Mesh, MeshStandardMaterial } from 'three';

interface DeskSceneProps {
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export const DeskScene: FC<DeskSceneProps> = ({ position = [-3.4, -1.8, 0.5], reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);
  const screenMaterialRef = useRef<MeshStandardMaterial>(null);
  const leftHandRef = useRef<Mesh>(null);
  const rightHandRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.06;
    }
    if (screenMaterialRef.current) {
      screenMaterialRef.current.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.2;
    }
    if (leftHandRef.current) {
      leftHandRef.current.position.y = 0.02 + Math.sin(t * 9) * 0.015;
    }
    if (rightHandRef.current) {
      rightHandRef.current.position.y = 0.02 + Math.sin(t * 9 + 1.4) * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Desk top */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[1.9, 0.08, 1]} />
        <meshStandardMaterial color="#7c5a3a" roughness={0.6} />
      </mesh>
      {/* Desk legs */}
      {[[-0.85, -0.45], [0.85, -0.45]].map(([x], idx) => (
        <mesh key={idx} position={[x, -0.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#4b3423" roughness={0.6} />
        </mesh>
      ))}

      {/* Laptop base */}
      <mesh position={[0.1, 0.02, 0.1]}>
        <boxGeometry args={[0.55, 0.04, 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Laptop screen (hinged) */}
      <group position={[0.1, 0.03, -0.09]} rotation={[-0.35, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.55, 0.36, 0.03]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, 0.02]}>
          <planeGeometry args={[0.46, 0.28]} />
          <meshStandardMaterial
            ref={screenMaterialRef}
            color="#38bdf8"
            emissive="#38bdf8"
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* Stacked books */}
      {[
        { color: '#d97706', y: 0, rot: 0.05 },
        { color: '#059669', y: 0.05, rot: -0.08 },
        { color: '#4338ca', y: 0.1, rot: 0.1 },
      ].map((book, idx) => (
        <mesh key={idx} position={[-0.65, 0.02 + book.y, 0.15]} rotation={[0, book.rot, 0]}>
          <boxGeometry args={[0.4, 0.05, 0.3]} />
          <meshStandardMaterial color={book.color} roughness={0.5} />
        </mesh>
      ))}

      {/* Seated person (simplified blob, same visual language as Mascot) */}
      <group position={[0.1, 0.35, 0.55]}>
        {/* Torso */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.22, 0.35, 6, 12]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.45} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.42, 0]} scale={[1, 0.95, 1]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.35} />
        </mesh>
        {/* Arms reaching to laptop */}
        <mesh position={[-0.22, -0.05, -0.2]} rotation={[0.9, 0, 0.2]}>
          <capsuleGeometry args={[0.06, 0.32, 6, 10]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
        </mesh>
        <mesh position={[0.22, -0.05, -0.2]} rotation={[0.9, 0, -0.2]}>
          <capsuleGeometry args={[0.06, 0.32, 6, 10]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.5} />
        </mesh>
        {/* Typing hands */}
        <mesh ref={leftHandRef} position={[-0.22, 0.02, -0.38]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
        <mesh ref={rightHandRef} position={[0.22, 0.02, -0.38]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
};
