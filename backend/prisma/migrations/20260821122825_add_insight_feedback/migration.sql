-- CreateEnum
CREATE TYPE "InsightFeedback" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "SubjectInsight" ADD COLUMN     "feedback" "InsightFeedback",
ADD COLUMN     "feedbackReason" TEXT;
