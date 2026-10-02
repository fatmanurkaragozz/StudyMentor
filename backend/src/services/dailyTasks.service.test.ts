import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { createTask, listTasks, updateTask } from "./dailyTasks.service.js";
import { requireTopicInSubject } from "./topics.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));
vi.mock("./topics.service.js", () => ({ requireTopicInSubject: vi.fn() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const baseTask = {
  id: "d1",
  userId: "u1",
  subjectId: null,
  subject: null,
  topicId: null,
  topic: null,
  title: "Fizik deneme çöz",
  startTime: "15:00",
  endTime: "16:00",
  mode: "STUDENT" as const,
  date: new Date("2026-10-01T00:00:00.000Z"),
  status: "PLANNED" as const,
  studySessionId: null,
  createdAt: new Date("2026-10-01T08:00:00.000Z"),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockReset(prismaMock);
  prismaMock.dailyTask.findMany.mockResolvedValue([]);
});

describe("listTasks", () => {
  it("sadece istenen modun ve gunun gorevlerini, saatliler once gelecek sekilde ister", async () => {
    await listTasks("u1", "LIFELONG_LEARNER", "2026-10-01");

    const args = prismaMock.dailyTask.findMany.mock.calls[0][0];
    expect(args?.where).toEqual({
      userId: "u1",
      date: new Date("2026-10-01T00:00:00.000Z"),
      mode: "LIFELONG_LEARNER",
    });
    expect(args?.orderBy).toEqual([{ startTime: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }]);
  });

  it("serbest metinli planda ders/konu adlari null doner", async () => {
    prismaMock.dailyTask.findMany.mockResolvedValue([baseTask] as never);
    const [row] = await listTasks("u1", "STUDENT", "2026-10-01");

    expect(row).toMatchObject({
      title: "Fizik deneme çöz",
      startTime: "15:00",
      endTime: "16:00",
      subjectName: null,
      topicName: null,
      date: "2026-10-01",
    });
  });
});

describe("createTask", () => {
  it("serbest metinli planda konu dogrulamasi yapmadan modla kaydeder", async () => {
    prismaMock.dailyTask.create.mockResolvedValue(baseTask as never);
    await createTask("u1", { title: "Fizik deneme çöz", startTime: "15:00", endTime: "16:00", date: "2026-10-01", mode: "STUDENT" });

    expect(requireTopicInSubject).not.toHaveBeenCalled();
    expect(prismaMock.dailyTask.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      subjectId: null,
      topicId: null,
      title: "Fizik deneme çöz",
      mode: "STUDENT",
    });
  });

  it("ders bagli maddede konunun o derse ait oldugunu dogrular", async () => {
    prismaMock.dailyTask.create.mockResolvedValue(baseTask as never);
    await createTask("u1", { subjectId: "s1", topicId: "t1", date: "2026-10-01", mode: "STUDENT" });

    expect(requireTopicInSubject).toHaveBeenCalledWith("t1", "s1");
  });
});

describe("updateTask", () => {
  it("baskasinin gorevini guncellemez", async () => {
    prismaMock.dailyTask.findUnique.mockResolvedValue({ ...baseTask, userId: "baska" } as never);

    await expect(updateTask("u1", "d1", { status: "DONE" })).rejects.toMatchObject({ statusCode: 403 });
    expect(prismaMock.dailyTask.update).not.toHaveBeenCalled();
  });

  it('"Bugune tasi": sadece verilen alanlari gunceller', async () => {
    prismaMock.dailyTask.findUnique.mockResolvedValue(baseTask as never);
    prismaMock.dailyTask.update.mockResolvedValue(baseTask as never);

    await updateTask("u1", "d1", { date: "2026-10-02" });

    expect(prismaMock.dailyTask.update.mock.calls[0][0].data).toEqual({
      date: new Date("2026-10-02T00:00:00.000Z"),
    });
  });
});
