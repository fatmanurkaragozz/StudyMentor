# Açılış Sayfası — Footer & Yıldız Haritası Genişletme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Açılış sayfasının (`LandingPage.tsx`) alt bölümünü profesyonelleştirmek — yıldız haritasını (`StarMap`) mod kartlarının arkasından geri bildirim bölümü ve footer'a doğru genişletip solduran, footer'ı gerçek GitHub/LinkedIn linkleriyle bir "alt bar"a dönüştüren ve dark modda görünmeyen kök arka plan gradyanını düzelten görsel bir refactor.

**Architecture:** `StarMap.tsx`'e geriye-uyumlu (opt-in, varsayılan kapalı) `extended`/`className` prop'ları eklenir ki `AIInsights.tsx`'teki mevcut kullanım hiç etkilenmesin. `LandingPage.tsx`'te `<main>`+`<section>`+`<footer>` yeni bir `relative` div'de sarmalanır ki tek bir `StarMap` bu üç bölümün toplam yüksekliğine yayılabilsin; soluma bir CSS `mask-image` gradyanıyla sağlanır.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 (`frontend/`), mevcut `lucide-react` ikon seti, mevcut `useInViewOnce` hook'u. Yeni bağımlılık yok.

## Global Constraints

- `AIInsights.tsx`'teki `<StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />` kullanımı davranışsal olarak birebir aynı kalmalı (yeni prop'lar varsayılan değerlerle no-op olmalı).
- Footer'a sadece gerçek linkler eklenecek: GitHub `https://github.com/fatmanurkaragozz`, LinkedIn `https://www.linkedin.com/in/fatma-nur-karag%C3%B6z-78678a294/`. Sahte/placeholder link veya sayfa-içi rota linki yok (uygulamanın router'ı yok).
- Footer kendi ayrı/net arka plan rengi almayacak — yıldız dokusunun üstünde, sayfanın geri kalanıyla aynı saydam zemini paylaşacak.
- Spec: `docs/superpowers/specs/2026-08-25-landing-footer-starmap-extension-design.md`.
- **Commit'ler bu oturumda kullanıcının kendi kontrolünde** — her task'ın "Commit" adımı referans/dokümantasyon amaçlıdır, gerçek `git commit` komutu kullanıcı açıkça istemeden çalıştırılmayacaktır.

---

## Task 1: Dark mode kök arka plan gradyanını düzelt

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx:132`

**Interfaces:**
- Consumes: yok.
- Produces: yok (bağımsız, tek satırlık görsel değişiklik).

Şu an kök `<div>`'in dark mode gradyanı `dark:from-slate-950 dark:to-slate-950` — iki ucu birebir aynı renk olduğu için dark modda hiçbir gradyan görünmüyor (düz renk gibi davranıyor). Bunu ikinci bir tonla değiştirip sayfanın en altına doğru hafif bir ton farkı (geçiş hissi) oluşturuyoruz. Hero'nun kendi ayrı `h-hero-viewport` gradyanına (satır ~180) ve altındaki fade-overlay'e (satır ~246) dokunulmuyor.

- [ ] **Step 1: `className`'deki dark mode `to` rengini değiştir**

`frontend/src/components/LandingPage.tsx` içinde şu satırı bul:

```tsx
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-brand-pink-dark selection:text-white transition-colors duration-300 bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-950">
```

Şununla değiştir:

```tsx
    <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-brand-pink-dark selection:text-white transition-colors duration-300 bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-900">
```

(Bu string dosyada tek yerde geçiyor — satır 180 ve 246'daki benzer gradyanlar farklı çevre metne sahip, karışmaz.)

- [ ] **Step 2: Build ile doğrula**

Çalıştır: `cd frontend && npm run build`
Beklenen: Hatasız tamamlanır (bu saf bir Tailwind class-value değişikliği, tip hatası üretmez).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "fix: dark mode kok arka plan gradyanini gorunur hale getir"
```

---

## Task 2: `StarMap.tsx`'e geriye uyumlu `extended`/`className` prop'ları ekle

**Files:**
- Modify: `frontend/src/components/StarMap.tsx`

**Interfaces:**
- Consumes: yok.
- Produces: `StarMapProps` arayüzü — `{ lineColor?: string; starColor?: string; extended?: boolean; className?: string }`. Task 3 bu tam imzayı (özellikle `extended` ve `className` prop adlarını) tüketecek.

