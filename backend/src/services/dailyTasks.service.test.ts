import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { listTasks } from "./dailyTasks.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  prismaMock.dailyTask.findMany.mockResolvedValue([]);
});

const subjectFilter = () => prismaMock.dailyTask.findMany.mock.calls[0][0]?.where?.subject;

describe("listTasks", () => {
  it("STUDENT: global katalog dersleri + ogrenci modunda eklenen dersler", async () => {
    await listTasks("u1", "STUDENT", "2026-10-01");

    expect(subjectFilter()).toEqual({
      OR: [
        { userId: null },
        { userId: "u1", mode: "STUDENT" },
        { exams: { some: { exam: { userId: "u1", mode: "STUDENT" } } } },
      ],
    });
  });

  it("LIFELONG_LEARNER: global katalog dersleri haric, sadece Gelisim'de eklenenler", async () => {
    await listTasks("u1", "LIFELONG_LEARNER", "2026-10-01");

    expect(subjectFilter()).toEqual({
      OR: [
        { userId: "u1", mode: "LIFELONG_LEARNER" },
        { exams: { some: { exam: { userId: "u1", mode: "LIFELONG_LEARNER" } } } },
      ],
    });
  });
});
