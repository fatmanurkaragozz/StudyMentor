// Bölüm tanıtım kartlarının ("Bölüm Rehberi") ve ileride alt özellik ipuçlarının
// metinleri. Kod ile metni ayrı tutmak için ayrı dosya - deseni navItems.ts /
// labels.ts ile aynı: her giriş (isStudent) => IntroContent.

export interface IntroContent {
  /** Kısa başlık - bölümün/özelliğin adı */
  title: string;
  /** "Ne işe yarar" - 1-2 cümle */
  body: string;
  /** "Nasıl kullanılır" - 2-3 kısa madde */
  steps: string[];
}

type IntroFn = (isStudent: boolean) => IntroContent;

// Bölüm kartının, altındaki ekran içeriğiyle yatayda hizalı durması için her
// sekmenin kendi dış sarmalayıcısındaki max-width değeri (ilgili *.tsx dosyasının
// return'ündeki en dış div'den alındı). Haritada olmayan sekme varsayılana düşer.
export const SECTION_MAX_WIDTH: Record<string, string> = {
  dashboard: 'max-w-7xl',
  courses: 'max-w-5xl',
  planner: 'max-w-5xl',
  calendar: 'max-w-6xl',
  growth: 'max-w-6xl',
  insights: 'max-w-6xl',
  profile: 'max-w-3xl',
};

export const DEFAULT_SECTION_MAX_WIDTH = 'max-w-5xl';

