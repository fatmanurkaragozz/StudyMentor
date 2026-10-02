import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { listDueReminders } from "./topicReminders.service.js";
import { listTopicsForUser, studyListSubjectWhere } from "./topics.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const asOf = new Date("2026-10-01T12:00:00.000Z");

beforeEach(() => {
  mockReset(prismaMock);
  prismaMock.user.findUnique.mockResolvedValue({ id: "u1", educationLevel: "UNIVERSITY", examCategory: null } as never);
  prismaMock.topicReminder.findMany.mockResolvedValue([]);
  prismaMock.subject.findMany.mockResolvedValue([]);
});

describe("studyListSubjectWhere", () => {
  it("STUDENT: egitim seviyesinin katalogu + o moddaki kendi dersleri + o moddaki sinavlarin dersleri", async () => {
    expect(await studyListSubjectWhere("u1", "STUDENT")).toEqual({
      OR: [
        { educationLevel: "UNIVERSITY" },
        { userId: "u1", mode: "STUDENT" },
        { exams: { some: { exam: { userId: "u1", mode: "STUDENT" } } } },
      ],
    });
  });

  it("EXAM_PREP: katalog egitim seviyesi yerine sinav kategorisinden gelir", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", educationLevel: "EXAM_PREP", examCategory: "KPSS" } as never);
    const where = await studyListSubjectWhere("u1", "STUDENT");
    expect(where.OR?.[0]).toEqual({ examCategory: "KPSS" });
  });

  it("LIFELONG_LEARNER: global katalog hic yok", async () => {
    expect(await studyListSubjectWhere("u1", "LIFELONG_LEARNER")).toEqual({
      OR: [
        { userId: "u1", mode: "LIFELONG_LEARNER" },
        { exams: { some: { exam: { userId: "u1", mode: "LIFELONG_LEARNER" } } } },
      ],
    });
  });

  it("listTopicsForUser ayni filtreyi kullanir", async () => {
    await listTopicsForUser("u1", "STUDENT");
    expect(prismaMock.subject.findMany.mock.calls[0][0]?.where).toEqual(await studyListSubjectWhere("u1", "STUDENT"));
  });
});

describe("listDueReminders", () => {
  it("sadece o moddaki ders listesinde olan konularin hatirlatmalarini ister (silinen sinavinkiler gizlenir)", async () => {
    await listDueReminders("u1", "STUDENT", asOf);

    expect(prismaMock.topicReminder.findMany.mock.calls[0][0]?.where).toEqual({
      userId: "u1",
      isActive: true,
      nextReminderAt: { lte: asOf },
      topic: { subject: await studyListSubjectWhere("u1", "STUDENT") },
    });
  });

  it("sonucu eskisi gibi esler", async () => {
    prismaMock.topicReminder.findMany.mockResolvedValue([
      {
        topicId: "t1",
        intervalDays: 3,
        nextReminderAt: asOf,
        topic: { subjectId: "s1", name: "Sayılar", subject: { name: "Sayısal Muhakeme" } },
      },
    ] as never);

    expect(await listDueReminders("u1", "STUDENT", asOf)).toEqual([
      { topicId: "t1", subjectId: "s1", topicName: "Sayılar", subjectName: "Sayısal Muhakeme", intervalDays: 3, nextReminderAt: asOf },
    ]);
  });
});
