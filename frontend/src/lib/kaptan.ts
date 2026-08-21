import type { PriorityLevel, SubjectHistoryEntry } from './apiClient';

interface KaptanMessageInput {
  id: string;
  firstName: string;
  priority: PriorityLevel;
  topicName: string | null;
  subjectName: string | null;
  mood?: string | null; // Son günlük kaydındaki ruh hali emojisi (GrowthHub'daki MOODS)
}

function hashToIndex(str: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash % mod;
}

type Variant = (firstName: string, topic: string) => { title: string; content: string };

const TEMPLATES: Record<PriorityLevel, Variant[]> = {
  YUKSEK: [
    (f, t) => ({
      title: "Kaptan'dan Uyarı",
      content: `${f}, ${t} konusunda unutma riski yükseliyor. Bugün ya da yarın kısa bir tekrar yapman iyi olur.`,
    }),
    (f, t) => ({
      title: 'Kaptan Dikkat Çekiyor',
      content: `${f}, ${t} için biraz geciktin gibi görünüyor. Az bir zaman ayırıp tekrar etsen, kalıcılığı çok artar.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Not",
      content: `${f}, ${t} konusu şu an öncelikli listede. Kısa bir tekrarla bunu hızlıca toparlayabilirsin.`,
    }),
  ],
  ORTA: [
    (f, t) => ({
      title: "Kaptan'dan Not",
      content: `${f}, ${t} konusunda gidişat fena değil ama gözden kaçırma. Önümüzdeki birkaç gün içinde bir tekrar iyi olur.`,
    }),
    (f, t) => ({
      title: 'Kaptan Değerlendiriyor',
      content: `${f}, ${t} tarafında istikrarlısın. Yine de arada bir göz atmakta fayda var.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Hatırlatma",
      content: `${f}, ${t} konusu orta öncelikli. Fazla acele etmene gerek yok ama tamamen unutma.`,
    }),
  ],
  DUSUK: [
    (f, t) => ({
      title: "Kaptan'dan Tebrikler",
      content: `Aferin ${f}, ${t} konusunda gayet iyi durumdasın. Şimdilik ekstra bir şey yapmana gerek yok.`,
    }),
    (f, t) => ({
      title: 'Kaptan Gülümsüyor',
      content: `${f}, ${t} sağlam görünüyor. Bu konuyu bir süre rahat bırakabilirsin.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan İyi Haber",
      content: `${f}, ${t} konusunda gerçekten iyisin. Enerjini başka bir konuya ayırabilirsin.`,
    }),
  ],
};

// Kullanıcı günlüğüne "yorgun"/"keyifsiz" moduyla yazdıysa, öncelik ne olursa olsun
// Kaptan baskı yapmak yerine nazik ve anlayışlı bir tonla konuşur.
const LOW_MOODS = new Set(['😔', '😴']);

const GENTLE_TEMPLATES: Record<PriorityLevel, Variant[]> = {
  YUKSEK: [
    (f, t) => ({
      title: 'Kaptan Yanında',
      content: `${f}, ${t} biraz bekleyebilir. Bugün sadece küçük bir adım at, o bile yeter — dinlenmek de sürecin bir parçası.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Nazik Bir Not",
      content: `${f}, bazı günler zor geçer, biliyorum. ${t} için acele etme, hazır olduğunda birlikte bakarız.`,
    }),
    (f, t) => ({
      title: 'Kaptan Sakin Sesleniyor',
      content: `${f}, bugün kendine nazik davran. ${t} seni bekliyor ama önce bir nefes al.`,
    }),
  ],
  ORTA: [
    (f, t) => ({
      title: "Kaptan'dan Ilık Bir Söz",
      content: `${f}, ${t} için acelen yok. Kendine biraz zaman tanı.`,
    }),
    (f, t) => ({
      title: 'Kaptan Anlayışla Yaklaşıyor',
      content: `${f}, bugün yorgun görünüyorsun. ${t}'e istediğin an dönebilirsin, baskı yok.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Küçük Bir Hatırlatma",
      content: `${f}, ${t} orta öncelikli — ama bugün kendine iyi bakmak daha öncelikli olabilir.`,
    }),
  ],
  DUSUK: [
    (f, t) => ({
      title: 'Kaptan Gülümsüyor',
      content: `${f}, ${t} zaten sağlam durumda. Bugün dinlenmene hiçbir engel yok.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan İyi Haber",
      content: `${f}, ${t} konusunda gerçekten iyisin. Bugünü kendine ayırabilirsin.`,
    }),
    (f, t) => ({
      title: 'Kaptan Sakin',
      content: `${f}, ${t} güvende. Enerjini bugün kendine sakla.`,
    }),
  ],
};

