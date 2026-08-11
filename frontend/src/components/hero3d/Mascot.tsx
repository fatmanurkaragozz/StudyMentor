import { useRef, useState } from 'react';
import type { FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import type { Group } from 'three';
import { SpeechBubble } from './SpeechBubble';
import { getRandomGreeting } from '../../lib/kaptan';

interface MascotProps {
  position?: [number, number, number];
  reducedMotion?: boolean;
}

export const Mascot: FC<MascotProps> = ({ position = [1.4, 0.55, 0], reducedMotion = false }) => {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const wheelRef = useRef<Group>(null);
  const pointer = useThree((state) => state.pointer);
  const [greeting] = useState(() => getRandomGreeting());

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

    if (wheelRef.current) {
      wheelRef.current.rotation.z = Math.sin(t * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body - lacivert kaptan ceketi (daha ince, insansı oranlar) */}
      <mesh position={[0, -0.62, 0]} castShadow={false}>
        <capsuleGeometry args={[0.44, 0.35, 8, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.45} metalness={0.05} />
      </mesh>

      {/* Altın kemer */}
      <mesh position={[0, -0.68, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.03, 8, 24]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Omuz eklemleri - kolları gövdeye yumuşakça bağlar */}
      <mesh position={[-0.42, -0.15, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.45} />
      </mesh>
      <mesh position={[0.42, -0.1, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.45} />
      </mesh>

      {/* Left arm */}
      <group position={[-0.42, -0.15, 0]} rotation={[0, 0, 0.4]}>
        <mesh>
          <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.02, 6, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.35, 0]} scale={[1, 0.85, 0.7]}>
          <sphereGeometry args={[0.095, 14, 14]} />
          <meshStandardMaterial color="#f2c199" roughness={0.4} />
        </mesh>
      </group>

      {/* Right arm (waving) */}
      <group ref={rightArmRef} position={[0.42, -0.1, 0]}>
        <mesh>
          <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
          <meshStandardMaterial color="#1e3a5f" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.29, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.02, 6, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh position={[0, -0.35, 0]} scale={[1, 0.85, 0.7]}>
          <sphereGeometry args={[0.095, 14, 14]} />
          <meshStandardMaterial color="#f2c199" roughness={0.4} />
        </mesh>
      </group>

      {/* Dümen (ship's wheel) - kaptanın önünde */}
      <group ref={wheelRef} position={[0, -0.32, 0.58]}>
        <mesh>
          <torusGeometry args={[0.38, 0.045, 12, 24]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0.1} />
        </mesh>
        {[0, 60, 120].map(deg => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <cylinderGeometry args={[0.032, 0.032, 0.76, 8]} />
            <meshStandardMaterial color="#92400e" roughness={0.6} metalness={0.1} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* Boyun/yaka - kafayı gövdeden belirgin şekilde ayıran dolgun bir yaka */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.28, 0.34, 0.2, 20]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.022, 8, 24]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.5} />
      </mesh>

      {/* Head group (tilts toward cursor) - daha küçük, daha olgun oranlar */}
      <group ref={headRef} position={[0, 0.62, 0]}>
        <mesh scale={[0.92, 1.06, 0.98]}>
          <sphereGeometry args={[0.44, 32, 32]} />
          <meshStandardMaterial color="#f2c199" roughness={0.35} metalness={0.05} />
        </mesh>

        {/* Eyes (hafif badem, tam yuvarlak değil - daha kendinden emin bir ifade) */}
        <mesh position={[-0.15, 0.05, 0.4]} scale={[1, 0.78, 0.85]}>
          <sphereGeometry args={[0.062, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.15} />
        </mesh>
        <mesh position={[-0.13, 0.07, 0.435]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
        <mesh position={[0.15, 0.05, 0.4]} scale={[1, 0.78, 0.85]}>
          <sphereGeometry args={[0.062, 16, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.15} />
        </mesh>
        <mesh position={[0.17, 0.07, 0.435]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>

        {/* Gülümseme (sade, kendinden emin) */}
        <mesh position={[0, -0.12, 0.4]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} />
        </mesh>

        {/* Çene sakalı - gülümsemenin altında, olgun/yetişkin kaptan hissi için */}
        <mesh position={[0, -0.34, 0.26]} scale={[0.72, 0.36, 0.5]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#4b3a2f" roughness={0.8} />
        </mesh>

        {/* Kaptan şapkası */}
        <group position={[0, 0.41, 0]}>
          <mesh>
            <cylinderGeometry args={[0.24, 0.256, 0.128, 20]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.096, 0]}>
            <sphereGeometry args={[0.24, 20, 12]} />
            <meshStandardMaterial color="#1e3a5f" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.04, 0.224]} rotation={[Math.PI / 2.2, 0, 0]}>
            <cylinderGeometry args={[0.208, 0.208, 0.024, 20]} />
            <meshStandardMaterial color="#111827" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.008, 0.248]}>
            <torusGeometry args={[0.048, 0.0144, 8, 16]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.25} metalness={0.6} />
          </mesh>
        </group>
      </group>
      <SpeechBubble text={greeting} position={[1.0, 0.85, 0]} />
    </group>
  );
};