const SECTION_INTROS: Record<string, IntroFn> = {
  dashboard: (isStudent) => ({
    title: 'Ana Dashboard',
    body: `Tüm ilerlemenin tek ekrandaki özeti: toplam odak süren, verimlilik skorun, alışkanlık zincirin, yaklaşan ${
      isStudent ? 'sınav' : 'hedef'
    } tarihin ve Kaptan (AI Koç) o günkü önerisi.`,
    steps: [
      'Üstteki kartlardaki sayılar diğer ekranlardaki gerçek kayıtlarından otomatik hesaplanır.',
      '"Bugün Tekrar Zamanı" listesinden bir konuyu "Bugüne Ekle" ile günlük planına al.',
      'Kaptan kartından tek dokunuşla AI Analiz ekranına geçebilirsin.',
    ],
  }),

  courses: (isStudent) =>
    isStudent
      ? {
          title: 'Derslerim',
          body: 'Bu dönem çalıştığın dersleri ve her dersin konularını burada tutarsın. Takvim, Pomodoro ve AI önerileri hep bu listeden beslenir.',
          steps: [
            'Üstteki alandan bir ders ekle (örn. "Matematik", "Tarih").',
            'Dersin satırını genişletip altına konularını yaz.',
            'Bir konuya dokunup kısa bir mini kontrol yap; ilk tekrar önceliğin oluşsun.',
          ],
        }
      : {
          title: 'Uğraşlarım',
          body: 'Üzerinde çalıştığın uğraşları ve projeleri, alt başlıklarıyla birlikte burada tutarsın. Takvim, Zamanlayıcı ve AI önerileri hep bu listeden beslenir.',
          steps: [
            'Üstteki alandan bir uğraş ekle (örn. "Gitar", "Kişisel Blog Projesi").',
            'Uğraşın satırını genişletip alt başlıklarını yaz.',
            'Bir alt başlığa dokunup kısa bir öz-değerlendirme yap; ilk tekrar önceliğin oluşsun.',
          ],
        },

  planner: (isStudent) =>
    isStudent
      ? {
          title: 'Çalışma & Pomodoro',
          body: 'Odak ve mola sürelerini dönüşümlü çalıştıran bir Pomodoro zamanlayıcısı ve günlük çalışma listesi. Her oturumun sonunda çalışmanı kaydedersin.',
          steps: [
            'Soldan bir ders ve konu seç, sağdaki listeye günün görevlerini ekle.',
            'Odak / Kısa Mola / Uzun Mola sekmesini seçip "Başlat"a bas.',
            'Oturum bitince açılan formda zorluk ve verimliliği işaretle; Kaptan sana bir öncelik verir.',
          ],
        }
      : {
          title: 'Odak & Zamanlayıcı',
          body: 'Derin odaklanma için mola aralıklı bir zamanlayıcı ve günlük yapılacaklar listesi. Bir uğraşına odaklanıp her oturumun sonunda ne yaptığını kaydedersin.',
          steps: [
            'Hangi uğraşın üzerine çalışacağını yaz, sağdaki listeye günün görevlerini ekle.',
            'Odak / Kısa Mola / Uzun Mola sekmesini seçip "Başlat"a bas.',
            'Oturum bitince açılan formda zorluk ve verimliliği işaretle; Kaptan sana bir öncelik verir.',
          ],
        },

  calendar: (isStudent) =>
    isStudent
      ? {
          title: 'Takvim',
          body: 'Haftalık ders programın ve sınav tarihlerin bir arada. Sınav geri sayımı ve tekrar planı bu tarihlere göre işler.',
          steps: [
            'Haftalık ızgaraya tekrar eden çalışma saatlerini ekle.',
            '"Sınav Ekle" ile ÖSYM takviminden (TYT, AYT, KPSS, LGS...) ya da kendi okul derslerinden seç.',
            'Hedef puanını gir; Dashboard sana kalan günü göstersin.',
          ],
        }
      : {
          title: 'Takvim',
          body: 'Haftalık çalışma programın ve hedef tarihlerin bir arada. Hedef geri sayımı ve tekrar planı bu tarihlere göre işler.',
          steps: [
            'Haftalık ızgaraya tekrar eden çalışma saatlerini ekle.',
            '"Hedef Ekle" ile bir teslim tarihi ya da kişisel kilometre taşı oluştur.',
            'İlgili uğraşları seç; Dashboard sana kalan günü göstersin.',
          ],
        },

  growth: () => ({
    title: 'Habit & Journal Hub',
    body: 'Solda alışkanlık takibi (günlük işaretleme ve zincir sayacı), sağda kısa bir günlük. Günlüğe yazdıkça AI ruh halini analiz eder.',
    steps: [
      'Bir alışkanlık ekle ve her gün tamamladıkça kutucuğu işaretle; zincirini kırma.',
      'Günün ruh halini bir emoji ile seç ve birkaç cümle yaz.',
      'Kaptan, moralin düşükken önerilerinin tonunu buna göre yumuşatır.',
    ],
  }),

  insights: (isStudent) => ({
    title: 'AI Analiz & Koç',
    body: 'Çalışma oturumların ve mini kontrollerinden öğrenen modeller burada iki şey üretir: hangi konuya öncelik vermen gerektiğine dair tahminler ve "Kaptan" dediğimiz AI koçun sana özel yazılı yorumları.',
    steps: [
      'Öneri kartındaki "Kontrol Et" ile bir konuyu yeniden değerlendir, tahmin güncellensin.',
      'Her önerinin altındaki 👍 / 👎 ile modeli kendine göre ayarla.',
      `Bir ${isStudent ? 'ders' : 'uğraş'} için "AI Yorumu Al" diyerek Kaptan'dan durum değerlendirmesi iste.`,
    ],
  }),

  profile: () => ({
    title: 'Profilim',
    body: 'Hesap bilgilerin ve uygulama ayarların. Adını, e-postanı ve eğitim seviyeni buradan güncellersin.',
    steps: [
      'Bilgilerini değiştirmek için "Düzenle"ye bas; e-postanı değiştirirsen yeni bir doğrulama kodu gelir.',
      '"Platform Modu" ile Öğrenci ve Gelişim görünümü arasında geçiş yap.',
      'Gizlediğin rehber kartlarını buradan yeniden açabilirsin.',
    ],
  }),
};

