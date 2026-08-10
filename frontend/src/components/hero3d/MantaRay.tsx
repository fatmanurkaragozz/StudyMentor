import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

interface MantaRayProps {
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export const MantaRay: FC<MantaRayProps> = ({ position = [-1.1, -0.5, -0.3], reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);
  const leftWingRef = useRef<Group>(null);
  const rightWingRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);

  useFrame(state => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.1;
      groupRef.current.position.x = position[0] + Math.sin(t * 0.25) * 0.35;
      groupRef.current.rotation.y = 0.3 + Math.sin(t * 0.25) * 0.12;
    }

    const flap = Math.sin(t * 1.4) * 0.32;
    if (leftWingRef.current) leftWingRef.current.rotation.z = 0.15 + flap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -0.15 - flap;
    if (tailRef.current) tailRef.current.rotation.y = Math.sin(t * 1.4 - 0.6) * 0.25;
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, 0.3, 0]} scale={0.85}>
      {/* Gövde */}
      <mesh scale={[1, 0.35, 1.1]}>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Sol kanat */}
      <group ref={leftWingRef} position={[-0.28, 0, 0]}>
        <mesh position={[-0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.16]}>
          <coneGeometry args={[0.5, 0.85, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.08} />
        </mesh>
        {/* Omuz beneği */}
        <mesh position={[-0.05, 0.08, 0.12]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      </group>

      {/* Sağ kanat */}
      <group ref={rightWingRef} position={[0.28, 0, 0]}>
        <mesh position={[0.42, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.16]}>
          <coneGeometry args={[0.5, 0.85, 4]} />
          <meshStandardMaterial color="#334155" roughness={0.45} metalness={0.08} />
        </mesh>
        <mesh position={[0.05, 0.08, 0.12]} scale={[1, 0.4, 1]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
        </mesh>
      </group>

      {/* Kafa boynuzları (cephalic fins) */}
      <mesh position={[-0.1, -0.08, 0.36]} rotation={[1.5, 0, 0.25]}>
        <coneGeometry args={[0.035, 0.26, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>
      <mesh position={[0.1, -0.08, 0.36]} rotation={[1.5, 0, -0.25]}>
        <coneGeometry args={[0.035, 0.26, 8]} />
        <meshStandardMaterial color="#475569" roughness={0.4} />
      </mesh>

      {/* Göz */}
      <mesh position={[-0.14, 0.02, 0.32]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} />
      </mesh>
      <mesh position={[0.14, 0.02, 0.32]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} />
      </mesh>

      {/* Kuyruk */}
      <group ref={tailRef} position={[0, 0, -0.32]}>
        <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.035, 0.7, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
};
