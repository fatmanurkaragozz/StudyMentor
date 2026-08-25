-- AlterTable: mode nullable once - backfilled below from the owning user's real
-- educationLevel at migration time, then locked to NOT NULL. Elle duzenlendi (prisma
-- migrate dev --create-only'nin ureettigi ham SQL, var olan satirlar yuzunden dogrudan
-- NOT NULL ekleyemiyordu).
ALTER TABLE "Habit" ADD COLUMN "mode" "UserMode";
ALTER TABLE "Journal" ADD COLUMN "mode" "UserMode";

UPDATE "Habit" h
SET "mode" = CASE WHEN u."educationLevel" = 'LIFELONG_LEARNER' THEN 'LIFELONG_LEARNER' ELSE 'STUDENT' END::"UserMode"
FROM "User" u
WHERE u.id = h."userId";

UPDATE "Journal" j
SET "mode" = CASE WHEN u."educationLevel" = 'LIFELONG_LEARNER' THEN 'LIFELONG_LEARNER' ELSE 'STUDENT' END::"UserMode"
FROM "User" u
WHERE u.id = j."userId";

ALTER TABLE "Habit" ALTER COLUMN "mode" SET NOT NULL;
ALTER TABLE "Journal" ALTER COLUMN "mode" SET NOT NULL;