export function getKaptanMessage(input: KaptanMessageInput): { title: string; content: string } {
  const topic = input.topicName ?? input.subjectName ?? 'bu konu';
  const firstName = input.firstName || 'arkadaşım';
  const isLowMood = !!input.mood && LOW_MOODS.has(input.mood);
  const variants = (isLowMood ? GENTLE_TEMPLATES : TEMPLATES)[input.priority];
  const variant = variants[hashToIndex(input.id, variants.length)];
  return variant(firstName, topic);
}

// --- Oturum sonu geri bildirimi (zorluk + verimlilik) icin Kaptan mesaji ---
// getKaptanMessage yalnizca ML onceligine gore konusur; bu, kullanicinin oturum
// bitince kendi bildirdigi zorluk/verimlilik algisina gore konusur - ML kapali
// olsa bile calisir, cunku bu geri bildirim her zaman elimizde.

interface KaptanSessionMessageInput {
  id: string;
  firstName: string;
  priority: PriorityLevel | null;
  difficulty: number; // 1-5
  productivity: number; // 1-5
  topicName: string | null;
  subjectName: string | null;
}

type DifficultyBucket = 'KOLAY' | 'ORTA_ZORLUK' | 'ZOR';
type ProductivityBucket = 'DUSUK_VERIM' | 'ORTA_VERIM' | 'YUKSEK_VERIM';

function bucketDifficulty(value: number): DifficultyBucket {
  if (value <= 2) return 'KOLAY';
  if (value === 3) return 'ORTA_ZORLUK';
  return 'ZOR';
}

function bucketProductivity(value: number): ProductivityBucket {
  if (value <= 2) return 'DUSUK_VERIM';
  if (value === 3) return 'ORTA_VERIM';
  return 'YUKSEK_VERIM';
}

