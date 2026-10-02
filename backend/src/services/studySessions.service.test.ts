import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { listStudySessions } from "./studySessions.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));
// listStudySessions bunlari kullanmiyor; ML/oneri zincirini test disinda tutmak icin.
vi.mock("./recommendations.service.js", () => ({ scoreAndRecommend: vi.fn() }));
vi.mock("./topicReminders.service.js", () => ({ advanceReminderIfActive: vi.fn(), proposeReminder: vi.fn() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  prismaMock.studySession.findMany.mockResolvedValue([]);
});

describe("listStudySessions", () => {
  it("aralik verilmezse (Dashboard) sadece kullaniciya gore filtreler", async () => {
    await listStudySessions("u1", "STUDENT");
    expect(prismaMock.studySession.findMany.mock.calls[0][0]?.where).toEqual({ userId: "u1" });
  });

  it("Defterim araligi: startedAt'e, eski kayitlarda createdAt'e gore filtreler", async () => {
    await listStudySessions("u1", "STUDENT", { from: "2026-09-30T21:00:00.000Z", to: "2026-10-01T21:00:00.000Z" });

    const between = { gte: new Date("2026-09-30T21:00:00.000Z"), lt: new Date("2026-10-01T21:00:00.000Z") };
    expect(prismaMock.studySession.findMany.mock.calls[0][0]?.where).toEqual({
      userId: "u1",
      OR: [{ startedAt: between }, { startedAt: null, createdAt: between }],
    });
  });

  it("baslangic saatini ve modda gorunmeyen dersleri eler", async () => {
    const startedAt = new Date("2026-10-01T06:10:00.000Z");
    prismaMock.studySession.findMany.mockResolvedValue([
      {
        id: "a",
        subject: { name: "Matematik", userId: null, mode: null },
        topic: { name: "Türev" },
        durationMinutes: 25,
        difficulty: 3,
        productivity: 4,
        notes: null,
        startedAt,
        createdAt: new Date("2026-10-01T06:40:00.000Z"),
      },
      {
        id: "b",
        subject: { name: "Gitar", userId: "u1", mode: "LIFELONG_LEARNER" },
        topic: { name: "Genel" },
        durationMinutes: 30,
        difficulty: 2,
        productivity: 5,
        notes: null,
        startedAt: null,
        createdAt: new Date("2026-10-01T10:00:00.000Z"),
      },
    ] as never);

    const rows = await listStudySessions("u1", "STUDENT");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: "a", subjectName: "Matematik", startedAt });
  });
});
