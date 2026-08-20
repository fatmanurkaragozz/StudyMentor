# Açılış Sayfası Sinematik Mentor Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Açılış sayfasının hero'sunu, `docs/superpowers/specs/2026-08-14-landing-cinematic-mentor-hero-design.md`'de onaylanan tasarıma göre, tek bir react-three-fiber `<Canvas>` + `@react-three/drei` `ScrollControls(pages=3)` ile scroll'a bağlı, 3 bölümlü (mentor+yazı / masa sahnesi / nesne ayrışması+mod okları) sinematik bir deneyime çevirmek; WebGL yoksa veya `prefers-reduced-motion` açıksa birleşik bir statik fallback ağacına düşecek şekilde.

**Architecture:** `frontend/src/components/hero3d/` altında yeni bir 3D+HTML-overlay katmanı (`HeroCanvas`/`DeskScene`/`AmbientBackdrop`/`lighting`/`MentorPortrait`/`ScrollHeroOverlay`/`RouteOverlay`/`WebGLFallback`). Tüm scroll-reaktif davranış `@react-three/drei`'nin `useScroll()`'undan gelen `scroll.offset`/`scroll.range()` ile sürülüyor — elle scroll-listener yazılmıyor. Mevcut `DeskHeroAnimation.tsx` sadeleştirilip statik fallback'in parçası olarak yeniden kullanılıyor; zaman-bazlı `useHeroIntroSequence.ts` tamamen kaldırılıyor, yerini scroll-bazlı orkestrasyon alıyor.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4, `@react-three/fiber` + `@react-three/drei` + `three` (bu planla eklenecek), `lucide-react`.

## Global Constraints

- Projede backend/frontend için otomatik test altyapısı **yok** (bkz. `CLAUDE.md` "Known gaps"). Bu plan, birim-test yerine bu kod tabanında zaten kullanılan doğrulama yöntemini kullanıyor: her task'ta `npm run build` (tip kontrolü) + `npm run lint`, görsel değişikliklerde `npm run dev` ile manuel kontrol, son task'ta Playwright ile uçtan uca doğrulama. Bu bilinçli bir sapma, proje pratiğine uyum içindir.
- `frontend/tsconfig.app.json` içinde `noUnusedLocals`/`noUnusedParameters` **açık** — her adımda yazılan kod, kullanılmayan import/değişken bırakmamalı (build bunu hata olarak işaretler).
- `verbatimModuleSyntax` açık — tip-only import'lar `import type { X } from ...` şeklinde ayrı yazılmalı.
- Tüm yeni React bileşenleri fonksiyonel component + `FC` tip deseniyle yazılıyor (mevcut kod tabanı konvansiyonu).
- Yeni bağımlılık **eklenmiyor** (react-three-fiber/drei/three dışında) — animasyon kütüphanesi (GSAP, framer-motion) kullanılmıyor.
- Tüm dosya yolları repo köküne göre; komutlar aksi belirtilmedikçe `frontend/` dizininde çalıştırılıyor.
- Kullanıcı arayüzü metinleri Türkçe.

---

### Task 1: Three.js / react-three-fiber bağımlılıklarını ekle

**Files:**
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` paketleri `node_modules` içinde kullanılabilir olur (Task 4'ten itibaren tüm task'lar buna bağımlı).

- [ ] **Step 1: `package.json`'a bağımlılıkları ekle**

`frontend/package.json`'daki `dependencies` ve `devDependencies` bloklarını şu hale getir:

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
Expected: Başarıyla geçer (henüz yeni kod eklenmedi, sadece bağımlılık kuruldu).

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "chore(frontend): react-three-fiber/drei/three bagimliliklarini ekle"
```

---

### Task 2: Mentor portre görselini üret

**Files:**
- Create: `frontend/src/assets/mentor/mentor-portrait.png`

**Interfaces:**
- Produces: `frontend/src/assets/mentor/mentor-portrait.png` — şeffaf arka planlı, tam boy karakter PNG'i. Task 10'da `MentorPortrait.tsx` bunu doğrudan import edecek (`import mentorPortraitUrl from '../../assets/mentor/mentor-portrait.png';`).

- [ ] **Step 1: Klasörü oluştur**

`frontend/src/assets/mentor/` klasörünü oluştur (henüz yok — mevcut `frontend/src/assets/` içinde sadece `hero.png`, `react.svg`, `vite.svg` var, alt klasör yok).

- [ ] **Step 2: `design` skill'iyle karakter portresini üret**

`Skill` aracıyla `design` skill'ini şu brief ile çağır:

> "Pixar/Disney tarzı stilize 3D-render bir kadın karakter portresi üret: omuzdan yukarı değil, TAM BOY (baştan ayağa), ayakta, hafif 3/4 açıdan, sıcak/samimi bir gülümsemeyle. Kıyafet: koyu lacivert/indigo tonlarında rahat-şık bir triko kazak (StudyMentor'un marka paleti: lacivert/indigo/amber ile uyumlu renkte). Arka plan tamamen şeffaf olmalı (PNG, alfa kanallı) — sahne, zemin veya arka plan objesi OLMAMALI, sadece karakterin kendisi + kendi iç gölgelendirmesi/ışıklandırması. Çıktı en az 1200px yüksekliğinde olmalı. Bu görsel, StudyMentor uygulamasının açılış sayfasında bir 3D masa sahnesinin önüne yerleştirilecek rehber/mentor karakteri olarak kullanılacak."

Çıktıyı `frontend/src/assets/mentor/mentor-portrait.png` yoluna kaydet (design skill farklı bir varsayılan konuma kaydederse, dosyayı bu tam yola taşı/kopyala).

- [ ] **Step 3: Görseli doğrula**

Read tool ile `frontend/src/assets/mentor/mentor-portrait.png` dosyasını aç ve görsel olarak kontrol et:
Expected: Tam boy, ayakta duran bir karakter; arka plan şeffaf (checkerboard deseni görünüyor); en az ~1200px yükseklik.

Eğer görsel beklentiyi karşılamıyorsa (yarım vücut, opak arka plan, çok düşük çözünürlük), Step 2'yi farklı bir brief ince ayarıyla tekrarla.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/assets/mentor/mentor-portrait.png
git commit -m "feat(frontend): mentor karakter portresini ekle"
```

---

### Task 3: `useInViewOnce` hook'unu oluştur

**Files:**
- Create: `frontend/src/hooks/useInViewOnce.ts`

**Interfaces:**
- Produces: `export function useInViewOnce<T extends HTMLElement>(): [RefObject<T | null>, boolean]` — bir elementin scroll ile ekrana ilk kez girdiğinde `true`'ya dönen, sonra sabit kalan bir state döner. Task 11'de `LandingPage.tsx`'te mod-kartları bölümünün giriş animasyonu tetikleyicisi olarak kullanılacak (eski zaman-bazlı `stage === 'modes'` kontrolünün yerini alacak).

- [ ] **Step 1: Hook'u oluştur**

`frontend/src/hooks/useInViewOnce.ts`:

```ts
import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

