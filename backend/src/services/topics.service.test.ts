import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { getTopicProgress, listTopicsForUser, markTopicReviewed } from "./topics.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

const NOW = new Date("2026-10-02T09:00:00.000Z");

beforeEach(() => {
  mockReset(prismaMock);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  prismaMock.examSubject.findMany.mockResolvedValue([]);
  prismaMock.user.findUnique.mockResolvedValue({ id: "u1", educationLevel: "UNIVERSITY", examCategory: null } as never);
});
afterEach(() => {
  vi.useRealTimers();
});

describe("markTopicReviewed", () => {
  it("ilerlemeyi ortak Topic satirina degil kullanicinin kaydina yazar", async () => {
    await markTopicReviewed("u1", "t1", "ORTA");

    expect(prismaMock.topic.update).not.toHaveBeenCalled();
    const args = prismaMock.userTopicProgress.upsert.mock.calls[0][0];
    expect(args.where).toEqual({ userId_topicId: { userId: "u1", topicId: "t1" } });
    // ORTA = 4 gun sonra
    expect(args.create).toEqual({ userId: "u1", topicId: "t1", lastStudied: NOW, nextReview: new Date("2026-10-06T09:00:00.000Z") });
  });

  it("oncelik yoksa (ML kapali) onceki tekrar tarihine dokunmaz", async () => {
    await markTopicReviewed("u1", "t1", null);

    const args = prismaMock.userTopicProgress.upsert.mock.calls[0][0];
    expect(args.update).toEqual({ lastStudied: NOW });
    expect(args.create).toMatchObject({ nextReview: null });
  });

  it("sinav kirpmasi sadece kullanicinin kendi sinavlarina bakar ve daha yakin sinava kirpar", async () => {
    const examDate = new Date("2026-10-04T00:00:00.000Z");
    prismaMock.examSubject.findMany.mockResolvedValue([{ exam: { date: examDate } }] as never);

    await markTopicReviewed("u1", "t1", "DUSUK");

    expect(prismaMock.examSubject.findMany.mock.calls[0][0]?.where).toEqual({
      subject: { topics: { some: { id: "t1" } } },
      exam: { userId: "u1", date: { gte: NOW } },
    });
    expect(prismaMock.userTopicProgress.upsert.mock.calls[0][0].create).toMatchObject({ nextReview: examDate });
  });
});

describe("listTopicsForUser", () => {
  it("ilerlemeyi sadece o kullanicinin kaydindan alir, kaydi olmayan konuda null doner", async () => {
    const lastStudied = new Date("2026-10-01T10:00:00.000Z");
    prismaMock.subject.findMany.mockResolvedValue([
      {
        id: "s1",
        name: "Sayısal Muhakeme",
        topics: [
          { id: "t1", name: "Sayılar", progress: [{ lastStudied, nextReview: null }] },
          { id: "t2", name: "Problemler", progress: [] },
        ],
      },
    ] as never);

    const [subject] = await listTopicsForUser("u1", "STUDENT");

    expect(prismaMock.subject.findMany.mock.calls[0][0]?.include).toEqual({
      topics: { include: { progress: { where: { userId: "u1" } } } },
    });
    expect(subject.topics).toEqual([
      { id: "t1", name: "Sayılar", lastStudied, nextReview: null },
      { id: "t2", name: "Problemler", lastStudied: null, nextReview: null },
    ]);
  });
});

describe("getTopicProgress", () => {
  it("kullanici + konu anahtariyla okur", async () => {
    await getTopicProgress("u1", "t1");
    expect(prismaMock.userTopicProgress.findUnique).toHaveBeenCalledWith({
      where: { userId_topicId: { userId: "u1", topicId: "t1" } },
    });
  });
});