// Bölüm içindeki tekil araçları tanıtan küçük ipuçları. Bölüm kartından farklı
// olarak sessiz bir "... nedir?" bağlantısı olarak durur, tıklayınca açılır.
const FEATURE_HINTS: Record<string, IntroFn> = {
  kaptan: () => ({
    title: 'Kaptan (AI Koç)',
    body: 'Uygulama boyunca karşına çıkan menekşe rehber. Çalışma verilerinden öğrenip o an en çok işine yarayacak öneriyi verir; moralin düşükken tonunu yumuşatır.',
    steps: [
      'Bu kart en güncel öneriyi özetler.',
      '"AI Analiz\'e Git" ile tüm önerilerin ve gerekçelerinin olduğu ekrana geçersin.',
      'Önerilere 👍 / 👎 verdikçe Kaptan seni daha iyi tanır.',
    ],
  }),

  'spaced-repetition': () => ({
    title: 'Bugün Tekrar Zamanı',
    body: 'Bir konuyu unutmaya başlamadan önce, tam tekrar edilmesi gereken gün karşına çıkarır (aralıklı tekrar). Liste, modelin önerdiği ve senin kabul ettiğin hatırlatmaları birleştirir.',
    steps: [
      'Bir konuyu "Bugüne Ekle" ile Pomodoro ekranındaki günlük plana aktar.',
      '"Kişisel Hatırlatma" etiketi, daha önce senin kabul ettiğin bir hatırlatmadır.',
      'Liste boşsa o gün tekrar bekleyen bir şey yok demektir.',
    ],
  }),

  pomodoro: () => ({
    title: 'Pomodoro Sayacı',
    body: 'Odak ve mola sürelerini dönüşümlü çalıştıran zamanlayıcı. Süre bitince çalışmanı kaydedip zorluk ve verimlilik puanı verirsin.',
    steps: [
      'Odak / Kısa Mola / Uzun Mola sekmesini seç; istersen süreyi elle değiştir.',
      '"Başlat"a bas; sayaç biterken uyarı alırsın.',
      'Oturum sonu formunda zorluk ve verimliliği işaretle; kayıt Dashboard metriklerine yansır.',
    ],
  }),

  'daily-tasks': () => ({
    title: 'Bugün Ne Çalışacağım?',
    body: 'O güne ait kısa bir yapılacaklar listesi. Bir maddeden doğrudan ona bağlı bir Pomodoro oturumu başlatabilirsin.',
    steps: [
      "Bir madde ekle; Dashboard'daki tekrar listesinden de buraya aktarabilirsin.",
      'Maddenin yanındaki "Oturum Başlat" sayacı o göreve bağlar.',
      'Bitirdiklerini işaretle.',
    ],
  }),

  'mini-check': (isStudent) => ({
    title: 'Mini Kontrol',
    body: `Bir ${
      isStudent ? 'konu' : 'alt başlık'
    } için 1-2 dakikalık öz-değerlendirme. "Doğru/yanlış yaptım" dersin; model buna ve süreye bakıp o an için bir tekrar önceliği hesaplar.`,
    steps: [
      `Listede bir ${isStudent ? 'konuya' : 'alt başlığa'} dokunup kontrolü başlat.`,
      'Kendini dürüstçe değerlendir; amaç not değil, doğru önceliği bulmak.',
      'Çıkan Yüksek/Orta/Düşük öncelik neyi önce çalışacağını söyler.',
    ],
  }),

  'priority-score': () => ({
    title: 'Öncelik Puanı',
    body: 'Yüksek / Orta / Düşük Öncelik etiketi, modelin "bunu ne kadar acil tekrar etmelisin" tahminidir. Çalışma süresi, zorluk, aradan geçen süre ve mini kontrol sonuçlarından hesaplanır.',
    steps: [
      'Yüksek Öncelik: yakında unutma riski var, öne al.',
      'Düşük Öncelik: oturmuş görünüyor, sonraya bırakılabilir.',
      '"Kontrol Et" ile güncel bir öz-değerlendirme yapınca puan yeniden hesaplanır.',
    ],
  }),

  'habit-matrix': () => ({
    title: 'Alışkanlık Matrisi',
    body: 'Eklediğin alışkanlıkların son 5 günlük işaretleme ızgarası ve kesintisiz gün sayısı (zincir). Zincir, düzenliliği görünür kılmak içindir.',
    steps: [
      'Bir alışkanlık ekle (örn. "30 dk okuma").',
      'Her yaptığın gün o günün kutusunu işaretle.',
      'En iyi zincirin 3 günü geçince küçük bir kutlama belirir.',
    ],
  }),

  'journal-sentiment': () => ({
    title: 'Günlük & Duygu Analizi',
    body: 'Günün ruh halini bir emoji ile seçip birkaç cümle yazdığın kısa günlük. Yazdığın metni AI analiz edip bir duygu puanı çıkarır.',
    steps: [
      'Bir emoji seç, aklından geçeni yaz, kaydet.',
      'Geçmiş girişlerin altta listelenir.',
      'Kaptan, son günlüğün moralinin düşük olduğunu gösteriyorsa önerilerini daha nazik verir.',
    ],
  }),
};

export const SECTION_INTRO_IDS = Object.keys(SECTION_INTROS);
export const FEATURE_HINT_IDS = Object.keys(FEATURE_HINTS);

export function getSectionIntro(tabId: string, isStudent: boolean): IntroContent | null {
  return SECTION_INTROS[tabId]?.(isStudent) ?? null;
}

export function getFeatureHint(hintId: string, isStudent: boolean): IntroContent | null {
  return FEATURE_HINTS[hintId]?.(isStudent) ?? null;
}