export function useInViewOnce<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inView]);

  return [ref, inView];
}
```

- [ ] **Step 2: Build'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer (henüz hiçbir yerden kullanılmıyor ama tip hatası olmamalı).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useInViewOnce.ts
git commit -m "feat(frontend): useInViewOnce hook'unu ekle"
```

---

### Task 4: `hero3d/lighting.tsx` oluştur

**Files:**
- Create: `frontend/src/components/hero3d/lighting.tsx`

**Interfaces:**
- Produces: `export const HeroLights: FC` — 3D sahne için genel dolgu ışığı. Task 5'te `HeroCanvas.tsx` içinde kullanılacak.

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
Expected: Geçer.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/hero3d/lighting.tsx
git commit -m "feat(frontend): 3D hero sahnesi icin dolgu isigi bileseni ekle"
```

---

### Task 5: Minimal `HeroCanvas.tsx` oluştur ve `LandingPage.tsx`'i yeni yapıya bağla

Bu task, en riskli teknik varsayımı (drei'nin `ScrollControls`'ünün, header ile mod-kartları bölümü arasına normal DOM akışında yerleştirildiğinde scroll'u doğru şekilde yakalayıp, 3 sayfası bittiğinde scroll'u doğal olarak sayfanın geri kalanına devrettiği) erkenden, basit bir içerikle doğrular. Sonraki task'lar (6-10) bu iskeletin İÇİNİ dolduracak, bu task'ın kurduğu Canvas/ScrollControls/LandingPage bağlantısını bir daha yeniden yapılandırmayacak.

**Files:**
- Create: `frontend/src/components/hero3d/HeroCanvas.tsx`
- Modify: `frontend/src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `HeroLights` (Task 4).
- Produces: `export default HeroCanvas: FC` — Task 6, 7, 10'da içeriği genişletilecek. `LandingPage.tsx`'ten `lazy(() => import('./hero3d/HeroCanvas'))` ile lazy-load edilir.

- [ ] **Step 1: `HeroCanvas.tsx`'i oluştur (minimal içerik)**

`frontend/src/components/hero3d/HeroCanvas.tsx`:

```tsx
import { Suspense } from 'react';
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { HeroLights } from './lighting';

const HeroCanvas: FC = () => (
  <Canvas camera={{ position: [0, 1.3, 4.8], fov: 42 }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
    <Suspense fallback={null}>
      <HeroLights />
      <ScrollControls pages={3} damping={0.25}>
        <Scroll>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
        </Scroll>
      </ScrollControls>
    </Suspense>
  </Canvas>
);

export default HeroCanvas;
```

- [ ] **Step 2: `LandingPage.tsx`'i yeni yapıya bağla**

`frontend/src/components/LandingPage.tsx`'in tamamını şu hale getir:

```tsx
import { lazy, Suspense, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { DeskHeroAnimation } from './DeskHeroAnimation';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
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

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

interface LandingPageProps {
  onEnterApp: () => void;
}

interface OnboardingState {
  open: boolean;
  step: 'MODE_LEVEL' | 'AUTH';
  authMode: 'LOGIN' | 'REGISTER';
  pendingProfile: PendingProfile | null;
  presetMode: 'STUDENT' | 'LIFELONG_LEARNER' | null;
}

const CLOSED_ONBOARDING: OnboardingState = {
  open: false,
  step: 'MODE_LEVEL',
  authMode: 'REGISTER',
  pendingProfile: null,
  presetMode: null,
};

export const LandingPage: FC<LandingPageProps> = ({ onEnterApp }) => {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const webglSupported = useMemo(() => hasWebGLSupport(), []);
  const showStatic = !webglSupported || reducedMotion;
  const legacyStage = useHeroIntroSequence();
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();

  const [onboarding, setOnboarding] = useState<OnboardingState>(CLOSED_ONBOARDING);

  const openLogin = () => {
    setOnboarding({ open: true, step: 'AUTH', authMode: 'LOGIN', pendingProfile: null, presetMode: null });
  };

  const openRegister = () => {
    setOnboarding({ open: true, step: 'MODE_LEVEL', authMode: 'REGISTER', pendingProfile: null, presetMode: null });
  };

  const closeOnboarding = () => setOnboarding(CLOSED_ONBOARDING);

  const handleSelectModeAndEnter = (mode: 'STUDENT' | 'LIFELONG_LEARNER') => {
    if (mode === 'LIFELONG_LEARNER') {
      setOnboarding({
        open: true,
        step: 'AUTH',
        authMode: 'REGISTER',
        pendingProfile: { mode: 'LIFELONG_LEARNER', educationLevel: 'LIFELONG_LEARNER' },
        presetMode: null,
      });
    } else {
      setOnboarding({ open: true, step: 'MODE_LEVEL', authMode: 'REGISTER', pendingProfile: null, presetMode: 'STUDENT' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-indigo-600 selection:text-white transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-10 right-[10%] w-72 h-72 rounded-full bg-indigo-500/[0.06] dark:bg-indigo-500/[0.05] blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-24 left-[6%] w-80 h-80 rounded-full bg-violet-500/[0.06] dark:bg-violet-500/[0.05] blur-3xl pointer-events-none select-none" />

      <header className="relative z-30 h-20 px-6 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-md">
            <Compass className="w-6 h-6 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-slate-100">StudyMentor</h1>
            <span className="hidden sm:block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
              Akıllı Çalışma Planlayıcı
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-indigo-300 hover:scale-105 transition-all shadow-sm"
            title="Aydınlık / Karanlık Mod Değiştir"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-800" />}
          </button>

          <Button variant="ghost" size="sm" onClick={openLogin}>
            Giriş Yap
          </Button>

          <Button variant="primary" size="sm" onClick={openRegister}>
            Ücretsiz Kayıt Ol
          </Button>
        </div>
      </header>

      <div className="relative z-10 w-full" style={{ height: '100vh' }}>
        {showStatic ? (
          <DeskHeroAnimation stage={legacyStage} />
        ) : (
          <Suspense fallback={<DeskHeroAnimation stage={legacyStage} />}>
            <LazyHeroCanvas />
          </Suspense>
        )}
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            Çalışma rotanı planla,
            <br className="hidden sm:block" /> ilerlemeni takip et.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            StudyMentor; ders ve konu takibini, alışkanlıklarını ve yapay zeka destekli tekrar önerilerini tek yerde
            birleştirir.
          </p>
        </div>

        <div
          ref={modesRef}
          className={`w-full grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch transition-all duration-700 ease-out ${
            modesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <Card id="mode-student-card" accent="indigo" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-indigo-600/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div>
                <Badge tone="indigo" className="block mb-1">
                  Müfredat &amp; Sınav Odaklı
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Öğrenci Modu</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  LGS, YKS, Üniversite vize/final sınavlarına yönelik ders takibi, deneme netleri ve akıllı tekrar hatırlatmaları.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span>Ders ve Konu Bazlı Akıllı Tekrar Planı</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span>Deneme Sınavları &amp; Ders Net Analizi</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" strokeWidth={1.5} />
                  <span>Pomodoro Zamanlayıcısı ve Oturum Değerlendirme</span>
                </li>
              </ul>
            </div>

            <Button variant="primary" onClick={() => handleSelectModeAndEnter('STUDENT')} className="w-full">
              <span>Öğrenci Modunu Keşfet</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Card>

          <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md font-black text-xs">
              VS
            </div>

            <div className="hidden lg:flex flex-col items-center gap-3 text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                <span>Öğrenci</span>
              </div>
              <div className="h-12 w-0.5 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-400">
                <span>Gelişim</span>
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          <Card id="mode-growth-card" accent="violet" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl border border-violet-600/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6" strokeWidth={1.5} />
              </div>

              <div>
                <Badge tone="violet" className="block mb-1">
                  Beceri &amp; Proje Odaklı
                </Badge>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">İş Hayatım ve Gelişim</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Yazılım projeleri, dil öğrenimi, kişisel okumalar ve rutin alışkanlık takibi yapan yetişkinler ve çalışanlar için.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
                  <span>Proje &amp; Beceriler İlerleme Paneli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
                  <span>Alışkanlık Zinciri (Habit Tracker Matrix)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" strokeWidth={1.5} />
                  <span>AI Sentiment Skorlu Günlük &amp; Duygu Değerlendirmesi</span>
                </li>
              </ul>
            </div>

            <Button variant="secondary" onClick={() => handleSelectModeAndEnter('LIFELONG_LEARNER')} className="w-full">
              <span>Bu Modu Keşfet</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </main>

      <footer className="relative z-20 py-6 border-t border-slate-300/40 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 StudyMentor. Tüm hakları saklıdır.</p>
      </footer>

      {onboarding.open && (
        <OnboardingFlow
          initialStep={onboarding.step}
          initialAuthMode={onboarding.authMode}
          initialPendingProfile={onboarding.pendingProfile}
          initialPresetMode={onboarding.presetMode}
          onClose={closeOnboarding}
          onComplete={onEnterApp}
        />
      )}
    </div>
  );
};
```

Not: `legacyStage`/`DeskHeroAnimation stage={...}` kullanımı burada **geçici** — `DeskHeroAnimation.tsx` ve `useHeroIntroSequence.ts` henüz eski (stage tabanlı) hâlleriyle duruyor, statik/webgl-yok/reduced-motion durumunda görünür bir şey olsun diye olduğu gibi yeniden kullanılıyor. Task 11'de bu, gerçek `StaticHeroFallback`'e dönüşecek ve `useHeroIntroSequence` bağımlılığı tamamen kalkacak.

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 4: Scroll-handoff davranışını tarayıcıda doğrula (KRİTİK)**

Run: `cd frontend && npm run dev`, tarayıcıda açılış sayfasını aç.

Kontrol et:
1. Header'ın hemen altında, tam ekran yükseğinde mor bir küpün olduğu bir 3D alan görünüyor mu?
2. Bu alanın üzerinde fare tekerleğiyle aşağı kaydırınca, sayfa DEĞİL, bu alanın "içindeki" bir şey ilerliyormuş hissi var mı (henüz görsel bir değişiklik olmayacak çünkü sahne içeriği statik bir küp, ama scroll'un bu bölgede "yakalandığını" — yani aynı anda arkadaki mod-kartları bölümüne geçmediğini — doğrula, ör. tarayıcı scrollbar'ının pozisyonunu gözlemleyerek).
3. Yeterince aşağı kaydırdıktan sonra (3 ekran-yüksekliği kadar), scroll'un doğal olarak sayfanın geri kalanına (mod kartları, footer) geçtiğini doğrula.
4. Yukarı kaydırıp geri dönüşün de sorunsuz çalıştığını doğrula.

Expected: Yukarıdaki 4 madde de doğru çalışıyor. **Eğer scroll beklenmedik şekilde davranıyorsa (ör. sayfa üzerinden hiç geçmiyor, ya da 3D alan hiç scroll'u yakalamıyor), bir sonraki task'a geçmeden önce `ScrollControls` kullanımını (örn. `eps`/`infinite` prop'ları, sarmalayıcı `<div>`'in yüksekliği) araştırıp düzelt.**

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/hero3d/HeroCanvas.tsx frontend/src/components/LandingPage.tsx
git commit -m "feat(frontend): scroll-guduml 3D hero iskeletini olustur ve sayfaya bagla"
```