`StarMap`, `LandingPage.tsx` dışında `AIInsights.tsx`'te de (`<StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />`) kullanılıyor. Bu yüzden mevcut `STAR_POINTS`/`viewBox`'ı yerinde büyütmek yerine, `extended` prop'u `false`/tanımsızken bileşenin bugünküyle birebir aynı davranmasını garanti ediyoruz.

- [ ] **Step 1: Dosyanın tamamını yeni haliyle yaz**

`frontend/src/components/StarMap.tsx`'in tüm içeriğini şununla değiştir:

```tsx
import { useMemo } from 'react';
import type { FC } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

// 1000x600'lük soyut bir koordinat uzayında sabit yıldız konumları (viewBox ile gerçek
// kapsayıcı boyutuna esnek şekilde ölçeklenir). Orta-üst bölge (x:250-750, y:60-240) bilinçli
// olarak boş bırakıldı - o bölge genelde başlık metninin oturduğu yer, ve CONNECTION_DISTANCE
// (150) bu boşluğu aşacak kadar uzun bir çizgi oluşturamayacağından metnin üzerinden çizgi
// geçmesi engellenmiş oluyor.
const STAR_POINTS: [number, number][] = [
  [40, 60], [150, 140], [60, 240], [180, 320], [40, 420], [160, 500], [70, 580],
  [950, 80], [820, 150], [900, 260], [800, 340], [940, 420], [830, 500], [960, 580],
  [280, 300], [420, 260], [560, 320], [700, 280], [350, 400], [500, 440], [650, 400],
  [420, 520], [580, 560], [300, 480], [750, 500], [480, 580], [620, 260],
  [100, 350], [900, 180], [350, 580],
];

// `extended` modunda mevcut yıldızlara eklenen ikinci bölge (y:600-1150) - açılış
// sayfasında yıldız haritasının geri bildirim bölümü ve footer'ın arkasına doğru
// genişlemesi için kullanılır. Aynı ilke: orta-üst bant (x:250-750, y:600-820) geri
// bildirim başlığının oturduğu yer olduğu için boş; alt uca inildikçe yoğunluk azalır
// (kullanım yerindeki mask-image soluması ile birleşince "sona doğru sakinleşen" his
// oluşturuyor).
const EXTENDED_STAR_POINTS: [number, number][] = [
  [60, 650], [180, 720], [70, 800], [920, 660], [830, 730], [940, 810],
  [280, 880], [450, 850], [620, 900], [780, 860], [150, 920],
  [500, 980], [850, 950], [120, 1020], [700, 1040],
  [350, 1080], [600, 1100],
];

const CONNECTION_DISTANCE = 150;

interface StarMapProps {
  lineColor?: string;
  starColor?: string;
  extended?: boolean;
  className?: string;
}

export const StarMap: FC<StarMapProps> = ({
  lineColor = '#94a3b8',
  starColor = '#e2e8f0',
  extended = false,
  className = '',
}) => {
  const reducedMotion = useReducedMotion();

  const points = useMemo(
    () => (extended ? [...STAR_POINTS, ...EXTENDED_STAR_POINTS] : STAR_POINTS),
    [extended]
  );

  const connections = useMemo(() => {
    const lines: [number, number, number, number][] = [];
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[j];
        if (Math.hypot(x1 - x2, y1 - y2) < CONNECTION_DISTANCE) {
          lines.push([x1, y1, x2, y2]);
        }
      }
    }
    return lines;
  }, [points]);

  return (
    <svg
      className={`absolute inset-0 w-full h-full opacity-[0.65] pointer-events-none select-none ${className}`}
      viewBox={extended ? '0 0 1000 1150' : '0 0 1000 600'}
      preserveAspectRatio="xMidYMid slice"
    >
      {connections.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lineColor} strokeWidth="1" opacity="0.35" />
      ))}
      {points.map(([x, y], i) => (
        <g
          key={i}
          className={reducedMotion ? '' : 'animate-star-twinkle'}
          style={reducedMotion ? undefined : { animationDelay: `${(i * 0.37) % 4}s`, animationDuration: `${3 + (i % 5) * 0.4}s` }}
        >
          <circle cx={x} cy={y} r="9" fill={starColor} opacity="0.35" style={{ filter: 'blur(4px)' }} />
          <circle cx={x} cy={y} r="3" fill={starColor} />
        </g>
      ))}
    </svg>
  );
};
```

