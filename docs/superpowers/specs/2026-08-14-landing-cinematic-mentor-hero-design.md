# Açılış Sayfası — Sinematik Scroll-Güdümlü Mentor Hero Tasarımı

## Bağlam

Kullanıcı, mentor karakteri olarak kullanılacak stilize bir 3D-render kadın karakter referans görseli paylaştı ve açılış sayfasının hero'sunu, aşağı doğru scroll ile ilerleyen, 3 bölümden oluşan sinematik bir deneyime çevirmek istedi:

1. **Üst bölüm** — solda boydan mentor karakteri, sağda harf harf yazılan karşılama metinleri.
2. **Orta bölüm** — sayfayı enlemesine kaplayan 3D çalışma masası sahnesi; scroll ilerledikçe masa lambası ışığı yavaş yavaş yanıyor.
3. **Alt bölüm** — masadaki nesnelerden bir kısmı sağdan/soldan aşağı doğru kayarak ayrılıyor, biri Öğrenci Modu'nu diğeri Gelişim Modu'nu işaret eden iki ok beliriyor.

### Bu tasarımın önceki dokümanla ilişkisi (supersedes)

Bu oturumun erken bir bölümünde `docs/superpowers/specs/2026-08-14-landing-hero-3d-desk-scene-design.md` ve karşılık gelen `docs/superpowers/plans/2026-08-14-landing-hero-3d-desk-scene.md` yazılmıştı — bunlar, tek ekranlık kompakt bir hero'ya (masa+lamba+el+kalem, zaman-bazlı otomatik oynatılan sekans) 3D bir masa sahnesi eklemeyi tanımlıyordu. **Bu plan hiç uygulanmadı** (`hero3d/` klasörü yok, `three`/`@react-three/fiber`/`@react-three/drei` `package.json`'da yok) — yani kaybolan bir kod/emek yok, sadece doküman güncelliğini yitiriyor.