---

### Task 6: `hero3d/AmbientBackdrop.tsx` oluştur ve sahneye ekle

**Files:**
- Create: `frontend/src/components/hero3d/AmbientBackdrop.tsx`
- Modify: `frontend/src/components/hero3d/HeroCanvas.tsx`

**Interfaces:**
- Produces: `export const AmbientBackdrop: FC` — Bölüm 1'in karanlık/parçacıklı 3D arka planı (drei'nin `Sparkles` bileşeniyle).

- [ ] **Step 1: `AmbientBackdrop.tsx`'i oluştur**

`frontend/src/components/hero3d/AmbientBackdrop.tsx`:

```tsx
import type { FC } from 'react';
import { Sparkles } from '@react-three/drei';

export const AmbientBackdrop: FC = () => (
  <Sparkles count={40} scale={[6, 4, 4]} size={2.5} speed={0.15} color="#f59e0b" opacity={0.35} position={[0, 1, -1]} />
);
```

- [ ] **Step 2: `HeroCanvas.tsx`'te placeholder küpü `AmbientBackdrop` ile değiştir**

`frontend/src/components/hero3d/HeroCanvas.tsx`'te importlara ekle:

```tsx
import { AmbientBackdrop } from './AmbientBackdrop';
```

Şu anki:
```tsx
        <Scroll>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#6366f1" />
          </mesh>
        </Scroll>
```

Bunu şu hale getir:
```tsx
        <Scroll>
          <AmbientBackdrop />
        </Scroll>
```

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 4: Görsel kontrol**

Run: `cd frontend && npm run dev`, açılış sayfasında hero alanında artık küp yerine yumuşak, amber renkli parçacıkların (bokeh ışık efekti) göründüğünü doğrula.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/hero3d/AmbientBackdrop.tsx frontend/src/components/hero3d/HeroCanvas.tsx
git commit -m "feat(frontend): Bolum1 icin parcacik/bokeh arka plani ekle"
```

---

### Task 7: `hero3d/DeskScene.tsx` oluştur (statik) ve sahneye ekle

**Files:**
- Create: `frontend/src/components/hero3d/DeskScene.tsx`
- Modify: `frontend/src/components/hero3d/HeroCanvas.tsx`

**Interfaces:**
- Produces: `export const DeskScene: FC` — masa, duvar, pencere, laptop, kitap yığını, kahve fincanı, saksı bitki, açık defter, el+kalem, kalemlik, yapışkan-not defteri ve masa lambasını içeren, tam-genişlik panoramik 3D sahne. Henüz statik (lamba kapalı, el gizli, nesneler sabit) — Task 8-9'da scroll-reaktiflik eklenecek.

- [ ] **Step 1: `DeskScene.tsx`'i oluştur**

`frontend/src/components/hero3d/DeskScene.tsx`:

```tsx
import type { FC } from 'react';
import { DoubleSide } from 'three';

