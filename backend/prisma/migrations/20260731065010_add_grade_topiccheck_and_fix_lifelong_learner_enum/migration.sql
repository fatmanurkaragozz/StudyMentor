-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('YUKSEK', 'ORTA', 'DUSUK');

-- AlterEnum
ALTER TYPE "EducationLevel" ADD VALUE 'LIFELONG_LEARNER';

-- AlterTable
ALTER TABLE "AIRecommendation" ADD COLUMN     "topicId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "grade" INTEGER;

-- CreateTable
CREATE TABLE "TopicCheck" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "opportunity" INTEGER NOT NULL,
    "attemptCount" INTEGER,
    "hintCount" INTEGER,
    "msFirstResponse" DOUBLE PRECISION,
    "overlapTimeMs" DOUBLE PRECISION,
    "selfGradedCorrect" BOOLEAN,
    "correctProbability" DOUBLE PRECISION,
    "priority" "PriorityLevel",
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "TopicCheck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TopicCheck" ADD CONSTRAINT "TopicCheck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicCheck" ADD CONSTRAINT "TopicCheck_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRecommendation" ADD CONSTRAINT "AIRecommendation_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