- [ ] **Step 2: Build ve lint ile doğrula**

Çalıştır: `cd frontend && npm run build && npm run lint`
Beklenen: İkisi de hatasız. `AIInsights.tsx`'teki `<StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />` çağrısı `extended`/`className` vermediği için `points = STAR_POINTS` (orijinal 30 nokta) ve `viewBox = '0 0 1000 600'` (orijinal) kullanmaya devam eder — tip hatası ya da davranış değişikliği olmamalı.

- [ ] **Step 3: `AIInsights.tsx` çağrısının değişmediğini teyit et**

Çalıştır: `grep -n "StarMap" frontend/src/components/AIInsights.tsx`
Beklenen çıktı: `<StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />` — bu dosyada hiçbir satır değişmemiş olmalı (bu task bu dosyaya hiç dokunmuyor).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/StarMap.tsx
git commit -m "feat: StarMap'e geriye uyumlu extended/className prop destegi ekle"
```

---

## Task 3: `LandingPage.tsx` — yıldız haritasını genişlet, footer'ı yeniden tasarla

**Files:**
- Modify: `frontend/src/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `StarMap`'in Task 2'de eklenen `extended?: boolean` ve `className?: string` prop'ları.
- Produces: yok (bu plandaki son task).

### Adımlar

- [ ] **Step 1: `lucide-react` import listesine `Github`/`Linkedin` ekle**

`frontend/src/components/LandingPage.tsx` içinde:

```tsx
import {
  GraduationCap,
  Briefcase,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Compass,
  Sparkles,
  LogIn,
  Mail,
  AlertCircle,
} from 'lucide-react';
```

şununla değiştir:

```tsx
import {
  GraduationCap,
  Briefcase,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Compass,
  Sparkles,
  LogIn,
  Mail,
  AlertCircle,
  Github,
  Linkedin,
} from 'lucide-react';
```

- [ ] **Step 2: Footer için `useInViewOnce` ref'i ekle**

```tsx
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();
  const [feedbackRef, feedbackInView] = useInViewOnce<HTMLDivElement>();
  const [heroScrollStarted, setHeroScrollStarted] = useState(false);
```

şununla değiştir:

```tsx
  const [modesRef, modesInView] = useInViewOnce<HTMLDivElement>();
  const [feedbackRef, feedbackInView] = useInViewOnce<HTMLDivElement>();
  const [footerRef, footerInView] = useInViewOnce<HTMLElement>();
  const [heroScrollStarted, setHeroScrollStarted] = useState(false);
```

- [ ] **Step 3: `<main>`'den `<footer>`'a kadar olan bloğu yeni sarmalayıcı + genişletilmiş StarMap + yeni footer ile değiştir**