export const DeskScene: FC = () => (
  <group position={[0, -0.3, 0]}>
    {/* Arka duvar */}
    <mesh position={[0, 1.6, -1.3]}>
      <planeGeometry args={[7, 3.2]} />
      <meshStandardMaterial color="#0b0f19" roughness={0.95} />
    </mesh>

    {/* Pencere - loş ışık lekesi */}
    <mesh position={[1.7, 2.1, -1.28]}>
      <planeGeometry args={[1.2, 1.3]} />
      <meshStandardMaterial color="#1e2947" emissive="#312e81" emissiveIntensity={0.4} />
    </mesh>

    {/* Masa yüzeyi - tam genişlik */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[6.4, 0.2, 2.4]} />
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

    {/* El + kalem - henüz gizli, Task 8'de scroll ile beliriyor */}
    <group position={[0.75, 0.2, 0.55]} rotation={[0, -0.3, 0]} scale={0}>
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

    {/* Kalemlik - sağ uç, genişletilmiş kompozisyonu dolduruyor */}
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

    {/* Masa lambası - ışığı henüz kapalı, Task 8'de scroll ile açılıyor */}
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
      <pointLight position={[0.14, 0.22, 0]} color="#f59e0b" intensity={0} distance={3.5} decay={2} />
    </group>
  </group>
);
```

- [ ] **Step 2: `HeroCanvas.tsx`'e ekle**

`frontend/src/components/hero3d/HeroCanvas.tsx`'te importlara ekle:

```tsx
import { DeskScene } from './DeskScene';
```

Şu anki:
```tsx
        <Scroll>
          <AmbientBackdrop />
        </Scroll>
```

Bunu şu hale getir:
```tsx
        <Scroll>
          <AmbientBackdrop />
          <DeskScene />
        </Scroll>
```

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer. `capsuleGeometry`/`coneGeometry`/`DoubleSide` tip hatası vermemeli.

- [ ] **Step 4: Görsel kontrol**

Run: `cd frontend && npm run dev`, hero alanında masa+laptop+kitaplar+fincan+saksı+defter+kalemlik+not-defteri'nin (lamba ışığı kapalı, el görünmez halde) göründüğünü doğrula.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/hero3d/DeskScene.tsx frontend/src/components/hero3d/HeroCanvas.tsx
git commit -m "feat(frontend): tam genislik 3D masa sahnesini olustur (statik)"
```

---

### Task 8: `DeskScene`'e Bölüm 1→2 scroll-reaktifliği ekle (kamera, lamba, el)

**Files:**
- Modify: `frontend/src/components/hero3d/DeskScene.tsx`

**Interfaces:**
- Consumes: `useScroll()` (`@react-three/drei`), `useFrame`/`useThree` (`@react-three/fiber`).
- Produces: `DeskScene` artık scroll offset'ine göre kamera pozisyonunu, lamba ışığını ve el görünürlüğünü sürüyor.

- [ ] **Step 1: `DeskScene.tsx`'in tamamını scroll-reaktif hale getir**

`frontend/src/components/hero3d/DeskScene.tsx` dosyasının tamamını şu hale getir (Task 7'deki statik geometri korunuyor, en üste kamera/lamba/el mantığı ekleniyor):

```tsx
import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { DoubleSide, MathUtils, type Group, type PointLight } from 'three';

const CAMERA_KEYFRAMES: Array<{ t: number; pos: [number, number, number] }> = [
  { t: 0, pos: [0, 1.3, 4.8] },
  { t: 1 / 3, pos: [-2.4, 2.4, 3.2] },
  { t: 2 / 3, pos: [2.4, 2.2, 2.8] },
  { t: 1, pos: [0.3, 3.1, 4.4] },
];

function cameraPositionAt(offset: number): [number, number, number] {
  const clamped = MathUtils.clamp(offset, 0, 1);
  let from = CAMERA_KEYFRAMES[0];
  let to = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    if (clamped >= CAMERA_KEYFRAMES[i].t && clamped <= CAMERA_KEYFRAMES[i + 1].t) {
      from = CAMERA_KEYFRAMES[i];
      to = CAMERA_KEYFRAMES[i + 1];
      break;
    }
  }
  const span = to.t - from.t || 1;
  const localT = (clamped - from.t) / span;
  return [
    MathUtils.lerp(from.pos[0], to.pos[0], localT),
    MathUtils.lerp(from.pos[1], to.pos[1], localT),
    MathUtils.lerp(from.pos[2], to.pos[2], localT),
  ];
}

export const DeskScene: FC = () => {
  const scroll = useScroll();
  const { camera } = useThree();
  const lampLightRef = useRef<PointLight>(null);
  const handGroupRef = useRef<Group>(null);

  useFrame((_state, delta) => {
    const [x, y, z] = cameraPositionAt(scroll.offset);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0.2, 0);

    if (lampLightRef.current) {
      const lampProgress = scroll.range(0.2, 0.3);
      lampLightRef.current.intensity = lampProgress * 2.2;
    }

    if (handGroupRef.current) {
      const target = scroll.offset > 0.38 ? 1 : 0;
      const current = handGroupRef.current.scale.x;
      const next = current + (target - current) * Math.min(delta * 6, 1);
      handGroupRef.current.scale.setScalar(next);
    }
  });

  return (
    <group position={[0, -0.3, 0]}>
      {/* Arka duvar */}
      <mesh position={[0, 1.6, -1.3]}>
        <planeGeometry args={[7, 3.2]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.95} />
      </mesh>

      {/* Pencere - loş ışık lekesi */}
      <mesh position={[1.7, 2.1, -1.28]}>
        <planeGeometry args={[1.2, 1.3]} />
        <meshStandardMaterial color="#1e2947" emissive="#312e81" emissiveIntensity={0.4} />
      </mesh>

      {/* Masa yüzeyi - tam genişlik */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6.4, 0.2, 2.4]} />
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

      {/* El + kalem - 'hand' esiginde buyuyerek beliriyor */}
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

      {/* Masa lambası */}
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
        <pointLight ref={lampLightRef} position={[0.14, 0.22, 0]} color="#f59e0b" intensity={0} distance={3.5} decay={2} />
      </group>
    </group>
  );
};
```

- [ ] **Step 2: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 3: Görsel kontrol**

Run: `cd frontend && npm run dev`, hero alanında yavaşça aşağı kaydır:
1. Başlangıçta (offset≈0) lamba kapalı, el görünmüyor.
2. offset≈0.2-0.5 arası kaydırırken lamba ışığının yavaş yavaş yandığını gözlemle.
3. offset≈0.38'i geçince elin belirdiğini gözlemle.
4. Kamera açısının kaydırdıkça masaya doğru pan yaptığını gözlemle.

Expected: Hepsi yukarıdaki gibi çalışıyor, konsol hatası yok.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/hero3d/DeskScene.tsx
git commit -m "feat(frontend): masa sahnesine scroll-guduml kamera/lamba/el davranisi ekle"
```

---

### Task 9: `DeskScene`'e Bölüm 3 nesne-ayrışma reaktifliği ekle

**Files:**
- Modify: `frontend/src/components/hero3d/DeskScene.tsx`

**Interfaces:**
- Produces: Kitap yığını, kahve fincanı ve saksı bitki grupları artık Bölüm 3'ün scroll aralığında (`scroll.range(2/3, 1/3)`) masadan ayrılıp kayıyor.

- [ ] **Step 1: Kitap/fincan/saksı gruplarına ref ekle ve pozisyon sabitlerini tanımla**

`frontend/src/components/hero3d/DeskScene.tsx`'te, `CAMERA_KEYFRAMES`/`cameraPositionAt` tanımlarının hemen altına ekle:

```tsx
const BOOK_BASE: [number, number, number] = [-1.5, 0.15, 0.6];
const BOOK_END: [number, number, number] = [-3.4, -0.5, 2.4];
const CUP_BASE: [number, number, number] = [1.5, 0.16, 0.55];
const CUP_END: [number, number, number] = [3.2, -0.4, 2.3];
const PLANT_BASE: [number, number, number] = [1.6, 0.2, -0.5];
const PLANT_END: [number, number, number] = [3.6, -0.3, 1.6];

function lerpVec3(base: [number, number, number], end: [number, number, number], t: number): [number, number, number] {
  return [MathUtils.lerp(base[0], end[0], t), MathUtils.lerp(base[1], end[1], t), MathUtils.lerp(base[2], end[2], t)];
}
```

- [ ] **Step 2: `DeskScene` fonksiyonu içine yeni ref'ler ve useFrame mantığı ekle**

Şu anki:
```tsx
  const lampLightRef = useRef<PointLight>(null);
  const handGroupRef = useRef<Group>(null);
```

Bunu şu hale getir:
```tsx
  const lampLightRef = useRef<PointLight>(null);
  const handGroupRef = useRef<Group>(null);
  const bookGroupRef = useRef<Group>(null);
  const cupGroupRef = useRef<Group>(null);
  const plantGroupRef = useRef<Group>(null);
```

`useFrame` callback'inin sonuna (el mantığından sonra, kapanış `});`'den önce) ekle:

```tsx
    const flyProgress = scroll.range(2 / 3, 1 / 3);
    if (bookGroupRef.current) {
      const [bx, by, bz] = lerpVec3(BOOK_BASE, BOOK_END, flyProgress);
      bookGroupRef.current.position.set(bx, by, bz);
      bookGroupRef.current.rotation.y = 0.3 + flyProgress * 0.6;
    }
    if (cupGroupRef.current) {
      const [cx, cy, cz] = lerpVec3(CUP_BASE, CUP_END, flyProgress);
      cupGroupRef.current.position.set(cx, cy, cz);
    }
    if (plantGroupRef.current) {
      const [px, py, pz] = lerpVec3(PLANT_BASE, PLANT_END, flyProgress);
      plantGroupRef.current.position.set(px, py, pz);
    }
