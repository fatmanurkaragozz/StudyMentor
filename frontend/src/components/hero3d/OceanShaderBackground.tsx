import { useMemo, useRef } from 'react';
import type { FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface OceanShaderBackgroundProps {
  reducedMotion?: boolean;
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Doku/resim dosyası yok - tamamen prosedürel (hash tabanlı value-noise + fbm) akışkan desen.
// uMouse'a olan mesafeye göre yerel bir girdap bozulması eklenir (fare etkileşimi).
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;

    vec2 toMouse = uv - uMouse;
    float dist = length(toMouse);
    float ripple = smoothstep(0.55, 0.0, dist) * 0.18;
    vec2 dir = toMouse / (dist + 0.0001);
    uv += dir * ripple * sin(dist * 18.0 - uTime * 2.2);

    vec2 flow = uv * 3.0 + vec2(uTime * 0.045, uTime * 0.03);
    float n1 = fbm(flow);
    float n2 = fbm(flow * 1.6 + n1 * 1.4 + uTime * 0.02);

    vec3 color = mix(uColorA, uColorB, n1);
    color = mix(color, uColorC, clamp(n2 * 0.7, 0.0, 1.0));

    gl_FragColor = vec4(color, 0.78);
  }
`;

export const OceanShaderBackground: FC<OceanShaderBackgroundProps> = ({ reducedMotion = false }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const pointer = useThree(state => state.pointer);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uColorA: { value: new THREE.Color('#0c4a6e') },
      uColorB: { value: new THREE.Color('#0e7490') },
      uColorC: { value: new THREE.Color('#22d3ee') },
    }),
    []
  );

  useFrame((_state, delta) => {
    const material = materialRef.current;
    if (!material) return;
    if (reducedMotion) return;

    material.uniforms.uTime.value += delta;

    const mouseUniform = material.uniforms.uMouse.value as THREE.Vector2;
    const targetX = pointer.x * 0.5 + 0.5;
    const targetY = pointer.y * 0.5 + 0.5;
    mouseUniform.x += (targetX - mouseUniform.x) * 0.08;
    mouseUniform.y += (targetY - mouseUniform.y) * 0.08;
  });

  return (
    <mesh position={[0, 0, -6]} scale={[viewport.width * 3, viewport.height * 3, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
