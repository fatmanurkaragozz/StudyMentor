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
// Referans fotoğraftaki (koyu lacivert üst / parlak turkuaz alt, köpüklü, yönlü dalga
// dokusu) görünüme yaklaşmak için: dikey renk gradyanı, ayrı bir köpük katmanı ve
// yönlü (dikeyde daha sık) noise örneklemesi eklendi; hareket "hafif" olsun diye
// akış hızı ve fare-girdabı gücü önceki sürüme göre yumuşatıldı.
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uColorFoam;
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

    // Fare girdabı - hafif hareket isteği için güç düşürüldü (0.18 -> 0.09).
    vec2 toMouse = uv - uMouse;
    float dist = length(toMouse);
    float ripple = smoothstep(0.55, 0.0, dist) * 0.09;
    vec2 dir = toMouse / (dist + 0.0001);
    uv += dir * ripple * sin(dist * 18.0 - uTime * 2.2);

    // Yönlü/şerit doku: dikeyde daha sık, yatayda daha seyrek örneklem - bulut gibi
    // yuvarlak blob'lar yerine gerçek dalga çizgilerine yakın bir görünüm verir.
    // Akış hızı da yavaşlatıldı (0.045/0.03 -> 0.025/0.015).
    vec2 flow = vec2(uv.x * 2.2, uv.y * 5.5) + vec2(uTime * 0.025, uTime * 0.015);
    float n1 = fbm(flow);
    float n2 = fbm(flow * 1.6 + n1 * 1.4 + uTime * 0.012);

    // Dikey gradyan: fotoğraftaki gibi üst taraf koyu lacivert (uColorA), alt taraf
    // parlak turkuaza (uColorC) kayıyor. vUv.y'yi DEĞİL gl_FragCoord'u (gerçek ekran
    // pikseli) kullanıyoruz - çünkü bu mesh ekrandan kasıtlı olarak çok daha büyük
    // ölçeklenmiş (bkz. bileşen: scale={viewport*3}), yani ekranda vUv.y'nin sadece
    // dar bir orta dilimi görünüyor; vUv.y'ye dayanan bir gradyan neredeyse hiç
    // fark yaratmazdı. Ekran koordinatı ise ölçekten bağımsız, her zaman 0-1 kapsar.
    float screenY = gl_FragCoord.y / uResolution.y;
    float verticalBias = smoothstep(0.0, 1.0, screenY);

    vec3 color = mix(uColorA, uColorB, n1);
    color = mix(color, uColorC, clamp(n2 * 0.7, 0.0, 1.0));
    color = mix(color, uColorA, verticalBias * 0.55);
    color = mix(color, uColorC, (1.0 - verticalBias) * 0.4);

    // Köpük katmanı: ayrı, daha yüksek frekanslı bir fbm örneklemesi alınıp tepe
    // noktaları smoothstep ile keskin beyaz şeritlere çevriliyor - üstte (koyu suda)
    // daha belirgin, en altta hafifçe soluyor.
    // Eşik aralığı daraltıldı (0.42-0.6 -> 0.46-0.54) - bulanık/sisli değil, daha
    // keskin kenarlı, "premium" görünümlü köpük çizgileri için.
    float foamNoise = fbm(flow * 3.4 + vec2(0.0, uTime * 0.04));
    float foamMask = smoothstep(0.05, 0.9, screenY);
    float foam = smoothstep(0.46, 0.54, foamNoise) * foamMask;
    color = mix(color, uColorFoam, foam * 0.8);

    // İnce parıltı noktaları (su üzerindeki ışık yansımaları) - çok yüksek frekanslı,
    // seyrek bir eşik ile "premium/parlak" bir doku katkısı.
    float sparkleNoise = fbm(flow * 9.0 - vec2(uTime * 0.01, 0.0));
    float sparkle = smoothstep(0.72, 0.82, sparkleNoise) * foamMask;
    color = mix(color, uColorFoam, sparkle * 0.4);

    gl_FragColor = vec4(color, 0.82);
  }
`;

export const OceanShaderBackground: FC<OceanShaderBackgroundProps> = ({ reducedMotion = false }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, gl } = useThree();
  const pointer = useThree(state => state.pointer);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(gl.domElement.width, gl.domElement.height) },
      // Referans fotoğraftaki koyu lacivert üst / parlak turkuaz alt kontrastına
      // yaklaşmak için uColorA koyulaştırıldı, uColorC canlı bir mavi-turkuaza çekildi
      // (yeşile kaçan bir ton yerine).
      uColorA: { value: new THREE.Color('#082f49') },
      uColorB: { value: new THREE.Color('#0e7490') },
      uColorC: { value: new THREE.Color('#22d3ee') },
      uColorFoam: { value: new THREE.Color('#ecfeff') },
    }),
    [gl]
  );

  useFrame((_state, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const resolutionUniform = material.uniforms.uResolution.value as THREE.Vector2;
    resolutionUniform.set(gl.domElement.width, gl.domElement.height);

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