```

- [ ] **Step 3: Kitap/fincan/saksı JSX'lerine ref ve sabit-tabanlı başlangıç pozisyonu bağla**

Kitap yığını:
```tsx
      <group position={[-1.5, 0.15, 0.6]} rotation={[0, 0.3, 0]}>
```
şu hale getir:
```tsx
      <group ref={bookGroupRef} position={BOOK_BASE} rotation={[0, 0.3, 0]}>
```

Kahve fincanı:
```tsx
      <group position={[1.5, 0.16, 0.55]}>
```
şu hale getir:
```tsx
      <group ref={cupGroupRef} position={CUP_BASE}>
```

Saksı bitki:
```tsx
      <group position={[1.6, 0.2, -0.5]}>
```
şu hale getir:
```tsx
      <group ref={plantGroupRef} position={PLANT_BASE}>
```

- [ ] **Step 4: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 5: Görsel kontrol**

Run: `cd frontend && npm run dev`, hero alanının son üçte birine (offset≈0.66-1.0) kadar kaydır:
Expected: Kitap yığını sol-öne, kahve fincanı+saksı bitki sağ-öne doğru masadan ayrılarak kayıyor; kamera bu sırada geriye/yana açılıyor.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/hero3d/DeskScene.tsx
git commit -m "feat(frontend): Bolum3 nesne-ayrisma scroll davranisini ekle"
```

---

### Task 10: `hero3d/MentorPortrait.tsx` + `hero3d/ScrollHeroOverlay.tsx` oluştur ve sahneye ekle

**Files:**
- Create: `frontend/src/components/hero3d/MentorPortrait.tsx`
- Create: `frontend/src/components/hero3d/ScrollHeroOverlay.tsx`
- Modify: `frontend/src/components/hero3d/HeroCanvas.tsx`

