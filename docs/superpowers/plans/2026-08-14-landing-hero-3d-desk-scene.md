# Açılış Sayfası 3D Masa Sahnesi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Açılış sayfasının hero'suna, spec'te (`docs/superpowers/specs/2026-08-14-landing-hero-3d-desk-scene-design.md`) onaylanan gerçek 3D (react-three-fiber) bir masa+lamba sahnesi eklemek — sabit "gece" atmosferinde, 3/4 açılı kamera, WebGL yoksa mevcut düz-SVG `DeskHeroAnimation`'a düşen bir fallback ile.

**Architecture:** `frontend/src/components/hero3d/` altında yeni bir 3D katmanı (`HeroCanvas`/`DeskScene`/`lighting`/`WebGLFallback`), mevcut `DeskHeroAnimation.tsx`'in rota-çizgisi mantığı paylaşılan bir `RouteOverlay` bileşenine çıkarılıp hem 3D sahnenin üzerine bindirilen 2D overlay olarak hem de düz-SVG fallback içinde yeniden kullanılıyor. Sekans orkestrasyonu (`useHeroIntroSequence`) değişmeden kalıyor, teknolojiden bağımsız.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4, `@react-three/fiber` + `@react-three/drei` + `three` (bu planla geri ekleniyor), lucide-react.

## Global Constraints

- Projede backend/frontend için otomatik test altyapısı **yok** (bkz. `CLAUDE.md` "Known gaps"). Bu plan, birim-test yerine bu kod tabanında zaten kullanılan gerçek doğrulama yöntemini kullanıyor: her adımda `npm run build` (tip kontrolü) + `npm run lint`, son adımda Playwright ile görsel/uçtan-uca doğrulama. Bu bilinçli bir sapma — sahte/anlamsız birim testleri yazmak yerine bu kod tabanının gerçek pratiğine uyuluyor.
- Tüm yeni React bileşenleri fonksiyonel component + `FC` tip deseniyle yazılıyor (mevcut kod tabanı konvansiyonu).
- Yeni bağımlılık **eklenmiyor** (react-three-fiber/drei/three dışında) — animasyon kütüphanesi (GSAP, framer-motion) kullanılmıyor, spec'te belirtildiği gibi.
- `prefers-reduced-motion` desteği `useHeroIntroSequence`/`useReducedMotion` üzerinden zaten sağlanıyor, yeni kod bunu bozmamalı.
- Tüm dosya yolları repo köküne göre.

---

### Task 1: Bağımlılıkları geri yükle

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` paketleri `node_modules` içinde kullanılabilir olur (sonraki tüm task'lar buna bağımlı).

- [ ] **Step 1: `package.json`'a bağımlılıkları ekle**

`frontend/package.json`'daki `dependencies` ve `devDependencies` bloklarını şu hale getir (bu proje daha önce bu tam sürümleri kullanıyordu):

```json
  "dependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.6.1",
    "lucide-react": "^1.26.0",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "three": "^0.185.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/node": "^24.13.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@types/three": "^0.185.1",
    "@vitejs/plugin-react": "^6.0.3",
    "oxlint": "^1.71.0",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.2",
    "vite": "^8.1.1"
  }
```

- [ ] **Step 2: Paketleri yükle**

Run: `cd frontend && npm install`
Expected: `node_modules/@react-three/fiber`, `node_modules/@react-three/drei`, `node_modules/three` oluşur, hata olmadan biter.

- [ ] **Step 3: Build'in hâlâ geçtiğini doğrula**

Run: `cd frontend && npm run build`
Expected: Değişiklik olmadığı için başarıyla geçer (henüz yeni kod eklenmedi, sadece bağımlılık kuruldu).

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(frontend): react-three-fiber/drei/three bagimliliklarini geri ekle"
```

---

### Task 2: `useHeroIntroSequence.ts`'ten `STAGE_INDEX`'i export et

**Files:**
- Modify: `frontend/src/hooks/useHeroIntroSequence.ts`

