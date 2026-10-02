-- Konu ilerlemesi artik kullanici basina UserTopicProgress'te (bkz. 20261002100000_add_user_topic_progress);
-- tum kullanicilarca paylasilan Topic satirindaki eski alanlar kaldiriliyor. status hic yazilmiyordu.
-- UYARI: Bu migration, Prisma semasinda bu kolonlar olmayan backend canliya ciktiktan SONRA
-- uygulanmali - aksi halde eski backend her konu sorgusunda bu kolonlari secmeye calisip hata verir.

-- AlterTable
ALTER TABLE "Topic" DROP COLUMN "lastStudied",
DROP COLUMN "nextReview",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "TopicStatus";
