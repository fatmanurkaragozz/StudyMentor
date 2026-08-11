-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('KPSS', 'YOKDIL', 'ALES', 'OTHER');

-- CreateEnum
CREATE TYPE "DailyTaskStatus" AS ENUM ('PLANNED', 'DONE', 'SKIPPED');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "examCategory" "ExamCategory";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "examCategory" "ExamCategory";

-- CreateTable
CREATE TABLE "DailyTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "DailyTaskStatus" NOT NULL DEFAULT 'PLANNED',
    "studySessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyTask_studySessionId_key" ON "DailyTask"("studySessionId");

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyTask" ADD CONSTRAINT "DailyTask_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