**Interfaces:**
- Consumes: `frontend/src/assets/mentor/mentor-portrait.png` (Task 2).
- Produces: `export const MentorPortrait: FC<{ interactive?: boolean }>` (Task 11'de `WebGLFallback.tsx` içinde `interactive={false}` ile de kullanılacak); `export const ScrollHeroOverlay: FC`.

- [ ] **Step 1: `MentorPortrait.tsx`'i oluştur**

`frontend/src/components/hero3d/MentorPortrait.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import mentorPortraitUrl from '../../assets/mentor/mentor-portrait.png';

interface MentorPortraitProps {
  interactive?: boolean;
}

export const MentorPortrait: FC<MentorPortraitProps> = ({ interactive = true }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const handleMove = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `translate3d(${relX * -14}px, ${relY * -10}px, 0)`;
    };
    const handleLeave = () => {
      img.style.transform = 'translate3d(0, 0, 0)';
    };

    window.addEventListener('pointermove', handleMove);
    wrap.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      wrap.removeEventListener('pointerleave', handleLeave);
    };
  }, [interactive]);

  return (
    <div ref={wrapRef} className="relative w-56 sm:w-72 lg:w-80 aspect-[3/4] mx-auto lg:mx-0 shrink-0">
      <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl scale-90" aria-hidden="true" />
      <img
        ref={imgRef}
        src={mentorPortraitUrl}
        alt="StudyMentor rehberi"
        className="relative w-full h-full object-contain object-bottom drop-shadow-[0_20px_35px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out"
      />
      <div className="absolute top-[8%] right-[10%] w-3 h-3 rounded-full bg-amber-300/70 blur-[2px] animate-pulse" aria-hidden="true" />
      <div className="absolute top-[35%] right-[2%] w-2 h-2 rounded-full bg-indigo-300/70 blur-[1px] animate-pulse [animation-delay:0.4s]" aria-hidden="true" />
    </div>
  );
};
```

- [ ] **Step 2: `ScrollHeroOverlay.tsx`'i oluştur**

`frontend/src/components/hero3d/ScrollHeroOverlay.tsx`:

```tsx
import { useRef } from 'react';
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { MentorPortrait } from './MentorPortrait';

const WELCOME_TEXT = "StudyMentor'e Hoş Geldiniz";
const SUB_TEXT = 'Mentörünüzle Tanışın';

function typedSlice(text: string, progress: number): string {
  return text.slice(0, Math.round(text.length * Math.min(Math.max(progress, 0), 1)));
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export const ScrollHeroOverlay: FC = () => {
  const scroll = useScroll();
  const section1Ref = useRef<HTMLDivElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const studentArrowRef = useRef<HTMLDivElement>(null);
  const growthArrowRef = useRef<HTMLDivElement>(null);

  useFrame(() => {
    const titleProgress = scroll.range(0, 0.16);
    const subtitleProgress = scroll.range(0.16, 0.16);
    if (titleRef.current) titleRef.current.textContent = typedSlice(WELCOME_TEXT, titleProgress);
    if (subtitleRef.current) subtitleRef.current.textContent = typedSlice(SUB_TEXT, subtitleProgress);

    const section1Opacity = 1 - scroll.range(0.26, 0.07);
    if (section1Ref.current) section1Ref.current.style.opacity = `${section1Opacity}`;

    const arrowsProgress = scroll.range(0.86, 0.14);
    if (section3Ref.current) section3Ref.current.style.opacity = `${arrowsProgress}`;
    if (studentArrowRef.current) studentArrowRef.current.style.transform = `translateX(${(1 - arrowsProgress) * -24}px)`;
    if (growthArrowRef.current) growthArrowRef.current.style.transform = `translateX(${(1 - arrowsProgress) * 24}px)`;
  });

  return (
    <>
      <div
        ref={section1Ref}
        className="absolute inset-x-0 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 px-6 sm:px-16"
        style={{ top: 0, height: '100vh' }}
      >
        <MentorPortrait />
        <div className="text-center lg:text-left max-w-md">
          <h2
            ref={titleRef}
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-100 leading-tight min-h-[1.2em]"
          />
          <p ref={subtitleRef} className="mt-3 text-base sm:text-lg text-indigo-200 min-h-[1.5em]" />
        </div>
      </div>

      <div
        ref={section3Ref}
        className="absolute inset-x-0 flex items-center justify-between px-8 sm:px-20"
        style={{ top: '200vh', height: '100vh' }}
      >
        <div ref={studentArrowRef} className="flex flex-col items-center gap-2 text-indigo-200">
          <ArrowLeft className="w-8 h-8" strokeWidth={1.5} />
          <button
            type="button"
            onClick={() => scrollToId('mode-student-card')}
            className="text-sm font-semibold hover:text-white transition-colors pointer-events-auto"
          >
            Öğrenci Modu
          </button>
        </div>
        <div ref={growthArrowRef} className="flex flex-col items-center gap-2 text-violet-200">
          <ArrowRight className="w-8 h-8" strokeWidth={1.5} />
          <button
            type="button"
            onClick={() => scrollToId('mode-growth-card')}
            className="text-sm font-semibold hover:text-white transition-colors pointer-events-auto"
          >
            Gelişim Modu
          </button>
        </div>
      </div>
    </>
  );
};
```

- [ ] **Step 3: `HeroCanvas.tsx`'e `Scroll html` katmanını ekle**

`frontend/src/components/hero3d/HeroCanvas.tsx`'te importlara ekle (mevcut `ScrollControls, Scroll` import satırı değişmiyor, sadece yeni bileşen import'u ekleniyor):

```tsx
import { ScrollHeroOverlay } from './ScrollHeroOverlay';
```

Şu anki:
```tsx
      <ScrollControls pages={3} damping={0.25}>
        <Scroll>
          <AmbientBackdrop />
          <DeskScene />
        </Scroll>
      </ScrollControls>
```

Bunu şu hale getir:
```tsx
      <ScrollControls pages={3} damping={0.25}>
        <Scroll>
          <AmbientBackdrop />
          <DeskScene />
        </Scroll>
        <Scroll html>
          <ScrollHeroOverlay />
        </Scroll>
      </ScrollControls>
```

- [ ] **Step 4: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 5: Görsel kontrol**

