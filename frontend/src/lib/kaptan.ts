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
      title: "Kaptan'dan Acil Çağrı 🚨",
      content: `${f}, ${t} sularında rotan tehlikeli şekilde kayıyor! Dümeni hemen bu tarafa kır, yakın zamanda tekrar etmelisin.`,
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
      title: "Kaptan'dan Tebrikler ⚓",
      content: `Aferin ${f}! ${t} sularında gemin dümdüz gidiyor. Şimdilik bu rotaya devam, düşük öncelikli.`,
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

const GREETINGS: string[] = [
  'Selam, ben Kaptan! Bugün hangi sularda ilerliyoruz?',
  'Rotanı çizmeye hazır mısın? Kaptan seninle.',
  'Güverteye hoş geldin! Bugün nasıl hissediyorsun?',
  'Ben Kaptan — dümeni birlikte tutalım mı?',
  'Yeni bir sefere çıkmaya var mısın? Kaptan burada.',
  'Pusulanı ayarlayalım, bugün nereye gidiyoruz?',
  'Selam denizci! Bugün nasıl gidiyor?',
  'Kaptan konuşuyor: küçük adımlar büyük rota farkı yaratır.',
];

export function getRandomGreeting(): string {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}
