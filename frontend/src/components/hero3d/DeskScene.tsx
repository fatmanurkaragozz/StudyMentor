import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, useScroll } from '@react-three/drei';
import { Color, DoubleSide, type PointLight, type Mesh, type MeshStandardMaterial } from 'three';
import { useTheme } from '../../context/ThemeContext';

const LAMP_SHADE_OFF_COLOR = new Color('#b45309');
const LAMP_SHADE_ON_COLOR = new Color('#fde68a');

const BASE_CAMERA_POS: [number, number, number] = [0, 2.2, 7.4];
// Metin bölümü sola yer açsın diye kamera masanın solundan bakıyor; masa ekranın sağında küçük kalıyor.
const LOOK_AT_TARGET: [number, number, number] = [-1.6, 0.2, 0];

const TICKER_PHRASE = "StudyMentor'e Hoş Geldiniz";
const TICKER_SEPARATOR = '   •   ';
const TICKER_UNIT = `${TICKER_PHRASE}${TICKER_SEPARATOR}`;
const TICKER_REPEATS = 4;
const TICKER_BAND_WIDTH = 1.7;
const TICKER_BAND_HEIGHT = 0.26;
const TICKER_SPEED = 0.35;

interface TickerText extends Mesh {
  clipRect: [number, number, number, number] | null;
  textRenderInfo: { blockBounds: [number, number, number, number] } | null;
}

