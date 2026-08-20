import type { PriorityLevel } from './apiClient';

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
      title: "Kaptan'dan Acil Uyarı",
      content: `${f}, ${t} sularında rotan tehlikeli şekilde kayıyor. Dümeni hemen bu tarafa kır, yakın zamanda tekrar etmelisin.`,
    }),
    (f, t) => ({
      title: 'Kaptan Köprüden Sesleniyor',
      content: `${f}, radarda ${t} için kırmızı bir sinyal var. Fırtınaya yakalanmadan şimdi bir mola verip tekrar edelim.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Uyarı",
      content: `${f}, ${t} konusu unutma dalgalarına kapılmak üzere. Gemiyi güvenli limana çekmek için hemen bir tekrar şart.`,
    }),
  ],
  ORTA: [
    (f, t) => ({
      title: "Kaptan'dan Not",
      content: `${f}, ${t} rotasında ilerliyoruz ama pusulayı kontrol etmekte fayda var. Orta vadede bir göz atalım.`,
    }),
    (f, t) => ({
      title: 'Kaptan Güverteden',
      content: `${f}, ${t} sularında hava henüz durgun ama takip etmeye devam edelim — birkaç güne bir tekrar iyi olur.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Hatırlatma",
      content: `${f}, ${t} konusunda rotan fena değil, yine de dümeni sıkı tutmakta fayda var. Orta öncelikli bir tekrar planla.`,
    }),
  ],
  DUSUK: [
    (f, t) => ({
      title: "Kaptan'dan Tebrikler",
      content: `Aferin ${f}, ${t} sularında gemin dümdüz gidiyor. Şimdilik bu rotaya devam, düşük öncelikli.`,
    }),
    (f, t) => ({
      title: 'Kaptan Gülümsüyor',
      content: `${f}, ${t} limanına sapasağlam demir attık. Bu konu şimdilik güvenli sularda, rahat ol.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan İyi Haber",
      content: `${f}, ${t} rotası pürüzsüz görünüyor. Enerjini başka bir sefere ayırabilirsin.`,
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
      content: `${f}, ${t} biraz bekleyebilir. Bugün sadece küçük bir adım at, o bile yeter — dinlenmek de rotanın bir parçası.`,
    }),
    (f, t) => ({
      title: "Kaptan'dan Nazik Bir Not",
      content: `${f}, bazı günler dalgalar sert oluyor, biliyorum. ${t} için acele etme, hazır olduğunda birlikte bakarız.`,
    }),
    (f, t) => ({
      title: 'Kaptan Sakin Sesleniyor',
      content: `${f}, bugün kendine nazik davran. ${t} seni bekliyor ama önce bir nefes al.`,
    }),
  ],
  ORTA: [
    (f, t) => ({
      title: "Kaptan'dan Ilık Bir Söz",
      content: `${f}, ${t} için acelen yok. Kendine biraz zaman tanı, rota hep orada duruyor.`,
    }),
    (f, t) => ({
      title: 'Kaptan Güverteden Fısıldıyor',
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
      title: 'Kaptan Sakin Sularda',
      content: `${f}, ${t} güvende. Enerjini bugün kendine sakla.`,
    }),
  ],
};

export function getKaptanMessage(input: KaptanMessageInput): { title: string; content: string } {
  const topic = input.topicName ?? input.subjectName ?? 'bu konu';
  const firstName = input.firstName || 'Denizci';
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
        content: `${f}, ${t} aslında sakin sulardaydı ama dümende pek durmamışsın gibi. Belki ortamı değiştirmek ya da kısa bir mola işini görür.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gözlemliyor',
        content: `${f}, ${t} kolay bir rotaydı ama odak biraz dağınıktı sanki. Bir dahaki seferde dikkat dağıtıcıları güverteden uzak tut.`,
      }),
    ],
    ORTA_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Sakin Bir Not",
        content: `${f}, ${t} rahat bir seferdi, verim de fena değildi. Böyle devam.`,
      }),
      (f, t) => ({
        title: 'Kaptan Güverteden',
        content: `${f}, ${t} kolay geçti ve idare eder bir tempoda ilerledin. Gayet makul bir sefer oldu.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Alkış",
        content: `${f}, ${t} hem kolaydı hem de tam gaz ilerledin. Bu tempoyla biraz daha zorlu sulara açılmayı düşünebiliriz.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gülümsüyor',
        content: `${f}, ${t} sende iz bırakmadı bile, o kadar akıcıydı. Kendine daha zorlu bir konu seçmeye ne dersin?`,
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
        content: `${f}, ${t} orta zorlukta, orta tempoda geçti — dengeli bir sefer oldu.`,
      }),
      (f, t) => ({
        title: 'Kaptan Güverteden Sesleniyor',
        content: `${f}, ${t} rotasında istikrarlı ilerliyorsun. Bu tempo sürdürülebilir görünüyor.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Tebrikler",
        content: `${f}, ${t} orta zorluktaydı ama sen tam gaz gittin. Gurur duyulacak bir sefer oldu.`,
      }),
      (f, t) => ({
        title: 'Kaptan Memnun',
        content: `${f}, ${t} rotasında hem odaklı hem hızlıydın. Bu formu koru.`,
      }),
    ],
  },
  ZOR: {
    DUSUK_VERIM: [
      (f, t) => ({
        title: 'Kaptan Yanında',
        content: `${f}, ${t} gerçekten sert bir dalgaydı ve yorulmuş olman çok normal. Bugün küçük bir adım attıysan bile yeterli, dinlenmek de rotanın bir parçası.`,
      }),
      (f, t) => ({
        title: "Kaptan'dan Şefkatli Bir Söz",
        content: `${f}, zorlu bir konuda enerjinin düşmesi kadar doğal bir şey yok. ${t}'e yarın daha dinç dönebiliriz.`,
      }),
    ],
    ORTA_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Takdir",
        content: `${f}, ${t} zorlu bir sefer olmasına rağmen makul bir tempoda ilerledin. Bu gayet iyi bir performans.`,
      }),
      (f, t) => ({
        title: 'Kaptan Güverteden',
        content: `${f}, ${t} kolay değildi ama pes etmedin. Tempoyu koruyarak devam edebilirsin.`,
      }),
    ],
    YUKSEK_VERIM: [
      (f, t) => ({
        title: "Kaptan'dan Büyük Takdir",
        content: `${f}, ${t} zorlu bir rotaydı ve sen bu kadar dinç kaldın — bu gerçekten etkileyici. Bugün kendine güzel bir mola hak ettin.`,
      }),
      (f, t) => ({
        title: 'Kaptan Gururlu',
        content: `${f}, ${t} gibi zorlu bir konuda bu kadar verimli çalışman inanılmaz. Az bulunur bir sefer oldu bu.`,
      }),
    ],
  },
};

const PRIORITY_NOTE: Record<PriorityLevel, (topic: string) => string> = {
  YUKSEK: (t) => ` Bu arada ${t} tarafında unutma dalgaları yükseliyor, yakın zamanda bir tekrar şart.`,
  ORTA: (t) => ` ${t} için orta vadede bir tekrar planlamakta fayda var.`,
  DUSUK: (t) => ` ${t} tarafında sular sakin, şimdilik ekstra bir şey yapmana gerek yok.`,
};

export function getKaptanSessionMessage(input: KaptanSessionMessageInput): { title: string; content: string } {
  const topic = input.topicName ?? input.subjectName ?? 'bu konu';
  const firstName = input.firstName || 'Denizci';
  const variants = SESSION_TEMPLATES[bucketDifficulty(input.difficulty)][bucketProductivity(input.productivity)];
  const base = variants[hashToIndex(input.id, variants.length)](firstName, topic);
  const note = input.priority ? PRIORITY_NOTE[input.priority](topic) : '';
  return { title: base.title, content: `${base.content}${note}` };
}