const SESSION_TEMPLATES: Record<DifficultyBucket, Record<ProductivityBucket, Variant[]>> = {
  KOLAY: {
    DUSUK_VERIM: [
      (f, t) => ({
        title: 'Kaptan Dikkat Çekiyor',
        content: `${f}, ${t} aslında kolaydı ama bugün pek odaklanamamışsın gibi. Belki ortamı değiştirmek ya da kısa bir mola işini görür.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gözlemliyor',
        content: `${f}, ${t} kolay bir konuydu ama dikkat biraz dağınıktı sanki. Bir dahaki sefere dikkat dağıtıcıları uzak tut.`,
      }),
    ],
    ORTA_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Sakin Bir Not",
        content: `${f}, ${t} rahat geçti, verim de fena değildi. Böyle devam.`,
      }),
      (f, t) => ({
        title: 'Kaptan Memnun',
        content: `${f}, ${t} kolay geçti ve idare eder bir tempoda ilerledin. Gayet makul bir çalışma oldu.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Alkış",
        content: `${f}, ${t} hem kolaydı hem de tam odaklandın. Bu tempoyla biraz daha zorlu bir konuya geçmeyi düşünebilirsin.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gülümsüyor',
        content: `${f}, ${t} sende hiç iz bırakmadı, o kadar akıcıydı. Kendine daha zorlu bir konu seçmeye ne dersin?`,
      }),
    ],
  },
  ORTA_ZORLUK: {
    DUSUK_VERIM: [
      (f, t) => ({
        title: 'Kaptan Anlayışla Bakıyor',
        content: `${f}, ${t} orta zorluktaydı ama bugün verim düşük kalmış. Herkesin böyle günleri olur, kendine yüklenme.`,
      }),
      (f, t) => ({
        title: "Kaptan'dan Nazik Bir Söz",
        content: `${f}, ${t} zorlu değildi ama bugün enerjin düşük görünüyor. Kısa bir mola alıp tazelenmek iyi gelebilir.`,
      }),
    ],
    ORTA_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Not",
        content: `${f}, ${t} orta zorlukta, orta tempoda geçti — dengeli bir çalışma oldu.`,
      }),
      (f, t) => ({
        title: 'Kaptan Takip Ediyor',
        content: `${f}, ${t} konusunda istikrarlı ilerliyorsun. Bu tempo sürdürülebilir görünüyor.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Tebrikler",
        content: `${f}, ${t} orta zorluktaydı ama sen tam odaklandın. Gurur duyulacak bir çalışma oldu.`,
      }),
      (f, t) => ({
        title: 'Kaptan Memnun',
        content: `${f}, ${t} konusunda hem odaklı hem hızlıydın. Bu formu koru.`,
      }),
    ],
  },
  ZOR: {
    DUSUK_VERIM: [
      (f, t) => ({
        title: 'Kaptan Yanında',
        content: `${f}, ${t} gerçekten zor bir konuydu ve yorulmuş olman çok normal. Bugün küçük bir adım attıysan bile yeterli, dinlenmek de sürecin bir parçası.`,
      }),
      (f, t) => ({
        title: "Kaptan'dan Şefkatli Bir Söz",
        content: `${f}, zorlu bir konuda enerjinin düşmesi kadar doğal bir şey yok. ${t}'e yarın daha dinç dönebilirsin.`,
      }),
    ],
    ORTA_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Takdir",
        content: `${f}, ${t} zorlu bir çalışma olmasına rağmen makul bir tempoda ilerledin. Bu gayet iyi bir performans.`,
      }),
      (f, t) => ({
        title: 'Kaptan Takip Ediyor',
        content: `${f}, ${t} kolay değildi ama pes etmedin. Tempoyu koruyarak devam edebilirsin.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Büyük Takdir",
        content: `${f}, ${t} zorlu bir konuydu ve sen bu kadar dinç kaldın — bu gerçekten etkileyici. Bugün kendine güzel bir mola hak ettin.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gururlu',
        content: `${f}, ${t} gibi zorlu bir konuda bu kadar verimli çalışman inanılmaz. Az bulunur bir performans oldu bu.`,
      }),
    ],
  },
};

const PRIORITY_NOTE: Record<PriorityLevel, (topic: string) => string> = {
  YUKSEK: (t) => ` Bu arada ${t} tarafında unutma riski artıyor, yakın zamanda bir tekrar şart.`,
  ORTA: (t) => ` ${t} için önümüzdeki günlerde bir tekrar planlamakta fayda var.`,
  DUSUK: (t) => ` ${t} tarafında durum sağlam, şimdilik ekstra bir şey yapmana gerek yok.`,
};

export function getKaptanSessionMessage(input: KaptanSessionMessageInput): { title: string; content: string } {
  const topic = input.topicName ?? input.subjectName ?? 'bu konu';
  const firstName = input.firstName || 'arkadaşım';
  const variants = SESSION_TEMPLATES[bucketDifficulty(input.difficulty)][bucketProductivity(input.productivity)];
  const base = variants[hashToIndex(input.id, variants.length)](firstName, topic);
  const note = input.priority ? PRIORITY_NOTE[input.priority](topic) : '';
  return { title: base.title, content: `${base.content}${note}` };
}

// --- Ders/uğraş bazlı çalışma geçmişi yorumu (ücretsiz, tamamen client-side yedek) ---
// AI Analiz ekranındaki "AI Yorumu Al" akışı Gemini API'ye ulaşamadığında (kredi bitmesi,
// anahtar yok, ağ hatası) ücretli başka bir modele geçmek yerine buraya düşer - hiçbir API
// çağrısı yapmaz, subjectId'ye göre deterministik seçim yapar (aynı hashToIndex deseni).

