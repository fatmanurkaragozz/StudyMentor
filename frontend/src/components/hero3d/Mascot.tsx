import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { SpeechBubble } from './SpeechBubble';

interface MascotProps {
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export const Mascot: FC<MascotProps> = ({ position = [3.2, 1.6, 0], reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const pointer = useThree((state) => state.pointer);

  useFrame((state, delta) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.08;
      groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.15;
    }

    if (headRef.current) {
      const targetX = pointer.y * 0.25;
      const targetY = pointer.x * 0.3;
      headRef.current.rotation.x += (targetX - headRef.current.rotation.x) * Math.min(delta * 4, 1);
      headRef.current.rotation.y += (targetY - headRef.current.rotation.y) * Math.min(delta * 4, 1);
    }

    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = -0.6 + Math.sin(t * 2.2) * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, -0.7, 0]} castShadow={false}>
        <capsuleGeometry args={[0.55, 0.6, 8, 16]} />
        <meshStandardMaterial color="#d97706" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.6, -0.55, 0]} rotation={[0, 0, 0.5]}>
        <mesh>
          <capsuleGeometry args={[0.12, 0.55, 6, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
      </group>

      {/* Right arm (waving) */}
      <group ref={rightArmRef} position={[0.6, -0.35, 0]}>
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.12, 0.55, 6, 12]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
      </group>

      {/* Head group (tilts toward cursor) */}
      <group ref={headRef} position={[0, 0.15, 0]}>
        <mesh scale={[1, 0.92, 1]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.35} metalness={0.05} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.18, 0.05, 0.48]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>
        <mesh position={[0.18, 0.05, 0.48]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.14, 0.48]} rotation={[0, 0, Math.PI]}>
          <capsuleGeometry args={[0.03, 0.18, 4, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>

        {/* Mortarboard cap */}
        <group position={[0, 0.5, 0]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.26, 0.18, 16]} />
            <meshStandardMaterial color="#312e81" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.68, 0.68, 0.04]} />
            <meshStandardMaterial color="#1e1b4b" roughness={0.4} />
          </mesh>
        </group>
      </group>
      <SpeechBubble text="Hi, I am your mentor, let's talk to me" position={[0, 1.55, 0]} />
    </group>
  );
};
