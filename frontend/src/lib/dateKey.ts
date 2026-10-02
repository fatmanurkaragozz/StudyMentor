// Gun anahtarlari (YYYY-MM-DD) kullanicinin YEREL gunune gore uretiliyor. toISOString() UTC'ye
// gore urettigi icin Turkiye'de 00:00-03:00 arasinda "bugun"u dun sayiyordu.
const pad = (n: number) => n.toString().padStart(2, '0');

export const localDateKey = (date: Date = new Date()) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const parseDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key: string, days: number) => {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
};

/** Anahtarin dustugu yerel ayin [ay basi, sonraki ay basi) araligi, ISO - backend'e aralik filtresi olarak gider. */
export const localMonthRange = (key: string) => {
  const date = parseDateKey(key);
  return {
    from: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString(),
  };
};

/** Yerel saat, "HH:mm". */
export const timeOfDay = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** Planin saat araligi: "15:00–16:00", sadece baslangic varsa "15:00", saatsiz planda bos. */
export const formatPlanTime = (startTime: string | null, endTime: string | null) =>
  startTime ? (endTime ? `${startTime}–${endTime}` : startTime) : '';
