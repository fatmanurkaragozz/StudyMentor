-- AlterEnum
ALTER TYPE "EducationLevel" ADD VALUE 'EXAM_PREP';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "examCategory" "ExamCategory";

-- CreateEnum
CREATE TYPE "UserMode" AS ENUM ('STUDENT', 'LIFELONG_LEARNER');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "mode" "UserMode";

-- Backfill: gecmiste hangi modda eklendiginin kaydi tutulmuyordu, mevcut tum
-- kullaniciya-ozel (userId dolu) dersler/ugraslar STUDENT olarak varsayiliyor.
UPDATE "Subject" SET "mode" = 'STUDENT' WHERE "userId" IS NOT NULL AND "mode" IS NULL;

-- DropIndex
DROP INDEX "Subject_name_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_userId_mode_key" ON "Subject"("name", "userId", "mode");