type HourBucket = 'AZ' | 'ORTA' | 'COK';

function bucketHours(hours: number): HourBucket {
  if (hours < 2) return 'AZ';
  if (hours < 8) return 'ORTA';
  return 'COK';
}

type HistoryTimeVariant = (label: string, name: string, hours: string, sessionCount: number) => string;

const HISTORY_TIME_TEMPLATES: Record<HourBucket, HistoryTimeVariant[]> = {
  AZ: [
    (label, _name, hours) =>
      `${label} tarafında henüz ${hours} saatlik kısa bir başlangıç yapmışsın. Küçük adımlarla da olsa düzenli tekrar, uzun ama seyrek çalışmalardan daha iyi sonuç verir - biraz daha sıklaştırmayı dene.`,
    (_label, name, hours) =>
      `${name} konusuna henüz yeni başlamışsın, toplam ${hours} saat var şu an. Bu bir başlangıç, önemli olan bırakmamak.`,
  ],
  ORTA: [
    (_label, name, hours, count) =>
      `${name} için ${hours} saat, ${count} ayrı oturum birikmiş. İstikrarlı gidiyorsun - bu tempoyu korumak, ani sıçramalardan daha değerli.`,
    (label, _name, hours) =>
      `${label} tarafında ${hours} saatlik makul bir mesafe kat etmişsin. Düzenli görünüyor, böyle devam.`,
  ],
  COK: [
    (_label, name, hours, count) =>
      `${name} için ${hours} saat, ${count} oturum birikmiş - bu ciddi bir emek. İyi gidiyorsun, kendine bir mola vermeyi de unutma.`,
    (label, _name, hours) =>
      `${label} tarafında ${hours} saatle epey yol kat etmişsin. Bu birikim boşa gitmez, düzenli tekrarla pekiştirmeye devam et.`,
  ],
};

type TopicCountBucket = 'AZ' | 'ORTA' | 'COK';

function bucketTopicCount(count: number): TopicCountBucket {
  if (count <= 1) return 'AZ';
  if (count <= 4) return 'ORTA';
  return 'COK';
}

type HistoryTopicsVariant = (label: string, name: string, count: number) => string;

const HISTORY_TOPICS_TEMPLATES: Record<TopicCountBucket, HistoryTopicsVariant[]> = {
  AZ: [
    (_label, name) =>
      `${name} tarafında henüz süreli bir oturum kaydın yok, sadece bir mini kontrol yapmışsın. Bir Pomodoro oturumuyla gerçek bir başlangıç yapmaya ne dersin?`,
  ],
  ORTA: [
    (_label, name, count) =>
      `${name} tarafında ${count} konuda mini kontrol yapmışsın ama henüz süreli bir oturum kaydı yok. Bu konulardan birini seçip kısa bir odak seansı denemek iyi bir sonraki adım olur.`,
  ],
  COK: [
    (_label, name, count) =>
      `${name} tarafında ${count} farklı konuyu mini kontrolden geçirmişsin - iyi bir keşif olmuş. Şimdi bunlardan öne çıkanı seçip gerçek bir çalışma seansına dönüştürme vakti.`,
  ],
};

export function getSubjectHistoryFallbackComment(entry: SubjectHistoryEntry, isStudent: boolean): { title: string; content: string } {
  const label = isStudent ? 'Ders' : 'Uğraş';
  const title = "Kaptan'ın Yorumu";

  if (entry.displayMode === 'TIME' && entry.time) {
    const hours = (entry.time.totalMinutes / 60).toFixed(1);
    const variants = HISTORY_TIME_TEMPLATES[bucketHours(entry.time.totalMinutes / 60)];
    const variant = variants[hashToIndex(entry.subjectId, variants.length)];
    return { title, content: variant(label, entry.subjectName, hours, entry.time.sessionCount) };
  }

  const topicCount = entry.topics?.length ?? 0;
  const variants = HISTORY_TOPICS_TEMPLATES[bucketTopicCount(topicCount)];
  const variant = variants[hashToIndex(entry.subjectId, variants.length)];
  return { title, content: variant(label, entry.subjectName, topicCount) };
}