**Interfaces:**
- Consumes: mevcut `HeroIntroStage` tipi, mevcut hook (değişmiyor).
- Produces: `export const STAGE_INDEX: Record<HeroIntroStage, number>` — `{ desk: 0, hand: 1, route: 2, modes: 3 }`. Sonraki tüm task'lar (`RouteOverlay`, `DeskHeroAnimation`, `DeskScene`, `LandingPage`) bunu buradan import edecek (şu an `DeskHeroAnimation.tsx` içinde yerel/kopya olarak tanımlı — o kopya Task 3'te kaldırılacak).

- [ ] **Step 1: `STAGE_INDEX`'i dosyaya ekle ve export et**

`frontend/src/hooks/useHeroIntroSequence.ts` dosyasının tamamını şu hale getir:

```ts
import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type HeroIntroStage = 'desk' | 'hand' | 'route' | 'modes';

const STAGE_ORDER: HeroIntroStage[] = ['desk', 'hand', 'route', 'modes'];
const STAGE_DELAYS_MS = [0, 800, 1800, 3500];

export const STAGE_INDEX: Record<HeroIntroStage, number> = { desk: 0, hand: 1, route: 2, modes: 3 };

export function useHeroIntroSequence(): HeroIntroStage {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<HeroIntroStage>(reducedMotion ? 'modes' : 'desk');

  useEffect(() => {
    if (reducedMotion) {
      setStage('modes');
      return;
    }

    const timers = STAGE_ORDER.map((s, i) => setTimeout(() => setStage(s), STAGE_DELAYS_MS[i]));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  return stage;
}
```

