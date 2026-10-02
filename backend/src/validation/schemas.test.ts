import { describe, it, expect } from "vitest";
import { createDailyTaskSchema, createStudySessionSchema } from "./schemas.js";

const validTask = { title: "Tarih tekrar", date: "2026-10-01", mode: "STUDENT" };

describe("createDailyTaskSchema", () => {
  it("serbest metinli, saatli plani kabul eder", () => {
    expect(createDailyTaskSchema.safeParse({ ...validTask, startTime: "15:00", endTime: "16:30" }).success).toBe(true);
  });

  it("ders/konu bagli maddeyi metinsiz kabul eder", () => {
    expect(
      createDailyTaskSchema.safeParse({ subjectId: "s1", topicId: "t1", date: "2026-10-01", mode: "STUDENT" }).success,
    ).toBe(true);
  });

  it("ne metin ne konu varsa reddeder", () => {
    expect(createDailyTaskSchema.safeParse({ date: "2026-10-01", mode: "STUDENT" }).success).toBe(false);
  });

  it("ders olmadan konu (ya da tersi) verilirse reddeder", () => {
    expect(createDailyTaskSchema.safeParse({ ...validTask, topicId: "t1" }).success).toBe(false);
  });

  it("gecersiz saat, baslangicsiz bitis ve baslangictan once biten araligi reddeder", () => {
    expect(createDailyTaskSchema.safeParse({ ...validTask, startTime: "25:00" }).success).toBe(false);
    expect(createDailyTaskSchema.safeParse({ ...validTask, endTime: "16:00" }).success).toBe(false);
    expect(createDailyTaskSchema.safeParse({ ...validTask, startTime: "16:00", endTime: "15:00" }).success).toBe(false);
  });

  it("mode zorunlu", () => {
    expect(createDailyTaskSchema.safeParse({ title: "x", date: "2026-10-01" }).success).toBe(false);
  });
});

describe("createStudySessionSchema", () => {
  const base = { subjectId: "s1", topicId: "t1", durationMinutes: 30, difficulty: 3, productivity: 4 };

  it("gecmiste baslayan bir calismayi kabul eder", () => {
    const startedAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(createStudySessionSchema.safeParse({ ...base, startedAt }).success).toBe(true);
  });

  it("startedAt olmadan da (eski istemciler) kabul eder", () => {
    expect(createStudySessionSchema.safeParse(base).success).toBe(true);
  });

  it("gelecekte biten calismayi reddeder", () => {
    const startedAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(createStudySessionSchema.safeParse({ ...base, startedAt }).success).toBe(false);
  });

  it("24 saatten uzun sureyi reddeder", () => {
    expect(createStudySessionSchema.safeParse({ ...base, durationMinutes: 24 * 60 + 1 }).success).toBe(false);
  });
});
