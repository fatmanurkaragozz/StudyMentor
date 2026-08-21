-- CreateIndex
CREATE INDEX "TopicCheck_userId_submittedAt_idx" ON "TopicCheck"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "StudySession_userId_subjectId_idx" ON "StudySession"("userId", "subjectId");
