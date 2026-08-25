import rateLimit from "express-rate-limit";

// Giriş/kayıt/şifre sıfırlama gibi genel auth uçları için kaba kuvvet koruması.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar dene." },
});

// E-posta kodu gönderen uçlar (doğrulama/şifremi unuttum) - gerçek e-posta gönderimi
// tetiklediği için daha sıkı: hem maliyet hem başkasının kutusunu spam'lememek için.
export const emailCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla kod isteği gönderildi. Lütfen bir süre sonra tekrar dene." },
});

// /auth/refresh - login/register kadar sik denenen bir kaba-kuvvet hedefi degil,
// normal oturum-surdurme trafigi (access token her sure doldugunda tetikleniyor),
// o yuzden daha gevsek.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla oturum yenileme denemesi. Lütfen birkaç dakika sonra tekrar dene." },
});