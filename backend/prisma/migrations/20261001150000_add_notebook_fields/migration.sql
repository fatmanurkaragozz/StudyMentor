-- Defterim: calisma oturumunun baslangic saati + serbest metinli/saatli gunluk planlar.
-- Elle duzenlendi (prisma migrate diff ciktisi + asagidaki backfill).

-- AlterTable: eski oturumlarda bos kalir, arayuz createdAt - sure ile tahmini aralik gosterir.
ALTER TABLE "StudySession" ADD COLUMN     "startedAt" TIMESTAMP(3);

-- AlterTable: DEFAULT 'STUDENT', migration ile yeni backend deploy'u arasinda canlidaki eski
-- backend'in (mode gondermeyen) insert'leri kirilmasin diye.
ALTER TABLE "DailyTask" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "mode" "UserMode" NOT NULL DEFAULT 'STUDENT',
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "subjectId" DROP NOT NULL,
ALTER COLUMN "topicId" DROP NOT NULL;

-- Backfill: mevcut gorevlerin modu dersinden gelir. Kullaniciya ozel dersler kendi modunu
-- tasiyor; global (katalog) dersler STUDENT'ta kalir (subjectHistory.isVisibleInMode ile ayni kural).
UPDATE "DailyTask" t
SET "mode" = s."mode"
FROM "Subject" s
WHERE s.id = t."subjectId" AND s."userId" IS NOT NULL AND s."mode" IS NOT NULL;