Run: `cd frontend && npm run dev`:
1. Bölüm 1'de solda mentor portresi, sağda harf-harf yazılan "StudyMentor'e Hoş Geldiniz" / "Mentörünüzle Tanışın" metinlerini gözlemle; fareyi portrenin üzerinde hareket ettirince hafif bir parallax kayması olduğunu doğrula.
2. Bölüm 2'ye geçişte metin/portrenin soluklaştığını doğrula.
3. Bölüm 3'e ulaşınca "Öğrenci Modu"/"Gelişim Modu" ok+etiketlerinin belirdiğini, tıklanınca sayfayı ilgili karta kaydırdığını doğrula.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/hero3d/MentorPortrait.tsx frontend/src/components/hero3d/ScrollHeroOverlay.tsx frontend/src/components/hero3d/HeroCanvas.tsx
git commit -m "feat(frontend): mentor portresi ve harf-harf yazi/ok overlay'ini ekle"
```

---

### Task 11: Statik fallback ağacını tamamla ve `LandingPage.tsx`'i finalize et

**Files:**
- Create: `frontend/src/components/hero3d/RouteOverlay.tsx`
- Create: `frontend/src/components/hero3d/WebGLFallback.tsx`
- Modify: `frontend/src/components/DeskHeroAnimation.tsx`
- Modify: `frontend/src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `MentorPortrait` (Task 10), `DeskHeroAnimation` (bu task'ta sadeleşiyor).
- Produces: `export const RouteOverlay: FC`; `export function hasWebGLSupport(): boolean`, `export const StaticHeroFallback: FC` — Task 5'teki geçici `DeskHeroAnimation stage={legacyStage}` kullanımının yerini alacak.

- [ ] **Step 1: `RouteOverlay.tsx`'i oluştur**

`frontend/src/components/hero3d/RouteOverlay.tsx`:

```tsx
import type { FC } from 'react';

export const RouteOverlay: FC = () => (
  <svg viewBox="0 0 600 420" className="w-full h-full" aria-hidden="true">
    <path
      d="M336 300 C332 335 312 368 296 392"
      className="fill-none stroke-indigo-400"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M296 392 C258 402 200 408 150 410"
      className="fill-none stroke-indigo-400"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M296 392 C336 402 396 408 450 410"
      className="fill-none stroke-violet-400"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <circle cx="150" cy="410" r="5" className="fill-indigo-500" />
    <circle cx="450" cy="410" r="5" className="fill-violet-500" />
  </svg>
);
```

- [ ] **Step 2: `DeskHeroAnimation.tsx`'i sadeleştir (stage/STAGE_INDEX mantığını kaldır)**

`frontend/src/components/DeskHeroAnimation.tsx` dosyasının tamamını şu hale getir:

```tsx
import type { FC } from 'react';

export const DeskHeroAnimation: FC = () => (
  <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto">
    <svg viewBox="0 0 600 420" className="w-full h-auto">
      {/* Masa yüzeyi */}
      <rect x="0" y="0" width="600" height="420" rx="28" className="fill-slate-100 dark:fill-slate-900" />

      {/* Laptop */}
      <g>
        <rect x="40" y="30" width="180" height="10" rx="4" className="fill-slate-400 dark:fill-slate-600" />
        <rect x="40" y="40" width="180" height="120" rx="12" className="fill-slate-300 dark:fill-slate-700" />
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 7 }).map((_, col) => (
            <rect
              key={`key-${row}-${col}`}
              x={54 + col * 22}
              y={58 + row * 20}
              width={16}
              height={12}
              rx={3}
              className="fill-slate-100 dark:fill-slate-800"
            />
          ))
        )}
        <rect x="95" y="142" width="70" height="12" rx="6" className="fill-slate-400 dark:fill-slate-600" />
        <circle cx="130" cy="35" r="5" className="fill-none stroke-indigo-500" strokeWidth="1.5" />
        <path d="M130 32 L130 38 M127 35 L133 35" className="stroke-indigo-500" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Kitap yığını */}
      <g>
        <rect x="55" y="255" width="110" height="70" rx="8" transform="rotate(-5 110 290)" className="fill-indigo-200 dark:fill-indigo-900/50" />
        <rect x="62" y="245" width="100" height="65" rx="8" transform="rotate(4 112 277)" className="fill-violet-200 dark:fill-violet-900/50" />
        <rect x="68" y="238" width="88" height="55" rx="8" transform="rotate(-2 112 265)" className="fill-white dark:fill-slate-700" />
        <rect x="72" y="238" width="6" height="55" transform="rotate(-2 112 265)" className="fill-indigo-500" />
      </g>

      {/* Kahve fincanı */}
      <g>
        <circle cx="500" cy="300" r="30" className="fill-slate-300 dark:fill-slate-700" />
        <circle cx="500" cy="300" r="21" className="fill-slate-400 dark:fill-slate-800" />
        <path d="M528 292 Q548 300 528 312" className="fill-none stroke-slate-300 dark:stroke-slate-700" strokeWidth="7" strokeLinecap="round" />
      </g>

      {/* Saksı bitki */}
      <g>
        <path d="M505 70 L535 70 L528 92 L512 92 Z" className="fill-slate-300 dark:fill-slate-700" />
        <path d="M520 70 C505 45 500 30 512 15" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
        <path d="M520 70 C530 40 542 28 552 22" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
        <path d="M520 70 C518 38 522 20 520 8" className="fill-none stroke-emerald-500" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* Açık defter */}
      <g>
        <rect
          x="205"
          y="170"
          width="230"
          height="175"
          rx="12"
          className="fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="1.5"
        />
        <line x1="320" y1="180" x2="320" y2="335" className="stroke-slate-200 dark:stroke-slate-600" strokeWidth="2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`rule-l-${i}`}
            x1="240"
            y1={215 + i * 24}
            x2="308"
            y2={215 + i * 24}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="2"
          />
        ))}
        {Array.from({ length: 5 }).map((_, i) => (
          <line
            key={`rule-r-${i}`}
            x1="332"
            y1={195 + i * 24}
            x2="418"
            y2={195 + i * 24}
            className="stroke-slate-200 dark:stroke-slate-700"
            strokeWidth="2"
          />
        ))}
        <rect x="216" y="192" width="14" height="14" rx="3" className="fill-indigo-600" />
        <path
          d="M219 199 L224 204 L231 195"
          className="fill-none stroke-white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="216" y="216" width="14" height="14" rx="3" className="fill-none stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" />
      </g>

      {/* El + kalem - günlük planı yazıyor */}
      <g>
        <path
          d="M420 300 C400 300 388 320 392 345 C395 365 415 378 440 375 C462 373 478 358 476 338 C474 322 460 308 442 302 Z"
          className="fill-slate-300 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="1.5"
        />
        <path d="M405 302 C398 288 400 272 410 262" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="14" strokeLinecap="round" />
        <path d="M420 296 C416 280 420 264 432 254" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="13" strokeLinecap="round" />
        <path d="M438 296 C438 278 445 262 458 254" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="13" strokeLinecap="round" />
        <path d="M455 300 C460 284 470 272 482 268" className="fill-none stroke-slate-300 dark:stroke-slate-600" strokeWidth="12" strokeLinecap="round" />
        <rect x="330" y="278" width="14" height="90" rx="6" transform="rotate(38 337 323)" className="fill-indigo-600 dark:fill-indigo-400" />
        <rect x="330" y="278" width="14" height="16" rx="4" transform="rotate(38 337 323)" className="fill-slate-800 dark:fill-slate-200" />
      </g>

      {/* Masa lambası ışığı - statik ağaçta sabit yanık, sıcak atmosferi korumak için */}
      <circle cx="500" cy="120" r="90" className="fill-amber-400/10 dark:fill-amber-400/[0.08]" />
    </svg>
  </div>
);
```

- [ ] **Step 3: `WebGLFallback.tsx`'i oluştur**

`frontend/src/components/hero3d/WebGLFallback.tsx`:

```tsx
import type { FC } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { DeskHeroAnimation } from '../DeskHeroAnimation';
import { MentorPortrait } from './MentorPortrait';
import { RouteOverlay } from './RouteOverlay';

export function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export const StaticHeroFallback: FC = () => (
  <div className="py-10 sm:py-14 space-y-10">
    <div className="flex flex-col lg:flex-row items-center justify-center gap-8 px-6">
      <MentorPortrait interactive={false} />
      <div className="text-center lg:text-left max-w-md">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          StudyMentor&apos;e Hoş Geldiniz
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-300">Mentörünüzle Tanışın</p>
      </div>
    </div>

    <DeskHeroAnimation />

    <div className="relative max-w-2xl mx-auto h-24">
      <RouteOverlay />
      <div className="absolute inset-0 flex items-end justify-between px-8 pb-1">
        <button
          type="button"
          onClick={() => scrollToId('mode-student-card')}
          className="flex flex-col items-center gap-1 text-indigo-600 dark:text-indigo-400"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-xs font-semibold">Öğrenci Modu</span>
        </button>
        <button
          type="button"
          onClick={() => scrollToId('mode-growth-card')}
          className="flex flex-col items-center gap-1 text-violet-600 dark:text-violet-400"
        >
          <ArrowRight className="w-6 h-6" strokeWidth={1.5} />
          <span className="text-xs font-semibold">Gelişim Modu</span>
        </button>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 4: `LandingPage.tsx`'i finalize et**

`frontend/src/components/LandingPage.tsx`'te importları şu hale getir (Task 5'teki geçici `DeskHeroAnimation`/`useHeroIntroSequence` importları kaldırılıyor, yerine `WebGLFallback`'ten gelenler ekleniyor):

Şu anki:
```tsx
import { lazy, Suspense, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { DeskHeroAnimation } from './DeskHeroAnimation';
import { useHeroIntroSequence } from '../hooks/useHeroIntroSequence';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
```

Bunu şu hale getir:
```tsx
import { lazy, Suspense, useMemo, useState } from 'react';
import type { FC } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import type { PendingProfile } from './onboarding/types';
import { hasWebGLSupport, StaticHeroFallback } from './hero3d/WebGLFallback';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
```

Şu anki (yerel `hasWebGLSupport` fonksiyonu artık `WebGLFallback.tsx`'ten geldiği için siliniyor):
```tsx
const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));

function hasWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
```

Bunu şu hale getir:
```tsx
const LazyHeroCanvas = lazy(() => import('./hero3d/HeroCanvas'));
```

Şu anki (`legacyStage` artık gerekmiyor):
```tsx
  const reducedMotion = useReducedMotion();
  const webglSupported = useMemo(() => hasWebGLSupport(), []);
  const showStatic = !webglSupported || reducedMotion;
  const legacyStage = useHeroIntroSequence();
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();
```

Bunu şu hale getir:
```tsx
  const reducedMotion = useReducedMotion();
  const webglSupported = useMemo(() => hasWebGLSupport(), []);
  const showStatic = !webglSupported || reducedMotion;
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();
```

Şu anki:
```tsx
      <div className="relative z-10 w-full" style={{ height: '100vh' }}>
        {showStatic ? (
          <DeskHeroAnimation stage={legacyStage} />
        ) : (
          <Suspense fallback={<DeskHeroAnimation stage={legacyStage} />}>
            <LazyHeroCanvas />
          </Suspense>
        )}
      </div>
```

Bunu şu hale getir:
```tsx
      <div className="relative z-10 w-full" style={{ height: '100vh' }}>
        {showStatic ? (
          <StaticHeroFallback />
        ) : (
          <Suspense fallback={<StaticHeroFallback />}>
            <LazyHeroCanvas />
          </Suspense>
        )}
      </div>
```

- [ ] **Step 5: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer. `DeskHeroAnimation.tsx` ve `useHeroIntroSequence.ts`'in artık `LandingPage.tsx`'te kullanılmadığını, ama `DeskHeroAnimation`'ın `WebGLFallback.tsx` üzerinden dolaylı kullanıldığını doğrula.

- [ ] **Step 6: Görsel kontrol — statik fallback**

Run: `cd frontend && npm run dev`, tarayıcı DevTools > Rendering panelinden "Emulate CSS prefers-reduced-motion: reduce" aç, sayfayı yenile.
Expected: Hero alanında artık 3D Canvas değil, statik ağaç görünüyor — sabit mentor portresi (parallax hareketi yok) + düz yazı + düz SVG masa animasyonu (lamba ışığı sabit) + rota çizgisi + Öğrenci/Gelişim etiketli oklar. "Öğrenci Modu" etiketine tıklayınca sayfa ilgili karta kayıyor.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/hero3d/RouteOverlay.tsx frontend/src/components/hero3d/WebGLFallback.tsx frontend/src/components/DeskHeroAnimation.tsx frontend/src/components/LandingPage.tsx
git commit -m "feat(frontend): statik fallback agacini tamamla ve LandingPage'i finalize et"
```

---

### Task 12: `useHeroIntroSequence.ts`'i sil

**Files:**
- Delete: `frontend/src/hooks/useHeroIntroSequence.ts`

**Interfaces:**
- Consumes: (yok — bu task, artık hiçbir tüketicisi kalmayan bir dosyayı temizliyor.)

- [ ] **Step 1: Hiçbir yerde kullanılmadığını doğrula**

`frontend/src/` içinde `useHeroIntroSequence` ve `STAGE_INDEX` metinlerini ara (Grep tool ile, pattern: `useHeroIntroSequence|STAGE_INDEX`, path: `frontend/src`).
Expected: Sadece `frontend/src/hooks/useHeroIntroSequence.ts`'in kendi tanım satırlarında eşleşme çıkar, başka hiçbir dosyada eşleşme yok (Task 11'de `DeskHeroAnimation.tsx` ve `LandingPage.tsx` bu hook'tan bağımsız hale getirildi).

- [ ] **Step 2: Dosyayı sil**

`frontend/src/hooks/useHeroIntroSequence.ts` dosyasını sil.

- [ ] **Step 3: Build ve lint'in geçtiğini doğrula**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz geçer.

- [ ] **Step 4: Commit**

```bash
git add -A frontend/src/hooks/useHeroIntroSequence.ts
git commit -m "chore(frontend): artik kullanilmayan useHeroIntroSequence hook'unu kaldir"
```

---

### Task 13: Uçtan uca doğrulama

**Files:** (yok — sadece doğrulama)

- [ ] **Step 1: Build + lint son kontrol**

Run: `cd frontend && npm run build && npm run lint`
Expected: İkisi de temiz.

- [ ] **Step 2: Bundle'da 3D chunk'ının ayrı olduğunu doğrula**

Run: `cd frontend && ls dist/assets/`
Expected: Ayrı, büyükçe bir `HeroCanvas-*.js` (veya benzeri isimli) chunk görünüyor — lazy-loading'in doğru çalıştığının paket-boyutu kanıtı.

- [ ] **Step 3: Playwright ile görsel doğrulama (açık/koyu/mobil/reduced-motion/webgl-yok)**

`npm run dev` ile dev server başlat, ardından şu senaryoları ekran görüntüsüyle doğrula:
- Açık mod, masaüstü (1280px): scroll offset'in 0/%33/%50/%66/100 noktalarında hero'nun beklenen görünümde olduğunu kontrol et.
- Koyu mod, masaüstü: aynı noktalar.
- Mobil (390px): hero'nun taşmadan doğru düzende (dikey istiflenmiş) göründüğünü kontrol et.
- `prefers-reduced-motion: reduce`: statik ağacın anında tam-görünür halde yüklendiğini, konsolda hata olmadığını doğrula.
- WebGL devre dışı bırakılmış bir tarayıcı bağlamında (`--disable-webgl` gibi bir flag ile) statik ağacın göründüğünü, konsol hatası olmadığını doğrula.

Expected: Hepsinde konsol hatası yok, sahne görsel olarak spec'teki tasarıma uyuyor. Gözle karar verilecek ince ayarlar (ışık yoğunluğu, kamera keyframe'leri, nesne uç-pozisyonları) varsa bu adımda küçük düzeltmeler yapılabilir (ayrı, açıklayıcı commit'lerle, `DeskScene.tsx`/`ScrollHeroOverlay.tsx` üzerinde).

- [ ] **Step 4: Manuel tıklama testi**

Tarayıcıda hero'yu sonuna kadar kaydır, "Öğrenci Modu"/"Gelişim Modu" ok-etiketlerine tıkla.
Expected: Sayfa ilgili karta yumuşak kayıyor. Kartlardaki "Öğrenci Modunu Keşfet" / "Bu Modu Keşfet" butonlarına tıklayınca onboarding akışı öncekiyle aynı şekilde açılıyor.

- [ ] **Step 5: Son commit (varsa ince ayar düzeltmeleri)**

Eğer Step 3'te görsel ince ayar yapıldıysa:
```bash
git add frontend/src/components/hero3d/DeskScene.tsx frontend/src/components/hero3d/ScrollHeroOverlay.tsx
git commit -m "polish(frontend): sinematik hero isik/kamera/zamanlama ince ayari"
```
