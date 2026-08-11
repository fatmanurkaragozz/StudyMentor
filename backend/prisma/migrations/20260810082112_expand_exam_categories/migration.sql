-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExamCategory" ADD VALUE 'LGS';
ALTER TYPE "ExamCategory" ADD VALUE 'TYT';
ALTER TYPE "ExamCategory" ADD VALUE 'AYT';
ALTER TYPE "ExamCategory" ADD VALUE 'YDT';
ALTER TYPE "ExamCategory" ADD VALUE 'KPSS_EGITIM_BILIMLERI';
ALTER TYPE "ExamCategory" ADD VALUE 'DGS';
ALTER TYPE "ExamCategory" ADD VALUE 'YOKDIL_FEN';
ALTER TYPE "ExamCategory" ADD VALUE 'YOKDIL_SOSYAL';
ALTER TYPE "ExamCategory" ADD VALUE 'YOKDIL_SAGLIK';
ALTER TYPE "ExamCategory" ADD VALUE 'AGS';
ALTER TYPE "ExamCategory" ADD VALUE 'YDS';
