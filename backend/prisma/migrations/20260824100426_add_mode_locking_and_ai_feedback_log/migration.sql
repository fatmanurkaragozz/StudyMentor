-- AlterTable
ALTER TABLE "AIRecommendation" ADD COLUMN     "feedback" "InsightFeedback",
ADD COLUMN     "feedbackReason" TEXT;

-- AlterTable
ALTER TABLE "TopicCheck" ADD COLUMN     "educationLevel" "EducationLevel";

-- CreateTable
CREATE TABLE "SubjectInsightLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "userPrompt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "feedback" "InsightFeedback",
    "feedbackReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectInsightLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubjectInsightLog_userId_subjectId_createdAt_idx" ON "SubjectInsightLog"("userId", "subjectId", "createdAt");

-- AddForeignKey
ALTER TABLE "SubjectInsightLog" ADD CONSTRAINT "SubjectInsightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectInsightLog" ADD CONSTRAINT "SubjectInsightLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