Bu yeni doküman, o tasarımın yerini alır (supersedes). Ortak noktalar (masa/lamba/laptop/kitaplar/fincan/saksı/el+kalem nesneleri, "gece + sıcak lamba ışığı" atmosferi, WebGL yoksa düz-SVG'ye düşme fikri) korunuyor, ama orkestrasyon mekanizması zaman-bazlı otomatik sekanstan **scroll-güdümlü 3 bölümlü bir sinematik deneyime** dönüşüyor ve kapsama tam boy bir mentor karakteri + harf-harf yazı + nesne-ayrılma bölümü ekleniyor.

## Kapsam

Sadece açılış sayfasının (`frontend/src/components/LandingPage.tsx`) hero bölümü ve onun hemen altındaki mevcut Öğrenci/Gelişim kartları bölümünün giriş-animasyon tetikleyicisi. Header, footer, `OnboardingFlow` entegrasyonu, kartların kendi içeriği/tıklama davranışı (mod seçimi akışı) **değişmiyor**.

## Tasarım Kararları

### 1. Genel mimari — tek Canvas, 3 scroll "sayfası"

Sayfa yapısı (yukarıdan aşağıya): değişmeyen `<header>` → **yeni** sinematik hero (3 ekran-yüksekliği) → değişmeyen mod-kartları `<main>` → değişmeyen `<footer>`.

Sinematik hero, `@react-three/drei`'nin `<ScrollControls pages={3}>` bileşeniyle (varsayılan `damping` ile yumuşatılmış geçişler) kurulan tek bir `<Canvas>`. `useScroll()`'dan gelen `scroll.offset` (0→1) değeri:
- Kamera pozisyonunu/açısını sürekli günceller (Bölüm 1: karaktere yakın boş atmosfer → Bölüm 2: masaya geniş 3/4 açı → Bölüm 3: ayrılan nesnelere yakın).
- Lamba `pointLight.intensity`'sini Bölüm 1→2 geçişinde ~0'dan hedef değere yükseltir.
- `<Scroll html>` katmanındaki HTML içeriğin (karakter görseli, yazı, oklar) opacity/transform değerlerini aynı `scroll.offset` ile senkronize eder.

Mevcut mod-kartları bölümü Canvas'ın **dışında**, normal DOM akışında kalır; kullanıcı 3 sayfalık Canvas alanını geçtikten sonra oraya normal şekilde devam eder.

**Mimari seçimi:** Scroll-progress hesaplaması için elle scroll-listener yazmak yerine (yüksek risk/jank potansiyeli) veya sahneyi 3 ayrı `<Canvas>`'a bölmek yerine (kamera sürekliliği kaybolur, WebGL context churn), react-three-fiber ekosisteminin bu tam senaryo için var olan resmi `ScrollControls`/`Scroll`/`useScroll` API'leri kullanılıyor — en az özel kod, kanıtlanmış kütüphane davranışı.

### 2. Bölüm 1 — Mentor karakteri + harf-harf yazı

**Karakter:** AI ile üretilecek, referans görseldeki gibi stilize 3D-render görünümlü (Pixar/Disney tarzı), **boydan (tam boy)**, şeffaf arka planlı (PNG) bir kadın karakter illüstrasyonu — gerçek 3D mesh değil, 2D görsel. Sol tarafta, sayfanın altına hizalı sabit duruyor.

**Pseudo-3D derinlik:** Görsel 2-3 katmana ayrılır (arkada yumuşak ışık halesi/glow, ortada karakter, önde hafif parıltı/parçacık katmanı). Fare hareketiyle (`mousemove`) katmanlar farklı hızlarda hafifçe kayar (parallax tilt); scroll ile de hafif bir dolly hareketi eklenir. Bölüm 1→2 geçişinde karakter yumuşakça sola kayıp küçülerek "izleyici" pozisyonuna geçer (ilk sürümde basit bir fade-out da kabul edilebilir).

**Yazı:** Ana başlık **"StudyMentor'e Hoş Geldiniz"**, ardından alt satır **"Mentörünüzle Tanışın"** — harfler tek tek, tamamen scroll offset'e bağlı olarak beliriyor (zamanlayıcı değil; kullanıcı scroll'u yavaş kaydırırsa harfler de yavaş "yazılır").

**3D Canvas içeriği:** Masa sahnesi henüz görünmüyor; kamera karanlık/atmosferik bir boşlukta, birkaç yumuşak bokeh/parçacık ışığıyla (`AmbientBackdrop`) "yaklaşan" lamba ışığına dair bir ipucu veriyor.

**Mobil:** Yan yana düzen yerine karakter üstte (küçültülmüş), yazı altta, dikey istiflenmiş.

### 3. Bölüm 2 — Tam genişlik 3D masa sahnesi

Bugün tasarlanan (ama henüz kodlanmamış) `DeskScene` içeriği — masa, laptop, kitap yığını, kahve fincanı, saksı bitki, açık defter, el+kalem, masa lambası — temel alınıyor, panoramik/tam-genişlik bir kompozisyona genişletiliyor: masa geometrisi enlemesine uzatılıyor, birkaç ek nesne masanın iki ucuna doğru yayılıyor. Kamera bu bölümün scroll aralığında (0.33→0.66) hafif bir yanal kayma (dolly/pan) yapar.

**Lamba ışığı:** `pointLight.intensity`, Bölüm 1→2 geçişinde scroll offset'e bağlı `MathUtils.lerp` ile ~0'dan `2.2`'ye yükselir — "yavaş yavaş yanma" efekti. El+kalem animasyonu korunuyor, tetikleyicisi zaman-bazlıdan scroll-eşiğine dönüşüyor.

**Bölüm 3'e süreklilik:** Kitap yığını sol tarafa (Öğrenci Modu yönü), kahve fincanı + saksı bitki sağ tarafa (Gelişim Modu yönü) ayrılacak şekilde, masada zaten o taraflara yakın konumlandırılıyor — Bölüm 3'teki ayrışma ani/kopuk hissettirmiyor.

