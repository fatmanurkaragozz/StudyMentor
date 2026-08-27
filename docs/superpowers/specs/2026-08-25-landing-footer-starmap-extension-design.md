# Açılış Sayfası — Footer & Yıldız Haritası Genişletme Tasarımı

## Bağlam

Bir önceki oturumda açılış sayfasının en altına bir geri bildirim formu (`POST /api/feedback`, gerçek bir backend ucuna bağlı) ve basit tek satırlık bir footer eklendi. Kullanıcı bu yeni alt bölümün görsel kalitesini yükseltmek istedi: (1) mod kartlarının arkasındaki `StarMap` yıldız dokusunun sayfanın en altına doğru genişleyerek devam etmesi, (2) footer'ın "profesyonel bir sitenin alt barı" gibi güncellenmesi, (3) genel olarak "geçişli" (transitional/gradient) bir his. Netleştirme turlarında şunlar karara bağlandı: footer'a gerçek GitHub (`github.com/fatmanurkaragozz`) ve LinkedIn (`linkedin.com/in/fatma-nur-karagöz-78678a294`) linkleri eklenecek (sahte/placeholder link yok); yıldızlar footer'ın içine de hafif taşıp orada tamamen sıfırlanacak (footer'ın ayrı/net bir arka planı olmayacak).

## Kapsam

Sadece açılış sayfasının (`frontend/src/components/LandingPage.tsx`) mod-kartları sonrası kısmı: yıldız haritasının genişletilmesi, geri bildirim bölümü ile footer'ın görsel/yapısal güncellenmesi, aralarındaki boşluk ayarı. `StarMap.tsx` bileşenine geriye-uyumlu (opt-in) bir genişletme eklenecek ama `AIInsights.tsx`'teki mevcut kullanımı hiç etkilenmeyecek. Geri bildirim formunun kendi işlevselliği (backend entegrasyonu, validation, state yönetimi) kapsam dışı — zaten çalışıyor, sadece görsel bağlamı değişiyor.

## Tasarım Kararları

### 1. Yıldız haritasının genişletilme mekanizması

`StarMap.tsx`'e iki yeni opsiyonel prop eklenir:

- `extended?: boolean` (varsayılan `false`) — `true` olduğunda daha uzun bir `viewBox` (örn. `0 0 1000 1100`, kesin değer uygulama sırasında görsel olarak ayarlanır) + mevcut 30 yıldıza ek olarak y:600-1100 aralığına yayılan, aşağıya inildikçe seyrekleşen yeni yıldız noktaları kullanılır. `false`/tanımsızken bileşen bugünküyle birebir aynı davranır (viewBox 600, orijinal 30 nokta) — `AIInsights.tsx`'teki `<StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />` çağrısı sıfır değişiklikle, sıfır riskle aynı kalır.
- `className?: string` (varsayılan `''`) — kök `<svg>` elemanının class'ına eklenir (append), soluma maskesinin dışarıdan (LandingPage.tsx'ten) enjekte edilebilmesi için. `AIInsights.tsx` bu prop'u kullanmayacağı için etkilenmez.

Yeni yıldız noktaları eklenirken mevcut koddaki ilke korunur: metin oturan bölgelerin (geri bildirim başlığı/paragrafı, footer metni) arkası bilinçli boş bırakılır ki bağlantı çizgileri metnin üzerinden geçmesin.

### 2. Kapsayıcı yapı değişikliği

Şu an `<StarMap />` sadece `<main>` içinde `absolute inset-0` ile konumlanıyor, bu yüzden sadece `<main>`'in yüksekliğini kaplıyor. `<main>`, geri bildirim `<section>`'ı ve `<footer>`, yeni bir `<div className="relative">` kapsayıcısının içine alınır; `<StarMap extended className="..." />` bu kapsayıcının ilk çocuğu olur ve `absolute inset-0` artık üç bölümün toplam yüksekliğine yayılır. `<main>` (z-10), `<section>` (z-10), `<footer>` (z-20) kendi z-index'lerini korur; StarMap'in kendi z-index'i olmadığından (CSS stacking kuralları gereği) otomatik olarak hepsinin arkasında kalır — mevcut header (z-30) ve arka plan aurora lekeleriyle olan katmanlama ilişkisi de değişmeden korunur.

### 3. Soluma / "geçişli" his