(Tek değişiklik: `STAGE_INDEX` sabiti eklendi ve export edildi; hook'un kendi davranışı aynı.)

- [ ] **Step 2: Build'in geçtiğini doğrula**

Run: `cd frontend && npm run build`
Expected: Geçer (henüz hiçbir dosya bu yeni export'u kullanmıyor, sadece ek bir export var).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useHeroIntroSequence.ts
git commit -m "refactor(frontend): STAGE_INDEX'i useHeroIntroSequence'tan disari export et"
```

---

### Task 3: `RouteOverlay.tsx` oluştur, `DeskHeroAnimation.tsx`'i buna göre refactor et

**Files:**
- Create: `frontend/src/components/hero3d/RouteOverlay.tsx`
- Modify: `frontend/src/components/DeskHeroAnimation.tsx`

**Interfaces:**
- Consumes: `STAGE_INDEX` (Task 2'den).
- Produces: `export const RouteOverlay: FC<{ stageIndex: number }>` — bir `<svg>` içine yerleştirilmesi gereken bir `<g>` döndürür (kendi `<svg>` sarmalayıcısı yok, çağıran yerin `viewBox="0 0 600 420"` olan bir `<svg>` içinde kullanması gerekir). Task 8'de hem `DeskHeroAnimation.tsx` (fallback yolu) hem `LandingPage.tsx`'teki 3D overlay tarafından kullanılacak.

- [ ] **Step 1: `RouteOverlay.tsx`'i oluştur**

`frontend/src/components/hero3d/RouteOverlay.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { STAGE_INDEX } from '../../hooks/useHeroIntroSequence';

interface RouteOverlayProps {
  stageIndex: number;
}

export const RouteOverlay: FC<RouteOverlayProps> = ({ stageIndex }) => {
  const trunkRef = useRef<SVGPathElement>(null);
  const leftBranchRef = useRef<SVGPathElement>(null);
  const rightBranchRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    [trunkRef, leftBranchRef, rightBranchRef].forEach(ref => {
      const el = ref.current;
      if (!el) return;
      const length = el.getTotalLength();
      el.style.strokeDasharray = `${length}`;
      el.style.strokeDashoffset = `${length}`;
    });
  }, []);

  useEffect(() => {
    if (trunkRef.current && stageIndex >= STAGE_INDEX.route) {
      trunkRef.current.style.strokeDashoffset = '0';
    }
    if (stageIndex >= STAGE_INDEX.route) {
      const timer = setTimeout(() => {
        if (leftBranchRef.current) leftBranchRef.current.style.strokeDashoffset = '0';
        if (rightBranchRef.current) rightBranchRef.current.style.strokeDashoffset = '0';
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [stageIndex]);

  return (
    <g className={`transition-opacity duration-500 ${stageIndex >= STAGE_INDEX.route ? 'opacity-100' : 'opacity-0'}`}>
      <path
        ref={trunkRef}
        d="M336 300 C332 335 312 368 296 392"
        className="fill-none stroke-indigo-500 dark:stroke-indigo-400 transition-all duration-[900ms] ease-out"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        ref={leftBranchRef}
        d="M296 392 C258 402 200 408 150 410"
        className="fill-none stroke-indigo-500 dark:stroke-indigo-400 transition-all duration-[700ms] ease-out"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        ref={rightBranchRef}
        d="M296 392 C336 402 396 408 450 410"
        className="fill-none stroke-violet-500 dark:stroke-violet-400 transition-all duration-[700ms] ease-out"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="150" cy="410" r={stageIndex >= STAGE_INDEX.modes ? 5 : 0} className="fill-indigo-600 transition-all duration-300" />
      <circle cx="450" cy="410" r={stageIndex >= STAGE_INDEX.modes ? 5 : 0} className="fill-violet-600 transition-all duration-300" />
    </g>
  );
};
```

(Bu, `DeskHeroAnimation.tsx`'teki mevcut "Rota çizgisi" `<g>` bloğunun birebir taşınmış hâli — `stageIndex` artık dışarıdan prop olarak geliyor, önceden lokal değişkendi.)

- [ ] **Step 2: `DeskHeroAnimation.tsx`'i `RouteOverlay` kullanacak şekilde güncelle**

`frontend/src/components/DeskHeroAnimation.tsx` içinde:

1. İmportlara ekle: `import { RouteOverlay } from './hero3d/RouteOverlay';` ve `import { STAGE_INDEX } from '../hooks/useHeroIntroSequence';`
2. Dosyanın en üstündeki yerel `const STAGE_INDEX: Record<HeroIntroStage, number> = { desk: 0, hand: 1, route: 2, modes: 3 };` satırını **sil** (artık import ediliyor).
3. `trunkRef`, `leftBranchRef`, `rightBranchRef` tanımlarını ve bunlarla ilgili `useEffect` içindeki mantığı **sil** — sadece `checkRef` kalsın:

```tsx
const checkRef = useRef<SVGPathElement>(null);

useEffect(() => {
  const el = checkRef.current;
  if (!el) return;
  const length = el.getTotalLength();
  el.style.strokeDasharray = `${length}`;
  el.style.strokeDashoffset = `${length}`;
}, []);

useEffect(() => {
  if (checkRef.current && stageIndex >= STAGE_INDEX.hand) {
    checkRef.current.style.strokeDashoffset = '0';
  }
}, [stageIndex]);
```

4. Dosyanın sonundaki (`{/* Rota çizgisi ... */}` ile başlayan) tüm `<g className={...}>...</g>` bloğunu **sil**, yerine koy:

```tsx
<RouteOverlay stageIndex={stageIndex} />
```

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer, tip hatası olmamalı (özellikle kaldırılan `useRef`/`useEffect` sonrası kullanılmayan import kalmadığından emin ol).

- [ ] **Step 4: Manuel görsel kontrol**

Run: `cd frontend && npm run dev`, tarayıcıda açılış sayfasını aç.
Expected: Masa animasyonu öncekiyle **birebir aynı** görünüyor ve aynı şekilde oynuyor (masa → el → rota çizgisi → kartlar) — bu bir refactor, davranış değişmedi.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/hero3d/RouteOverlay.tsx frontend/src/components/DeskHeroAnimation.tsx
git commit -m "refactor(frontend): rota cizgisini paylasilan RouteOverlay bilesenine cikar"
```

---

### Task 4: `hero3d/lighting.tsx` oluştur

**Files:**
- Create: `frontend/src/components/hero3d/lighting.tsx`

**Interfaces:**
- Produces: `export const HeroLights: FC` — 3D sahne için loş/soğuk dolgu ışığı sağlayan bir bileşen (Task 6'da `HeroCanvas.tsx` içinde kullanılacak). Sıcak lamba ışığı burada değil, `DeskScene.tsx` içinde (Task 5) lamba geometrisiyle birlikte tanımlanacak — ışık kaynağı görsel olarak nesnesine bağlı kalsın diye.

- [ ] **Step 1: `lighting.tsx`'i oluştur**

`frontend/src/components/hero3d/lighting.tsx`:

```tsx
import type { FC } from 'react';

export const HeroLights: FC = () => (
  <>
    <ambientLight intensity={0.18} color="#1e293b" />
    <hemisphereLight args={['#1e2947', '#020617', 0.25]} />
  </>
);
```

- [ ] **Step 2: Build'in geçtiğini doğrula**

Run: `cd frontend && npm run build`
Expected: Geçer (henüz hiçbir yerden import edilmiyor ama tip hatası olmamalı — `ambientLight`/`hemisphereLight` JSX intrinsic element'leri `@react-three/fiber` tarafından sağlanıyor).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/hero3d/lighting.tsx
git commit -m "feat(frontend): 3D hero sahnesi icin dolgu isigi bileseni ekle"
```

---

### Task 5: `hero3d/DeskScene.tsx` oluştur

**Files:**
- Create: `frontend/src/components/hero3d/DeskScene.tsx`

**Interfaces:**
- Consumes: `HeroIntroStage`, `STAGE_INDEX` (Task 2'den).
- Produces: `export const DeskScene: FC<{ stage: HeroIntroStage }>` — masa, duvar, pencere, laptop, kitaplar, fincan, saksı, defter, el+kalem ve lambayı (sıcak `pointLight` dahil) içeren 3D sahne içeriği. Task 6'da `HeroCanvas.tsx` içinde `<Canvas>` altında kullanılacak.

- [ ] **Step 1: `DeskScene.tsx`'i oluştur**

`frontend/src/components/hero3d/DeskScene.tsx`:

```tsx
import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Group } from 'three';
import { STAGE_INDEX, type HeroIntroStage } from '../../hooks/useHeroIntroSequence';

interface DeskSceneProps {
  stage: HeroIntroStage;
}

export const DeskScene: FC<DeskSceneProps> = ({ stage }) => {
  const handGroupRef = useRef<Group>(null);
  const handVisible = STAGE_INDEX[stage] >= STAGE_INDEX.hand;

  useFrame((_state, delta) => {
    if (!handGroupRef.current) return;
    const target = handVisible ? 1 : 0;
    const current = handGroupRef.current.scale.x;
    const next = current + (target - current) * Math.min(delta * 6, 1);
    handGroupRef.current.scale.setScalar(next);
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* Arka duvar - gece/atmosfer için neredeyse siyah */}
      <mesh position={[0, 1.6, -1.3]}>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.95} />
      </mesh>

      {/* Pencere - loş mavi-mor ışık lekesi, derinlik hissi için */}
      <mesh position={[1.7, 2.1, -1.28]}>
        <planeGeometry args={[1.2, 1.3]} />
        <meshStandardMaterial color="#1e2947" emissive="#312e81" emissiveIntensity={0.4} />
      </mesh>

      {/* Masa yüzeyi */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[4.2, 0.2, 2.4]} />
        <meshStandardMaterial color="#232f4d" roughness={0.6} />
      </mesh>

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

      {/* Kitap yığını */}
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

      {/* Kahve fincanı */}
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

      {/* Saksı bitki */}
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

      {/* El + kalem - 'hand' asamasinda buyuyerek beliriyor */}
      <group ref={handGroupRef} position={[0.75, 0.2, 0.55]} rotation={[0, -0.3, 0]} scale={0}>
        <mesh>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[-0.16, 0, 0.1]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.035, 0.16, 4, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[-0.1, 0, 0.2]} rotation={[0, 0, 0.15]}>
          <capsuleGeometry args={[0.035, 0.18, 4, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0.02, 0, 0.22]}>
          <capsuleGeometry args={[0.035, 0.18, 4, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0.13, 0, 0.14]} rotation={[0, 0, -0.2]}>
          <capsuleGeometry args={[0.03, 0.14, 4, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, 0.05, 0.32]} rotation={[1.3, 0, -0.3]}>
          <cylinderGeometry args={[0.018, 0.018, 0.42, 8]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.4} />
        </mesh>
      </group>

      {/* Masa lambasi - sicak isigin gercek kaynagi */}
      <group position={[-1.6, 0.3, 0.75]}>
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
          <meshStandardMaterial color="#fbbf24" roughness={0.4} side={DoubleSide} />
        </mesh>
        <pointLight position={[0.14, 0.22, 0]} color="#f59e0b" intensity={2.2} distance={3.5} decay={2} />
      </group>
    </group>
  );
};
```

- [ ] **Step 2: Build'in geçtiğini doğrula**

Run: `cd frontend && npm run build`
Expected: Geçer. `capsuleGeometry`/`coneGeometry`/`DoubleSide` tip hatası vermemeli (proje daha önce `Mascot.tsx`'te `capsuleGeometry` kullanmıştı, aynı `three` sürümü).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/hero3d/DeskScene.tsx
git commit -m "feat(frontend): 3D masa sahnesini olustur (masa, laptop, lamba, el+kalem)"
```

---

### Task 6: `hero3d/HeroCanvas.tsx` oluştur

**Files:**
- Create: `frontend/src/components/hero3d/HeroCanvas.tsx`

**Interfaces:**
- Consumes: `HeroLights` (Task 4), `DeskScene` (Task 5), `HeroIntroStage`.
- Produces: `export default HeroCanvas: FC<{ stage: HeroIntroStage }>` — Task 8'de `LandingPage.tsx`'ten `lazy(() => import('./hero3d/HeroCanvas'))` ile lazy-load edilecek (default export, eski `HeroCanvas.tsx`'teki gibi).

- [ ] **Step 1: `HeroCanvas.tsx`'i oluştur**

`frontend/src/components/hero3d/HeroCanvas.tsx`:

```tsx
import { Suspense } from 'react';
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroLights } from './lighting';
import { DeskScene } from './DeskScene';
import type { HeroIntroStage } from '../../hooks/useHeroIntroSequence';

interface HeroCanvasProps {
  stage: HeroIntroStage;
}

const HeroCanvas: FC<HeroCanvasProps> = ({ stage }) => (
  <div className="absolute inset-0">
    <Canvas
      camera={{ position: [0, 3.4, 3.2], fov: 38 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <Suspense fallback={null}>
        <HeroLights />
        <DeskScene stage={stage} />
      </Suspense>
    </Canvas>
  </div>
);

export default HeroCanvas;
```

- [ ] **Step 2: Build'in geçtiğini doğrula**

Run: `cd frontend && npm run build`
Expected: Geçer.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/hero3d/HeroCanvas.tsx
git commit -m "feat(frontend): 3D hero canvas sarmalayicisini olustur"
```

---

### Task 7: `hero3d/WebGLFallback.tsx` oluştur, `DeskHeroAnimation.tsx`'in dış sarmalayıcısını sadeleştir

**Files:**
- Create: `frontend/src/components/hero3d/WebGLFallback.tsx`
- Modify: `frontend/src/components/DeskHeroAnimation.tsx`

**Interfaces:**
- Consumes: `DeskHeroAnimation` (Task 3'ten refactor edilmiş hâli), `HeroIntroStage`.
- Produces: `export function hasWebGLSupport(): boolean`, `export const StaticHeroFallback: FC<{ stage: HeroIntroStage }>`. Task 8'de `LandingPage.tsx` tarafından kullanılacak.

- [ ] **Step 1: `DeskHeroAnimation.tsx`'in dış `<div>` sarmalayıcısını kaldır**

Artık `DeskHeroAnimation` sadece `StaticHeroFallback` içinden çağrılacak ve boyutlandırmayı (genişlik/en-boy oranı) çağıran yer (`LandingPage.tsx`, Task 8) üstlenecek. `frontend/src/components/DeskHeroAnimation.tsx`'te:

Şu anki kök:
```tsx
  return (
    <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
      <svg
        viewBox="0 0 600 420"
        className={`w-full h-auto transition-opacity duration-700 ${stageIndex >= STAGE_INDEX.desk ? 'opacity-100' : 'opacity-0'}`}
      >
```

Bunu şu hale getir (dış `<div>` kaldırıldı, `<svg>` doğrudan dönülüyor, `h-auto` yerine `h-full`):
```tsx
  return (
    <svg
      viewBox="0 0 600 420"
      className={`w-full h-full transition-opacity duration-700 ${stageIndex >= STAGE_INDEX.desk ? 'opacity-100' : 'opacity-0'}`}
    >
```

Ve dosyanın en sonundaki kapanışı:
```tsx
      </svg>
    </div>
  );
};
```
şuna indir (fazladan `</div>` kaldırıldı):
```tsx
    </svg>
  );
};
```

- [ ] **Step 2: `WebGLFallback.tsx`'i oluştur**

`frontend/src/components/hero3d/WebGLFallback.tsx`:

```tsx
import type { FC } from 'react';
import type { HeroIntroStage } from '../../hooks/useHeroIntroSequence';
import { DeskHeroAnimation } from '../DeskHeroAnimation';

export function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

interface StaticHeroFallbackProps {
  stage: HeroIntroStage;
}

export const StaticHeroFallback: FC<StaticHeroFallbackProps> = ({ stage }) => <DeskHeroAnimation stage={stage} />;
```

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/hero3d/WebGLFallback.tsx frontend/src/components/DeskHeroAnimation.tsx
git commit -m "feat(frontend): WebGL fallback bilesenini olustur (DeskHeroAnimation'i yeniden kullanir)"
```

---

### Task 8: `LandingPage.tsx`'i lazy-3D + overlay ile güncelle

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `hasWebGLSupport`/`StaticHeroFallback` (Task 7), `RouteOverlay` (Task 3), `STAGE_INDEX` (Task 2), `HeroCanvas` default export (Task 6).

- [ ] **Step 1: İmportları güncelle**

`frontend/src/components/LandingPage.tsx`'in en üstündeki import bloğunu şu hale getir:

```tsx
import { lazy, Suspense, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { STAGE_INDEX } from '../hooks/useHeroIntroSequence';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { StaticHeroFallback, hasWebGLSupport } from './hero3d/WebGLFallback';
import { RouteOverlay } from './hero3d/RouteOverlay';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import {
  GraduationCap,
  Briefcase,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
} from 'lucide-react';

const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));
```

(Not: `DeskHeroAnimation` doğrudan import edilmiyor artık — `StaticHeroFallback` üzerinden dolaylı kullanılıyor.)

- [ ] **Step 2: `webglSupported` durumunu ekle**

Bileşenin içinde, `const stage = useHeroIntroSequence();` satırının hemen altına ekle:

```tsx
  const webglSupported = useMemo(() => hasWebGLSupport(), []);
```

- [ ] **Step 3: Hero görsel bloğunu değiştir**

Şu anki:
```tsx
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pt-10 sm:pt-14 pb-8 text-center">
        <DeskHeroAnimation stage={stage} />
        <h2 className="mt-8 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
```

Bunu şu hale getir:
```tsx
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-12 pt-10 sm:pt-14 pb-8 text-center">
        <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto aspect-[10/7]">
          {webglSupported ? (
            <>
              <Suspense fallback={<StaticHeroFallback stage={stage} />}>
                <LazyHeroCanvas stage={stage} />
              </Suspense>
              <svg viewBox="0 0 600 420" className="absolute inset-0 w-full h-full pointer-events-none">
                <RouteOverlay stageIndex={STAGE_INDEX[stage]} />
              </svg>
            </>
          ) : (
            <StaticHeroFallback stage={stage} />
          )}
        </div>
        <h2 className="mt-8 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
```

(Geri kalan `<h2>`/`<p>` ve mod-kartları bölümü **değişmiyor**.)

- [ ] **Step 4: Koyu modda sıcak ambient leke ekle**

Design doc'un "Tema davranışı" bölümü, koyu modda lambanın ışığıyla görsel süreklilik kuran, düşük opaklıklı bir sıcak (amber) ambient leke istiyor (açık modda eklenmiyor). Şu anki iki ambient leke (`LandingPage.tsx`'in en üstünde, `<header>`'dan hemen önce):

```tsx
      <div className="absolute top-10 right-[10%] w-72 h-72 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/[0.05] blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-24 left-[6%] w-80 h-80 rounded-full bg-violet-500/[0.06] dark:bg-violet-500/[0.05] blur-3xl pointer-events-none select-none" />
```

Bunun hemen altına üçüncü, **sadece koyu modda görünen** bir leke ekle:

```tsx
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-amber-500/0 dark:bg-amber-500/[0.05] blur-3xl pointer-events-none select-none" />
```

(Açık modda `bg-amber-500/0` = tamamen görünmez, koyu modda `dark:bg-amber-500/[0.05]` devreye giriyor — mevcut iki lekeyle aynı düşük-opaklık desenini izliyor, hero'nun ortasında/lambaya yakın bir konumda.)

- [ ] **Step 6: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer. `STAGE_INDEX` iki kez import edilmiş görünüyorsa (satır 1'deki `useHeroIntroSequence` import'unda tip olarak zaten gelmiyor, ayrı satırda değer olarak import ediliyor) — bu normal, `useHeroIntroSequence` fonksiyonu ve `STAGE_INDEX` sabiti aynı dosyadan iki ayrı named import, TypeScript bunu tek satırda da birleştirebilir, oxlint/tsc hata vermez.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "feat(frontend): acilis sayfasina 3D masa sahnesini bagla (WebGL fallback ile)"
```

---

### Task 9: Uçtan uca doğrulama

**Files:** (yok — sadece doğrulama)

- [ ] **Step 1: Build + lint son kontrol**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz.

- [ ] **Step 2: Bundle'da 3D chunk'ının geri geldiğini doğrula**

Run: `cd frontend && ls dist/assets/`
Expected: Ayrı, büyükçe bir `HeroCanvas-*.js` (veya benzeri isimli) chunk görünüyor — bu, lazy-loading'in ve 3D bağımlılıklarının doğru çalıştığının paket-boyutu kanıtı.

- [ ] **Step 3: Playwright ile görsel doğrulama (açık/koyu/mobil/reduced-motion)**

`npm run dev` ile dev server başlat, ardından (proje bu oturumda birkaç kez kullanılan Playwright script desenini izleyerek) şu senaryoları ekran görüntüsüyle doğrula:
- Açık mod, masaüstü (1280px): sahnenin göründüğünü, `pt-10`/kart alanının doğru hizalandığını kontrol et.
- Koyu mod, masaüstü: lamba ışığının/atmosferin göründüğünü kontrol et.
- Sekansın farklı anları (0sn/1sn/2sn/4sn): masa → el → rota → kartlar sırasının doğru çalıştığını doğrula.
- Mobil (390px): sahnenin taşmadan `aspect-[10/7]` kutusuna sığdığını kontrol et.
- `prefers-reduced-motion: reduce`: sahnenin anında bitmiş halde (el görünür, kartlar görünür) yüklendiğini, konsolda hata olmadığını doğrula.

Expected: Hepsinde konsol hatası yok, sahne görsel olarak spec'teki tasarıma (3/4 açılı, lamba ışıklı, gece atmosferi) uyuyor. Gözle karar verilecek ince ayarlar (ışık yoğunluğu, kamera açısı, nesne boyutları) varsa bu adımda yaz→görüntüle→ayarla döngüsüyle küçük düzeltmeler yapılabilir (ayrı, açıklayıcı commit'lerle).

- [ ] **Step 4: WebGL devre dışı senaryosu**

Playwright'ta `contextOptions` veya tarayıcı flag'iyle WebGL'i devre dışı bırakıp (`--disable-webgl` gibi) sayfayı aç.
Expected: `StaticHeroFallback` (düz SVG masa animasyonu) görünüyor, konsol hatası yok.

- [ ] **Step 5: Manuel tıklama testi**

Tarayıcıda sekansın bitmesini bekle (~4sn), "Öğrenci Modunu Keşfet" ve "Bu Modu Keşfet" butonlarına tıkla.
Expected: Onboarding akışı (mod seçimi/auth modalı) öncekiyle aynı şekilde açılıyor — 3D değişikliği bu akışı bozmamış.

- [ ] **Step 6: Son commit (varsa ince ayar düzeltmeleri)**

Eğer Step 3'te görsel ince ayar yapıldıysa:
```bash
git add frontend/src/components/hero3d/DeskScene.tsx
git commit -m "polish(frontend): 3D masa sahnesi isik/kamera ince ayari"
```
