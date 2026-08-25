-- AlterTable: mode nullable once - backfilled below from the owning user's real
-- educationLevel at migration time, then locked to NOT NULL. Elle duzenlendi, ayni
-- desen add_mode_to_habit_and_journal migration'inda kullanildi.
ALTER TABLE "Exam" ADD COLUMN "mode" "UserMode";

UPDATE "Exam" e
SET "mode" = CASE WHEN u."educationLevel" = 'LIFELONG_LEARNER' THEN 'LIFELONG_LEARNER' ELSE 'STUDENT' END::"UserMode"
FROM "User" u
WHERE u.id = e."userId";

ALTER TABLE "Exam" ALTER COLUMN "mode" SET NOT NULL;