`StarMap`'e verilen `className` üzerinden bir `mask-image` gradyanı eklenir (`linear-gradient(to bottom, black, black ~70%, transparent 100%)` + `-webkit-` öneki), yıldızlar geri bildirim bölümünün sonlarında sönmeye başlayıp footer içinde tamamen kaybolur. Bu, yeni eklenen yıldız noktalarının zaten aşağıya doğru seyrekleşmesiyle birleşince "sona doğru sakinleşen" bir gökyüzü hissi verir. Ayrıca kök arka plan gradyanı — `LandingPage.tsx`'in en dıştaki `<div>`'inde (`bg-gradient-to-b from-brand-ivory to-brand-ivory-deep dark:from-slate-950 dark:to-slate-950`, `index.css`'te değil, doğrudan bu className'de tanımlı) — şu an dark modda iki ucu aynı renk olduğu için görünmüyor. Bu, sadece `dark:to-slate-950` değerinin `dark:to-slate-900` gibi hafif farklı bir tona değiştirilmesiyle düzeltilir; hero'nun kendi ayrı `h-hero-viewport` gradyanına ve altındaki fade-overlay'e (satır ~180, ~246) dokunulmaz, sadece kök div'in `to` rengi değişir.

### 4. Footer — "profesyonel alt bar"

İçerik: marka rozeti (header'daki gradyan kare + Compass ikonu + "StudyMentor" yazısının küçültülmüş tekrarı) solda; gerçek GitHub ve LinkedIn ikon linkleri sağda (lucide-react `Github`/`Linkedin`, `target="_blank" rel="noopener noreferrer"`, `aria-label`, hover'da renk/opaklık geçişi); altında ortalanmış mevcut telif satırı ("© 2026 StudyMentor — Fatma Nur Karagöz. Tüm hakları saklıdır."). Mobilde dikey stack'e döner (marka → ikonlar → telif). Diğer bölümlerle tutarlılık için `useInViewOnce` ile scroll'da belirme animasyonu eklenir (mode kartları ve geri bildirim formuyla aynı desen). Padding artırılır (`py-6` → `py-10` civarı) ki gerçek bir "bar" gibi nefes alsın. Footer kendi arka plan rengini almaz — yıldız dokusunun üstünde, sayfanın geri kalanıyla aynı saydam/gradyan zemini paylaşır (kullanıcı tercihi).

### 5. Mod kartları ile geri bildirim bölümü arası boşluk

Kartların bittiği yer ile "Bu platformu nasıl daha iyi geliştirebiliriz?" başlığı arasına ek üst boşluk eklenir (geri bildirim `<section>`'ına `mt-16`/`mt-20` civarı bir sınıf — kesin değer uygulama sırasında görsel olarak ayarlanır).

## Etkilenen dosyalar

**Değişecek:**
- `frontend/src/components/StarMap.tsx` — `extended` ve `className` prop'ları eklenir; genişletilmiş yıldız noktaları + taller viewBox tanımlanır.
- `frontend/src/components/LandingPage.tsx` — yapısal sarmalayıcı (`main`+`section`+`footer`'ı saran yeni `relative` div), `StarMap` çağrısının taşınması, footer'ın yeniden tasarlanması, geri bildirim section'ına üst boşluk, `Github`/`Linkedin` ikon import'ları, kök div'in dark mode arka plan gradyanının ikinci rengi (`dark:to-slate-950` → `dark:to-slate-900` ya da benzeri).

**Değişmeyecek:**
- `frontend/src/components/AIInsights.tsx` — `StarMap` kullanımı, yeni prop'lar opt-in olduğu için hiç etkilenmiyor.
- Geri bildirim formunun kendi mantığı (state, `apiClient.submitFeedback`, backend) — sadece görsel bağlamı (üstündeki boşluk, arkasındaki yıldız dokusu) değişiyor.

## Kapsam dışı (bilinçli)

- Footer'a yeni sayfa/rota linkleri (Hakkımızda, Gizlilik vb.) — uygulamanın router'ı yok, sahte link eklenmeyecek.
- E-posta (mailto) linki — kullanıcı sadece GitHub/LinkedIn seçti.
- `StarMap`'in `AIInsights.tsx`'teki kullanımının görsel olarak değiştirilmesi — sadece açılış sayfası kapsamında.
- Footer'ın kendi ayrı/net arka plan rengi alması — kullanıcı yıldızların footer'a hafif taşmasını tercih etti.

## Doğrulama planı (uygulama planına devredilecek)

- `npm run build` + `npm run lint` (frontend).
- Playwright ile: açık + koyu mod ekran görüntüleri (yıldızların geri bildirim bölümü ve footer'a doğru nasıl solduğunu görmek için tam sayfa scroll screenshot'ı), 375px mobil genişlik.
- Mümkünse `AIInsights.tsx` ekranının mevcut yıldız görünümünün değişmediğinin teyidi (login gerektirdiği için zor olursa, `extended`/`className` prop'larının varsayılan değerlerinin bugünkü davranışı birebir koruduğu kod incelemesiyle garanti edilir).
- GitHub/LinkedIn linklerinin doğru URL'e gittiğinin ve yeni sekmede açıldığının manuel kontrolü.
