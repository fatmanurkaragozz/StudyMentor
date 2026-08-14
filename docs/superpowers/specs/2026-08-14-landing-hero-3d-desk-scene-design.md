# Açılış Sayfası — 3D Masa/Oda Sahnesi Hero Animasyonu

## Bağlam

Az önce (bu oturumun erken bir bölümünde) açılış sayfasını tamamen okyanus/Kaptan temasından çıkarıp düz, indigo/violet renkli bir "Enterprise SaaS" hero'suna çevirdik ve `@react-three/fiber`/`three` bağımlılıklarını kasıtlı olarak kaldırdık ("3D'den tamamen vazgeç" kararı). Ardından, düz bir masa+el+rota SVG illüstrasyonu (`DeskHeroAnimation.tsx`) inşa ettik.

Kullanıcı, atmosferik/samimi bir "geliştirici masası" referans görseli paylaşarak bu düz SVG sonucundan memnun kalmadığını belirtti. Brainstorming skill'i ile yürütülen görsel-companion destekli bir keşif sürecinde şu netleşti:

1. Referanstan alınmak istenen şey **genel atmosfer/mood** — karakter portresi değil, "intro'yu geç"/ses ikonu gibi somut UI kalıpları değil.
2. Düz SVG'nin ürettiği "ikon gibi" his yeterli bulunmadı; kullanıcı gerçek bir **3 boyutlu oda/derinlik hissi** istiyor.
3. Bu, bilinçli olarak **gerçek 3D'ye (react-three-fiber/WebGL) geri dönüş** kararını doğurdu — "3D'den vazgeç" kararının kısmi bir tersine çevrilmesi. Bu doküman bu yeni kararın somut tasarımını kayıt altına alıyor.

## Kapsam

Sadece açılış sayfasının (`frontend/src/components/LandingPage.tsx`) hero bölümü. Diğer sayfalar, mod-seçim kartlarının kendi içeriği/tıklama davranışı, header/footer, `OnboardingFlow` entegrasyonu kapsam dışı — bunlara dokunulmuyor.

## Tasarım Kararları

### 1. Sahne ve kamera
Kuşbakışı (top-down) değil, referanstaki gibi hafif yukarıdan **3/4 açılı** sabit bir kamera. Sahne: masa (laptop, kitap yığını, açık defter, kalem+el, kahve fincanı, saksı bitki, masa lambası) + hemen arkasında bir duvar (derinlik hissi için, üzerinde soft bir pencere/ışık lekesi olabilir). Tam bir "oda" (kitaplık, poster, pencereden şehir manzarası) **kapsam dışı** — iş büyümesin diye masa + arka duvarla sınırlı tutuluyor.

### 2. Tema davranışı
3D sahne **her zaman "gece + lamba" atmosferinde sabit kalır** — kullanıcı açık/koyu tema değiştirse de sahnenin kendisi değişmez (bir marka illüstrasyonu gibi davranır, referans görseldeki gibi "kendi zaman dilimi" olan bir sahne). Bunun nedeni: hem gündüz hem gece için ayrı bir ışıklandırma seti kurmak işi ciddi büyütür ve "atmosfer" fikrinin özüyle (samimi/gece hissi) çelişir.

Sayfanın geri kalanı (header, metin, kartlar, arka plan) **her zamanki gibi** `dark:` Tailwind varyantlarıyla temaya uyar. Koyu modda sayfa arka planına, lambanın ışığıyla görsel süreklilik kuran hafif bir sıcak (amber) ambient leke eklenir (mevcut indigo/violet ambient leke düzenine üçüncü, düşük opaklıklı bir katman olarak); açık modda bu eklenmez, sayfa arka planı şu anki temiz hâlinde kalır.

### 3. Rota çizgisi
3D bir tüp/ışık çizgisi **değil** — 3D canvas'ın üzerine bindirilmiş, mevcut `DeskHeroAnimation.tsx`'te zaten inşa edilmiş `stroke-dasharray`/`stroke-dashoffset` tekniğiyle çizilen 2D SVG overlay olarak kalır (Öğrenci/Gelişim uçlarına çatallanma dahil). Bu parça 3D'ye taşınmadan, mutlak konumlandırılmış bir katman olarak yeniden kullanılır — güvenilirlik ve basitlik için.

### 4. El
Önceki karar geçerliliğini koruyor: **tam karakter yok**, sadece 3D bir el+kalem modeli, `Mascot.tsx`'te kullanılan teknikle aynı şekilde (primitive geometriler: kapsül/küre/silindir) inşa edilir.