`frontend/src/components/LandingPage.tsx` içinde, `<main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 w-full">` satırından (StarMap'in mevcut çağrısı dahil) `</footer>` satırına kadar olan TÜM bloğu (aradaki mod-kartları ve geri bildirim formu içeriği dahil, hiçbiri anlamsal olarak değişmiyor, sadece bir üst kapsayıcıya taşınıyor) şu yeni blokla değiştir:

```tsx
      <div className="relative">
        <StarMap
          extended
          className="[mask-image:linear-gradient(to_bottom,black,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black,black_70%,transparent_100%)]"
        />

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
                <div className="w-12 h-12 rounded-2xl border border-brand-pink-dark/40 text-brand-pink-dark dark:text-brand-pink-light flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" strokeWidth={1.5} />
                </div>

                <div>
                  <Badge tone="indigo" className="block mb-1">
                    Müfredat &amp; Sınav Odaklı
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Öğrenci Modu</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    LGS, YKS ve üniversite vize/finaline hazırlananlar kadar; hiçbir okula ya da üniversiteye bağlı olmadan AGS, KPSS, ALES, DGS veya YDS gibi bir sınava bağımsız hazırlananlar için de: ders/konu takibi, deneme netleri ve akıllı tekrar hatırlatmaları. Okulun olsun ya da olmasın, hedefin bir sınavsa modun bu.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                    <span>Ders ve Konu Bazlı Akıllı Tekrar Planı</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                    <span>Deneme Sınavları &amp; Ders Net Analizi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                    <span>Pomodoro Zamanlayıcısı ve Oturum Değerlendirme</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-pink-dark dark:text-brand-pink-light shrink-0" strokeWidth={1.5} />
                    <span>Okula/Üniversiteye Bağlı Olmadan Bağımsız Sınav Hazırlığı</span>
                  </li>
                </ul>
              </div>

              <Button variant="primary" onClick={() => handleSelectModeAndEnter('STUDENT')} className="w-full">
                <span>Öğrenci Modunu Keşfet</span>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Card>

            <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-pink-dark to-brand-mint-dark text-white flex items-center justify-center shadow-md font-black text-xs">
                VS
              </div>

              <div className="hidden lg:flex flex-col items-center gap-3 text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-1 text-brand-pink-dark dark:text-brand-pink-light">
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  <span>Öğrenci</span>
                </div>
                <div
                  className={`h-12 w-0.5 rounded-full bg-gradient-to-b from-brand-pink-dark to-brand-mint-dark ${
                    !reducedMotion && modesInView ? 'animate-neon-line' : ''
                  }`}
                  style={{ boxShadow: '0 0 10px rgba(194, 37, 92, 0.55), 0 0 14px rgba(22, 145, 108, 0.45)' }}
                ></div>
                <div className="flex items-center gap-1 text-brand-mint-dark dark:text-brand-mint">
                  <span>Gelişim</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <Card id="mode-growth-card" accent="violet" className="lg:col-span-3 text-left flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl border border-brand-mint-dark/40 text-brand-mint-dark dark:text-brand-mint flex items-center justify-center">
                  <Briefcase className="w-6 h-6" strokeWidth={1.5} />
                </div>

                <div>
                  <Badge tone="violet" className="block mb-1">
                    Beceri &amp; Proje Odaklı
                  </Badge>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">İş Hayatım ve Gelişim</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    Mesleğin ne olursa olsun — ya da hiçbir mesleğin olmasa bile: spor, İngilizce, tiyatro, müzik gibi kişisel uğraşların; yazılım/kişisel proje geliştirme; kişisel okumalar ve rutin alışkanlık takibi. Sınav ve okul ilişkisi olmayan her kişisel gelişim hedefi burada.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
                    <span>Proje &amp; Beceriler İlerleme Paneli</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
                    <span>Alışkanlık Zinciri (Habit Tracker Matrix)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-mint-dark dark:text-brand-mint shrink-0" strokeWidth={1.5} />
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

        <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pb-16 mt-20 w-full">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Bu platformu nasıl daha iyi geliştirebiliriz?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Fikirlerin, önerilerin ya da karşılaştığın bir sorun mu var? E-posta adresini bırak, doğrudan sana
              yanıt verelim.
            </p>
          </div>

          <div
            ref={feedbackRef}
            className={`transition-all duration-700 ease-out ${
              feedbackInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <Card className="max-w-xl mx-auto text-left">
              <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
                {feedbackError && (
                  <div className="flex items-center gap-2 text-[11px] text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{feedbackError}</span>
                  </div>
                )}

                {feedbackSuccess && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Geri bildirimin için teşekkürler! En kısa sürede okuyacağız.</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">E-posta Adresin</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="sen@ornek.com"
                      value={feedbackEmail}
                      onChange={e => setFeedbackEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Geri Bildirimin</label>
                  <textarea
                    placeholder="Bu platformu nasıl daha iyi hale getirebiliriz?"
                    value={feedbackMessage}
                    onChange={e => setFeedbackMessage(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-pink-dark h-28 resize-none"
                    maxLength={2000}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" disabled={feedbackLoading} className="w-full glow-ai">
                  <span>{feedbackLoading ? 'Gönderiliyor...' : 'Geri Bildirim Gönder'}</span>
                </Button>
              </form>
            </Card>
          </div>
        </section>

        <footer
          ref={footerRef}
          className={`relative z-20 py-10 border-t border-slate-300/40 dark:border-slate-800 transition-all duration-700 ease-out ${
            footerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-pink-dark to-brand-mint-dark flex items-center justify-center shadow-sm">
                <Compass className="w-4 h-4 text-white" strokeWidth={1.75} />
              </div>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">StudyMentor</span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/fatmanurkaragozz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/fatma-nur-karag%C3%B6z-78678a294/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">© 2026 StudyMentor — Fatma Nur Karagöz. Tüm hakları saklıdır.</p>
        </footer>
      </div>
```

Not: `<section>`'ın `className`'ine `mt-20` eklendi (mod kartları ile geri bildirim bölümü arası boşluk isteği); mod kartları ve geri bildirim formunun kendi iç içerikleri (metin, state, handler'lar) anlamsal olarak değişmedi.

- [ ] **Step 4: Build ve lint ile doğrula**

Çalıştır: `cd frontend && npm run build && npm run lint`
Beklenen: İkisi de hatasız.

- [ ] **Step 5: Görsel doğrulama — Playwright ile ekran görüntüleri**

Frontend dev server'ı çalışıyor olmalı (`npm run dev`, port 5173). Aşağıdaki script'i geçici bir dosyaya yaz ve çalıştır (önceki oturumda `playwright` paketinin `C:\Users\myPC\node_modules\playwright` altında kurulu olduğu doğrulanmıştı — `node -e "require.resolve('playwright')"` ile teyit edilebilir):

```js
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } }).catch(async () => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  return ctx.newPage();
});

await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=Bu platformu nasıl daha iyi geliştirebiliriz?', { timeout: 15000 });

// tam sayfa - mod kartlarindan footer'a kadar yildiz gecisini gormek icin
await page.evaluate(() => document.querySelector('h2')?.scrollIntoView());
await page.screenshot({ path: 'bottom-light-full.png', fullPage: true });

// dark mode
const themeButtons = page.locator('header button');
const count = await themeButtons.count();
for (let i = 0; i < count; i++) {
  const html = await themeButtons.nth(i).innerHTML();
  if (html.includes('lucide-sun') || html.includes('lucide-moon')) {
    await themeButtons.nth(i).click();
    break;
  }
}
await page.waitForTimeout(400);
await page.screenshot({ path: 'bottom-dark-full.png', fullPage: true });

// footer linklerinin dogru URL'e gittigini teyit et
const githubHref = await page.locator('a[aria-label="GitHub"]').getAttribute('href');
const linkedinHref = await page.locator('a[aria-label="LinkedIn"]').getAttribute('href');
const githubTarget = await page.locator('a[aria-label="GitHub"]').getAttribute('target');
console.log(JSON.stringify({ githubHref, linkedinHref, githubTarget }));

// mobil genislik
await page.setViewportSize({ width: 375, height: 800 });
await page.locator('footer').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'bottom-mobile.png' });

await browser.close();
```

Beklenen sonuçlar:
- `githubHref` tam olarak `https://github.com/fatmanurkaragozz`, `linkedinHref` tam olarak `https://www.linkedin.com/in/fatma-nur-karag%C3%B6z-78678a294/`, `githubTarget` `_blank` olmalı.
- Ekran görüntülerinde: yıldızlar mod kartlarının bittiği yerden geri bildirim bölümüne doğru devam edip footer'a doğru sönmeli (aniden kesilmemeli); footer'da marka rozeti solda, GitHub/LinkedIn ikonları sağda, altında telif satırı görünmeli; mod kartları ile "Bu platformu nasıl daha iyi geliştirebiliriz?" başlığı arasında belirgin bir boşluk olmalı; dark modda metin kontrastı okunaklı olmalı; mobil genişlikte footer öğeleri dikey sıralanıp taşma olmamalı.
- Ekran görüntülerini Read tool ile aç ve gözle kontrol et — otomatik piksel karşılaştırması yok, bu görsel bir değişiklik olduğu için insan/AI gözüyle onay gerekiyor.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/LandingPage.tsx
git commit -m "feat: yildiz haritasini footer'a dogru genislet, footer'i profesyonel bar olarak yeniden tasarla"
```

---

## Doğrulama planı (özet)

- Her task kendi `npm run build`/`npm run lint` adımıyla doğrulanır.
- Task 2'nin `AIInsights.tsx` üzerindeki sıfır-etki garantisi kod incelemesiyle (varsayılan prop değerleri) + grep ile teyit edilir; login gerektirdiği için tam bir authenticated Playwright taraması bu plana dahil edilmedi (gerekirse ayrı bir adım olarak eklenebilir).
- Task 3 sonunda tam görsel doğrulama: açık/koyu mod tam sayfa ekran görüntüsü + 375px mobil + GitHub/LinkedIn linklerinin `href`/`target` doğrulaması.