export const DeskScene: FC = () => {
  const scroll = useScroll();
  const { camera } = useThree();
  const { theme } = useTheme();
  const lampLightRef = useRef<PointLight>(null);
  const fillLightRef = useRef<PointLight>(null);
  const lampShadeMaterialRef = useRef<MeshStandardMaterial>(null);
  const glintPinkRef = useRef<PointLight>(null);
  const glintMintRef = useRef<PointLight>(null);
  const tickerTextRef = useRef<TickerText>(null);
  const tickerUnitWidthRef = useRef(0);
  const tickerOffsetRef = useRef(0);

  useFrame((_, delta) => {
    const text = tickerTextRef.current;
    const unitWidth = tickerUnitWidthRef.current;
    if (!text || !unitWidth) return;
    tickerOffsetRef.current = (tickerOffsetRef.current + delta * TICKER_SPEED) % unitWidth;
    const o = tickerOffsetRef.current;
    // clipRect kayan pencereyi metnin kendi yerel uzayında ilerletir; position.x bunu
    // telafi ederek görünür pencereyi panel üzerinde sabit tutar (aksi halde pencere dünya
    // uzayında sürüklenip paneli aşar).
    text.position.x = -TICKER_BAND_WIDTH / 2 - o;
    text.clipRect = [o, -TICKER_BAND_HEIGHT / 2, TICKER_BAND_WIDTH + o, TICKER_BAND_HEIGHT / 2];
  });

  useFrame((state) => {
    const targetX = BASE_CAMERA_POS[0] + state.pointer.x * 0.1;
    const targetY = BASE_CAMERA_POS[1] + state.pointer.y * 0.06;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z = BASE_CAMERA_POS[2];
    camera.lookAt(...LOOK_AT_TARGET);

    if (lampLightRef.current) {
      const lampProgress = scroll.range(0.2, 0.3);
      lampLightRef.current.intensity = lampProgress * 5.6;
      if (fillLightRef.current) fillLightRef.current.intensity = lampProgress * 1.8;
      // Aşağı kaydırıp lamba yanarken abajurun rengi de tek hareketle koyudan açığa geçer.
      if (lampShadeMaterialRef.current) {
        lampShadeMaterialRef.current.color.lerpColors(LAMP_SHADE_OFF_COLOR, LAMP_SHADE_ON_COLOR, lampProgress);
      }
    }

    // Duvar ışık parıltıları - sadece karanlık modda, sayfa kaydırıldıkça hareket eder.
    if (glintPinkRef.current) {
      glintPinkRef.current.intensity = theme === 'dark' ? 0.15 + Math.abs(Math.sin(scroll.offset * Math.PI * 3)) * 0.45 : 0;
    }
    if (glintMintRef.current) {
      glintMintRef.current.intensity =
        theme === 'dark' ? 0.15 + Math.abs(Math.sin(scroll.offset * Math.PI * 3 + 1.5)) * 0.45 : 0;
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* Arka duvar - açık gri, şık ve profesyonel bir zemin */}
      <mesh position={[0, 1.6, -1.3]}>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial color="#cbcbd1" roughness={0.85} />
      </mesh>

      {/* Neon LED tabela - yatay, sürekli kayan karşılama yazısı */}
      <group position={[1.7, 2.1, -1.28]}>
        <mesh>
          <planeGeometry args={[1.9, 0.42]} />
          <meshStandardMaterial color="#0f1729" roughness={0.75} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.78, 0.32]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.6} emissive="#312e81" emissiveIntensity={0.2} />
        </mesh>
        <Text
          ref={tickerTextRef}
          position={[-TICKER_BAND_WIDTH / 2, 0, 0.02]}
          fontSize={0.2}
          anchorX="left"
          anchorY="middle"
          whiteSpace="nowrap"
          color="#eef2ff"
          outlineWidth="10%"
          outlineBlur="35%"
          outlineColor="#818cf8"
          outlineOpacity={0.9}
          clipRect={[0, -TICKER_BAND_HEIGHT / 2, TICKER_BAND_WIDTH, TICKER_BAND_HEIGHT / 2]}
          onSync={(self: TickerText) => {
            const info = self.textRenderInfo;
            if (info) {
              const [minX, , maxX] = info.blockBounds;
              tickerUnitWidthRef.current = (maxX - minX) / TICKER_REPEATS;
            }
          }}
        >
          {TICKER_UNIT.repeat(TICKER_REPEATS)}
        </Text>

        {/* Duvar çivisi - tabelanın üstünde, ip bağlantı noktası */}
        <mesh position={[0, 0.575, 0.03]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
        </mesh>
        {/* Askı ipi - çividen panelin iki üst köşesine inen üçgen tel */}
        <mesh position={[-0.475, 0.385, 0.02]} rotation={[0, 0, -1.217]}>
          <capsuleGeometry args={[0.008, 1.0, 4, 8]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.475, 0.385, 0.02]} rotation={[0, 0, 1.217]}>
          <capsuleGeometry args={[0.008, 1.0, 4, 8]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.4} metalness={0.5} />
        </mesh>
      </group>

      {/* Masa yüzeyi - tam genişlik, açık kahve tonu, marka pembesiyle uyumlu */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6.4, 0.2, 2.4]} />
        <meshStandardMaterial color="#c9a278" roughness={0.5} />
      </mesh>

      {/* Masa çevresi LED şerit aydınlatma - ince, neon vurgulu bir kenar ışığı */}
      <group>
        <mesh position={[0, -0.09, 1.21]}>
          <boxGeometry args={[6.42, 0.025, 0.025]} />
          <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={1.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.09, -1.21]}>
          <boxGeometry args={[6.42, 0.025, 0.025]} />
          <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={1.6} roughness={0.3} />
        </mesh>
        <mesh position={[-3.21, -0.09, 0]}>
          <boxGeometry args={[0.025, 0.025, 2.42]} />
          <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={1.6} roughness={0.3} />
        </mesh>
        <mesh position={[3.21, -0.09, 0]}>
          <boxGeometry args={[0.025, 0.025, 2.42]} />
          <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={1.6} roughness={0.3} />
        </mesh>
      </group>

      {/* Laptop */}
      <group position={[-1.2, 0.15, -0.4]} rotation={[0, 0.15, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.06, 0.75]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.28, -0.36]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[1.1, 0.6, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.28, -0.34]} rotation={[-0.25, 0, 0]}>
          <boxGeometry args={[0.98, 0.5, 0.01]} />
          <meshStandardMaterial color="#312e81" emissive="#4f46e5" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Kitap yığını - sabit, artık masadan ayrılmıyor */}
      <group position={[-1.5, 0.15, 0.6]} rotation={[0, 0.3, 0]}>
        <mesh>
          <boxGeometry args={[0.7, 0.08, 0.5]} />
          <meshStandardMaterial color="#4338ca" roughness={0.7} />
        </mesh>
        <mesh position={[0.05, 0.09, 0.02]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[0.65, 0.07, 0.46]} />
          <meshStandardMaterial color="#6d28d9" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.17, -0.02]} rotation={[0, 0.1, 0]}>
          <boxGeometry args={[0.6, 0.06, 0.42]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
        </mesh>
      </group>

      {/* Kahve fincanı - sabit */}
      <group position={[1.5, 0.16, 0.55]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.14, 0.22, 20]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} />
        </mesh>
      </group>

      {/* Saksı bitki - sabit */}
      <group position={[1.6, 0.2, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.1, 0.2, 12]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.22, 0.4, 8]} />
          <meshStandardMaterial color="#059669" roughness={0.8} />
        </mesh>
      </group>

      {/* Açık defter */}
      <mesh position={[0.1, 0.14, 0.3]} rotation={[0, -0.05, 0]}>
        <boxGeometry args={[1.3, 0.04, 0.9]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Kalemlik - sağ uç */}
      <group position={[2.9, 0.22, 0.3]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.09, 0.22, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {[-0.03, 0.02, 0.06].map((offsetX, i) => (
          <mesh key={offsetX} position={[offsetX, 0.16, 0]} rotation={[0, 0, i * 0.15 - 0.15]}>
            <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
            <meshStandardMaterial color={i === 1 ? '#f59e0b' : '#94a3b8'} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Yapışkan not defteri - sol uç */}
      <group position={[-2.9, 0.13, -0.3]} rotation={[0, 0.2, 0]}>
        <mesh>
          <boxGeometry args={[0.35, 0.05, 0.35]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.035, 0]}>
          <boxGeometry args={[0.22, 0.01, 0.22]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.8} />
        </mesh>
      </group>

      {/* Masa lambası - sağ köşede, duvara yakın, büyütülmüş, tüm masayı aydınlatacak menzilde */}
      <group position={[2.6, 0.32, -1.0]} scale={1.4}>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.05, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
          <meshStandardMaterial color="#334155" roughness={0.5} />
        </mesh>
        <mesh position={[0.1, 0.28, 0]} rotation={[0, 0, -0.6]}>
          <coneGeometry args={[0.16, 0.24, 16, 1, true]} />
          <meshStandardMaterial ref={lampShadeMaterialRef} color="#b45309" roughness={0.4} side={DoubleSide} />
        </mesh>
        <pointLight ref={lampLightRef} position={[0.14, 0.22, 0]} color="#f59e0b" intensity={0} distance={9} decay={1.4} />
      </group>

      {/* Dolgu ışığı - masanın sağ ucunu (fincan/saksı/kalemlik) da lamba yanınca aydınlatır */}
      <pointLight ref={fillLightRef} position={[1.8, 1.1, 0.4]} color="#fcd34d" intensity={0} distance={7} decay={1.6} />

      {/* Işık parıltıları - tabela ve laptop ekranı kenarlarında, sadece karanlık modda, scroll ile hareket eder */}
      <pointLight ref={glintPinkRef} position={[2.65, 2.31, -1.25]} color="#F4A9C6" intensity={0} distance={2.5} decay={2} />
      <pointLight ref={glintMintRef} position={[-1.6, 0.75, -0.6]} color="#54D6B2" intensity={0} distance={2.5} decay={2} />

      {/* Ders programı çizelgesi - kitaplığın sağına asılı, tablo değil program */}
      <group position={[-0.35, 1.85, -1.27]}>
        {/* Çerçeve */}
        <mesh>
          <planeGeometry args={[1.1, 1.4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
        {/* Kağıt zemin */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[0.94, 1.24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
        </mesh>
        {/* Başlık */}
        <Text position={[0, 0.53, 0.02]} fontSize={0.09} color="#1e293b" anchorX="center" anchorY="middle">
          Ders Programı
        </Text>
        {/* Üst satır - gün başlıkları çizgisi */}
        <mesh position={[0, 0.42, 0.02]}>
          <planeGeometry args={[0.86, 0.02]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Sol sütun - saat çizgisi */}
        <mesh position={[-0.34, 0.05, 0.02]}>
          <planeGeometry args={[0.02, 0.78]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
        {/* Yatay satır çizgileri */}
        {[0.26, 0.1, -0.06, -0.22, -0.38].map((y) => (
          <mesh key={y} position={[0.08, y, 0.015]}>
            <planeGeometry args={[0.78, 0.008]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
        ))}
        {/* Dikey sütun çizgileri */}
        {[-0.13, 0.08, 0.29].map((x) => (
          <mesh key={x} position={[x, -0.15, 0.015]}>
            <planeGeometry args={[0.008, 0.66]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
        ))}
        {/* Renkli ders blokları - dolu saatler */}
        {[
          { x: -0.24, y: 0.34, color: '#4338ca' },
          { x: -0.03, y: 0.34, color: '#f59e0b' },
          { x: -0.24, y: 0.18, color: '#6d28d9' },
          { x: 0.18, y: 0.18, color: '#4338ca' },
          { x: -0.03, y: 0.02, color: '#059669' },
          { x: 0.18, y: -0.14, color: '#f59e0b' },
          { x: -0.24, y: -0.3, color: '#6d28d9' },
          { x: -0.03, y: -0.3, color: '#4338ca' },
        ].map((cell) => (
          <mesh key={`${cell.x}-${cell.y}`} position={[cell.x, cell.y, 0.02]}>
            <planeGeometry args={[0.16, 0.1]} />
            <meshStandardMaterial color={cell.color} roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Duvara asılı sarmaşık saksısı - kitaplığın çok daha üzerinde, aşağı sarkan dallarla */}
      <group position={[-1.9, 2.5, -1.27]}>
        <mesh>
          <boxGeometry args={[0.7, 0.16, 0.16]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, 0.02]}>
          <boxGeometry args={[0.62, 0.03, 0.14]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {[
          { x: -0.24, len: 0.5, tilt: -0.12, color: '#059669' },
          { x: -0.1, len: 0.62, tilt: 0.06, color: '#10b981' },
          { x: 0.06, len: 0.44, tilt: -0.08, color: '#047857' },
          { x: 0.22, len: 0.56, tilt: 0.1, color: '#059669' },
        ].map((vine) => (
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

      {/* Kitaplık - poster altında, alçak bir raf */}
      <group position={[-1.9, 0.95, -1.15]}>
        <mesh>
          <boxGeometry args={[1.3, 0.05, 0.22]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
        {[
          { x: -0.5, h: 0.42, color: '#4338ca' },
          { x: -0.32, h: 0.34, color: '#6d28d9' },
          { x: -0.15, h: 0.46, color: '#1e293b' },
          { x: 0.05, h: 0.3, color: '#c9a876' },
          { x: 0.22, h: 0.4, color: '#334155' },
          { x: 0.42, h: 0.36, color: '#4338ca' },
        ].map((book) => (
          <mesh key={book.x} position={[book.x, book.h / 2 + 0.03, 0]}>
            <boxGeometry args={[0.1, book.h, 0.18]} />
            <meshStandardMaterial color={book.color} roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
};
