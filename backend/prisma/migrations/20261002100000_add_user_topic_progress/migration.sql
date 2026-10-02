-- Konu ilerlemesi (lastStudied/nextReview) kullanici basina. Katalog konularinda Topic satiri tum
-- kullanicilarca paylasildigi icin, bir kullanicinin calismasi digerlerininkinin uzerine yaziliyordu.
-- Veri tasinmiyor (temiz baslangic); Topic'teki eski kolonlar ayri bir migration'da kaldirilacak.

-- CreateTable
CREATE TABLE "UserTopicProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "lastStudied" TIMESTAMP(3) NOT NULL,
    "nextReview" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTopicProgress_userId_topicId_key" ON "UserTopicProgress"("userId", "topicId");

-- AddForeignKey
ALTER TABLE "UserTopicProgress" ADD CONSTRAINT "UserTopicProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTopicProgress" ADD CONSTRAINT "UserTopicProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase PostgREST erisimini kapat (bkz. 20260827221702_enable_rls_on_public_tables).
ALTER TABLE "public"."UserTopicProgress" ENABLE ROW LEVEL SECURITY;
