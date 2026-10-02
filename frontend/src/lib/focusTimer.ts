// Odak sayaci kalan sureyi "her saniye 1 azalt" yerine bitis anindan (endsAt, ms) hesapliyor:
// sayac ekrani gizliyken (baska sekme/mod) interval durdugu ve tarayici arka plan sekmelerinde
// setInterval'i yavaslattigi icin, azaltmaya dayali sayac gecen sureyi kacirirdi.
export const secondsUntil = (endsAt: number) => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

export const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
