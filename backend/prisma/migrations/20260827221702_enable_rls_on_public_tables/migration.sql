-- Supabase Security Advisor "RLS Disabled in Public" uyarilarini gideriyor.
-- Backend'in Prisma baglantisi "postgres" rolunu kullaniyor ve bu rol
-- rolbypassrls=true (dogrulandi) - yani asagidaki hicbir policy eklemeden
-- RLS'i acmak backend'in kendi sorgularini etkilemiyor, sadece Supabase'in
-- otomatik PostgREST API'sinin (anon/service_role anahtariyla) bu tablolara
-- dogrudan erisimini kapatiyor.

ALTER TABLE "public"."ResourceSuggestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SubjectInsight" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."SubjectInsightLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ScheduleSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Topic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."TopicReminder" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."TopicCheck" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."StudySession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Exam" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."DailyTask" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ExamSubject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Habit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."HabitLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Journal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AIRecommendation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
