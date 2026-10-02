-- Gelistirme sirasinda seed.ts'e eklenmis ornek mufredati (SEED_DATA, egitim seviyesine gore 8 ders)
-- bagli kayitlariyla birlikte kaldirir; seed artik sadece sinav katalogunu kuruyor. Gercek sinav
-- kataloglari (examCategory dolu) ve kullanicilarin kendi dersleri (userId dolu) etkilenmez.
-- Seed'i hic calismamis bir veritabaninda hicbir sey yapmaz.

-- AIRecommendation.topic iliskisi SetNull - acikca silinmezse AI Analiz'de konusuz oneri kalirdi.
DELETE FROM "AIRecommendation" r
USING "Topic" t, "Subject" s
WHERE r."topicId" = t.id
  AND t."subjectId" = s.id
  AND s."userId" IS NULL
  AND s."examCategory" IS NULL
  AND (s."educationLevel"::text, s.name) IN (
    ('MIDDLE_SCHOOL', 'Matematik'), ('MIDDLE_SCHOOL', 'Fen Bilimleri'),
    ('HIGH_SCHOOL', 'Matematik'), ('HIGH_SCHOOL', 'Fizik'),
    ('UNIVERSITY', 'Veri Yapıları'), ('UNIVERSITY', 'Lineer Cebir'),
    ('LIFELONG_LEARNER', 'Yazılım Geliştirme'), ('LIFELONG_LEARNER', 'Kişisel Gelişim')
  );

-- Konular, oturumlar, mini kontroller, hatirlatmalar, gunluk gorevler, sinav baglantilari, program
-- satirlari ve AI ders yorumlari ON DELETE CASCADE ile birlikte silinir.
DELETE FROM "Subject" s
WHERE s."userId" IS NULL
  AND s."examCategory" IS NULL
  AND (s."educationLevel"::text, s.name) IN (
    ('MIDDLE_SCHOOL', 'Matematik'), ('MIDDLE_SCHOOL', 'Fen Bilimleri'),
    ('HIGH_SCHOOL', 'Matematik'), ('HIGH_SCHOOL', 'Fizik'),
    ('UNIVERSITY', 'Veri Yapıları'), ('UNIVERSITY', 'Lineer Cebir'),
    ('LIFELONG_LEARNER', 'Yazılım Geliştirme'), ('LIFELONG_LEARNER', 'Kişisel Gelişim')
  );