### 5. WebGL yok / `prefers-reduced-motion` / performans
Silinen `hero3d/` sisteminin mimarisi aynen geri getiriliyor:
- `HeroCanvas.tsx`: `Canvas` + `Suspense` sarmalayıcı, `LandingPage.tsx`'te `lazy()` ile lazy-load edilir.
- `WebGLFallback.tsx`: `hasWebGLSupport()` kontrolü + WebGL yoksa **mevcut `DeskHeroAnimation.tsx` düz-SVG bileşenini fallback olarak kullanır** (siliniyor değil, yeniden görev kazanıyor — WebGL'siz kullanıcılar hâlâ makul bir sahne görür).
- `prefers-reduced-motion`: zaten var olan paylaşılan `frontend/src/hooks/useReducedMotion.ts` (bu oturumda SVG versiyonu için kurulmuştu) doğrudan yeniden kullanılır — sahne statik/donuk kalır, kamera/element animasyonları oynamaz.
- Sekans orkestrasyonu (`useHeroIntroSequence` — `'desk' → 'hand' → 'route' → 'modes'`) **teknolojiden bağımsız**, aynen korunuyor; 3D sahne bu stage'lere göre kendi elemanlarının (lamba ışığı, el, vb.) görünürlüğünü/opaklığını sürer.

### 6. Bağımlılıklar
`@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` `frontend/package.json`'a geri eklenir (`npm install`). Bundle boyutu bu özellik için tekrar büyür (önceki oturumda ayrı bir ~900KB chunk olarak gözlemlenmişti) — bu, bilinçli kabul edilen bir maliyet.

## Etkilenen dosyalar (öngörülen)

**Yeni/yeniden oluşturulacak** (`frontend/src/components/hero3d/` klasörü altında, eski isimlendirme korunarak):
- `HeroCanvas.tsx` — Canvas + Suspense + lighting kurulumu.
- `DeskScene.tsx` — masa, lamba, laptop, kitaplar, defter, el+kalem; primitive Three.js geometrileriyle.
- `lighting.tsx` — lambadan gelen sıcak point light + soğuk/loş ambient dolgu ışığı.
- `WebGLFallback.tsx` — `hasWebGLSupport()` + `DeskHeroAnimation.tsx`'i saran statik fallback.
- `RouteOverlay.tsx` — mevcut `DeskHeroAnimation.tsx`'teki rota-çizgisi SVG parçasının (stroke-dashoffset çizim tekniği, çatallanma) ayrıştırılmış hâli; hem 3D sahnenin üzerinde hem (fallback durumunda) düz sahnenin üzerinde kullanılabilir ortak bir bileşen.

**Değişecek:**
- `frontend/src/components/LandingPage.tsx` — `DeskHeroAnimation` doğrudan kullanımı yerine `lazy(() => import('./hero3d/HeroCanvas'))` + WebGL kontrolü eklenir (eski `Hero3DLanding.tsx`'teki desenin aynısı).
- `frontend/src/components/DeskHeroAnimation.tsx` — silinmiyor, `hero3d/WebGLFallback.tsx` içinden çağrılan fallback bileşenine dönüşüyor. Rota-çizgisi mantığı (`stroke-dashoffset` çizim tekniği, çatallanma) `hero3d/RouteOverlay.tsx`'e taşınıp tek bir paylaşılan bileşen hâline getirilir; hem `DeskHeroAnimation.tsx` (fallback yolu) hem 3D sahnenin üzerindeki overlay bu ortak bileşeni kullanır — kod tekrarı olmaz.
- `frontend/package.json` / `package-lock.json` — bağımlılıklar geri eklenir.

**Değişmeyecek:** `frontend/src/hooks/useReducedMotion.ts`, `frontend/src/hooks/useHeroIntroSequence.ts`, mod-seçim kartları (`Card`/`Badge`/`Button` kullanımı), header/footer, `OnboardingFlow`.

## Kapsam dışı (bilinçli)
- Tam oda (kitaplık, duvar posteri, pencereden manzara) — sadece masa + arka duvar.
- Sahnenin tema ile gündüz/gece arası geçiş yapması — sahne sabit "gece" kalıyor.
- "intro'yu geç" / ses aç-kapa gibi referans görseldeki UI kalıpları — kullanıcı bunları önceliksiz olarak işaretledi, bu iş kapsamında değil.
- Diğer sayfalara 3D/atmosfer uygulanması — sadece açılış sayfası hero'su.

## Doğrulama planı (uygulama planına devredilecek)
- `npm run build` + `npm run lint`.
- Playwright: sekansın aşamaları (desk/hand/route/modes) açık ve koyu mod, masaüstü + mobil (390px), `prefers-reduced-motion` senaryosunda ekran görüntüsü.
- WebGL devre dışı bırakılmış bir tarayıcı bağlamında fallback'in (düz SVG) doğru göründüğünü doğrulama.
- Manuel tıklama testi: sekans bitince Öğrenci/Gelişim kartlarının onboarding akışını doğru açtığını doğrulama.