### 4. Bölüm 3 — Nesne ayrışması + mod okları

Scroll aralığı 0.66→1.0. Kitap yığını sol-aşağıya, kahve fincanı+saksı bitki sağ-aşağıya doğru kayarak masadan ayrılır (`useFrame` içinde scroll offset'e bağlı `lerp` ile pozisyon). Kamera geriye/yana açılarak iki nesne grubunu da kadraja alır.

**Oklar:** 3D nesne değil, `<Scroll html>` katmanında `lucide-react`'ın `ArrowLeft`/`ArrowRight` ikonlarıyla, kısa etiketlerle ("Öğrenci Modu" / "Gelişim Modu") nesne gruplarının yanında beliren HTML öğeleri. Dekoratif/yönlendirici amaçlı (CTA değil — CTA'lar aşağıdaki kartlarda kalıyor); tıklandığında sayfayı ilgili karta yumuşak `scrollIntoView` ile kaydırma davranışı ekleniyor (küçük bir kullanılabilirlik dokunuşu).

**Geçiş:** Scroll offset 1.0'a ulaştığında ok/etiket katmanı soluklaşır, sayfa değişmeyen mod-kartları bölümüne devam eder. Kartların giriş animasyonu tetikleyicisi, eski zaman-bazlı `stage === 'modes'` kontrolünden bağımsız bir `IntersectionObserver`'a çevriliyor (cinematic hero'nun iç mekanizmasından bağımsız çalışır).

### 5. Fallback stratejisi — WebGL yok / azaltılmış hareket

**Birleşik statik ağaç:** "WebGL desteklenmiyor" ve "`prefers-reduced-motion` açık" senaryoları **aynı** statik/basitleştirilmiş ağaca yönlendiriliyor (ayrı ayrı ele alınmıyor). Gerekçe: bu tasarımın özü zaten scroll'a bağlı kamera/ışık/nesne hareketi — hareket kapalıyken 3 ekran-yüksekliği boş scroll alanı bırakmak kötü bir deneyim olurdu. Statik ağaç, içeriği doğal yüksekliğinde (3 tam ekran yüksekliği değil) art arda gösterir:
- Sabit mentor görseli (parallax yok) + düz yazı (harf-harf animasyonu yok, direkt tam görünür).
- Mevcut `DeskHeroAnimation.tsx` (düz SVG, lamba sabit yanık halde — animasyonsuz).
- `RouteOverlay.tsx`'in (bugün tasarlanan ama uygulanmamış rota-çizgisi tekniği) sabit hali + ok etiketleri.

**Gerçek 3D (WebGL var, hareket kısıtlı değil):** Tam sinematik deneyim; mobilde sadece hafif performans ayarları (dpr üst sınırı ~1.5, arka plan nesne sayısı azaltılmış) — ayrı bir mimari dal değil, aynı bileşenlere verilen daha hafif parametreler.

## Etkilenen dosyalar

**Yeni** (`frontend/src/components/hero3d/` altında):
- `HeroCanvas.tsx` — `Canvas` + `ScrollControls pages={3}` + 3D içerik + `<Scroll html>` katmanı orkestratörü; `LandingPage.tsx`'ten lazy-load edilir.
- `DeskScene.tsx` — masa/lamba/laptop/kitaplar/fincan/saksı/defter/el+kalem; nesne pozisyonları ve lamba yoğunluğu scroll offset'ine bağlı.
- `AmbientBackdrop.tsx` — Bölüm 1'in karanlık/parçacıklı 3D arka planı.
- `lighting.tsx` — genel dolgu ışığı.
- `MentorPortrait.tsx` — AI-üretimi karakter görseli + parallax katman mantığı.
- `ScrollHeroOverlay.tsx` — `<Scroll html>` içindeki tüm HTML içerik (portre + harf-harf yazı + Bölüm 3 ok/etiketleri).
- `WebGLFallback.tsx` — `hasWebGLSupport()` + genişletilmiş statik ağaç (bkz. Fallback stratejisi).
- `RouteOverlay.tsx` — rota-çizgisi tekniği; sadece statik fallback'in son bölümünde kullanılıyor.

**Yeni varlık (asset):** Mentor karakter portresi (ve varsa parallax için ayrıştırılmış katman görselleri) — design skill'in AI görsel üretim yeteneğiyle üretilip `frontend/src/assets/mentor/` altına eklenecek. Bu, koddan önce yapılması gereken bir ön-adım.

**Değişecek:**
- `frontend/src/components/DeskHeroAnimation.tsx` — statik fallback'in masa-sahnesi içeriği olarak kalıyor; `stage`/`STAGE_INDEX` bazlı sekans mantığı kaldırılıp her şeyin (kontrol işareti, rota çizgisi dahil) baştan tam görünür/tamamlanmış olarak render edildiği sade bir bileşene indirgeniyor (dış `<div>` sarmalayıcı da sadeleştiriliyor). Bu değişiklik, `useHeroIntroSequence`'ın silinmesini mümkün kılan son bağımlılığı ortadan kaldırıyor.
- `frontend/src/components/LandingPage.tsx` — kompakt hero bloğu yeni cinematic hero mount'uyla değişiyor; kart bölümünün giriş tetikleyicisi `IntersectionObserver`'a çevriliyor.
- `frontend/package.json` / `package-lock.json` — `@react-three/fiber`, `@react-three/drei`, `three`, `@types/three` eklenir.

**Silinecek:**
- `frontend/src/hooks/useHeroIntroSequence.ts` — zaman-bazlı orkestrasyon, scroll-bazlı sisteme taşındığı için gereksiz kalıyor (`STAGE_INDEX` dahil).

**Değişmeyecek:** `frontend/src/hooks/useReducedMotion.ts` (fallback kararında girdi olarak kullanılıyor), mod-seçim kartlarının içeriği/tıklama davranışı, header/footer, `OnboardingFlow`.

## Kapsam dışı (bilinçli)

- Tam oda (kitaplık, duvar posteri, pencereden manzara) — sadece masa + arka duvar/pencere lekesi.
- Sahnenin tema (açık/koyu) ile değişmesi — sahne sabit "gece" atmosferinde kalıyor (mevcut karardan devam).
- Mentor karakterinin gerçek 3D mesh olarak modellenmesi — 2D görsel + pseudo-3D katman efekti kullanılıyor (bkz. Tasarım Kararı 2).
- Bölüm 3'teki okların tam CTA butonu davranışı (özellik listeleri, birincil kayıt akışı) — bunlar aşağıdaki mevcut kartlarda kalıyor, oklar sadece yönlendirici.
- Ayrı bir "düşük güç modu" tespiti/dallanması (ör. `navigator.hardwareConcurrency` bazlı) — performans sorunları gerçek cihaz testinde ortaya çıkarsa ayrı bir takip işi olarak ele alınacak.

## Doğrulama planı

- `npm run build` + `npm run lint` (her görev adımında, mevcut proje pratiğine uygun).
- Playwright: scroll offset'in birkaç noktasında (0/%33/%50/%66/100) açık/koyu mod + masaüstü/mobil (390px) ekran görüntüsü.
- `prefers-reduced-motion: reduce` senaryosunda statik ağacın doğru göründüğü, konsol hatası olmadığı kontrolü.
- WebGL devre dışı bırakılmış bir tarayıcı bağlamında statik ağacın doğru göründüğü kontrolü.
- Manuel test: ok tıklamalarının doğru karta kaydırdığı; kartlardaki "Öğrenci Modunu Keşfet" / "Bu Modu Keşfet" butonlarının onboarding akışını öncekiyle aynı şekilde açtığı.
