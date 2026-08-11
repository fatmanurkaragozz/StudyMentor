import { z } from "zod";

const educationLevelSchema = z.enum(["MIDDLE_SCHOOL", "HIGH_SCHOOL", "UNIVERSITY", "LIFELONG_LEARNER"]);

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  educationLevel: educationLevelSchema,
  grade: z.number().int().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  educationLevel: educationLevelSchema.optional(),
  grade: z.number().int().optional(),
});

export const createCustomSubjectSchema = z.object({
  name: z.string().min(1).max(80),
});

export const addTopicSchema = z.object({
  name: z.string().min(1).max(80),
});

export const createScheduleSlotSchema = z.object({
  subjectId: z.string().min(1),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().max(80).optional(),
});

const examCatalogCategories = [
  "LGS",
  "TYT",
  "AYT",
  "YDT",
  "KPSS",
  "KPSS_EGITIM_BILIMLERI",
  "ALES",
  "DGS",
  "YOKDIL",
  "YOKDIL_FEN",
  "YOKDIL_SOSYAL",
  "YOKDIL_SAGLIK",
  "AGS",
  "YDS",
] as const;

const examCategorySchema = z.enum([...examCatalogCategories, "OTHER"]);

export const createExamSchema = z.object({
  name: z.string().min(1).max(120),
  date: z.string().min(1),
  targetScore: z.number().optional(),
  subjectIds: z.array(z.string().min(1)).min(1),
  examCategory: examCategorySchema.optional(),
});

export const examCatalogParamsSchema = z.object({
  category: z.enum(examCatalogCategories),
});

export const updateExamSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  date: z.string().min(1).optional(),
  targetScore: z.number().nullable().optional(),
  resultScore: z.number().nullable().optional(),
  subjectIds: z.array(z.string().min(1)).min(1).optional(),
  examCategory: examCategorySchema.optional(),
});

export const startTopicCheckSchema = z.object({
  topicId: z.string().min(1),
});

export const submitTopicCheckSchema = z.object({
  attemptCount: z.number().int().min(1),
  hintCount: z.number().int().min(0),
  msFirstResponse: z.number().min(0),
  overlapTimeMs: z.number().min(0),
  selfGradedCorrect: z.boolean(),
});

export const createStudySessionSchema = z.object({
  subjectId: z.string().min(1),
  topicId: z.string().min(1),
  durationMinutes: z.number().int().min(1),
  difficulty: z.number().int().min(1).max(5),
  productivity: z.number().int().min(1).max(5),
  notes: z.string().optional(),
});

export const createHabitSchema = z.object({
  name: z.string().min(1).max(80),
});

export const toggleHabitLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const createJournalSchema = z.object({
  content: z.string().min(1),
  mood: z.string().min(1).max(4),
});

export const createDailyTaskSchema = z.object({
  subjectId: z.string().min(1),
  topicId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const completeDailyTaskSchema = z.object({
  studySessionId: z.string().min(1),
});
