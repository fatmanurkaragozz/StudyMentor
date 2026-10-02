import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";
import { startCheck } from "./topicChecks.service.js";
import { prisma } from "../config/prisma.js";

vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));
// startCheck bunlari kullanmiyor; ML/oneri zincirini test disinda tutmak icin.
vi.mock("./recommendations.service.js", () => ({ scoreAndRecommend: vi.fn() }));
vi.mock("./topicReminders.service.js", () => ({ advanceReminderIfActive: vi.fn(), proposeReminder: vi.fn() }));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  prismaMock.topic.findUnique.mockResolvedValue({
    id: "t1",
    name: "Sayılar",
    subject: { name: "Sayısal Muhakeme" },
  } as never);
  prismaMock.user.findUnique.mockResolvedValue({ educationLevel: "UNIVERSITY" } as never);
  prismaMock.topicCheck.count.mockResolvedValue(0);
  prismaMock.topicCheck.create.mockResolvedValue({ id: "c1" } as never);
});

describe("startCheck ipucu", () => {
  it("kullanicinin kendi son calisma tarihini gosterir", async () => {
    prismaMock.userTopicProgress.findUnique.mockResolvedValue({ lastStudied: new Date("2026-09-30T10:00:00.000Z") } as never);

    const { hint } = await startCheck("u1", "t1");

    expect(prismaMock.userTopicProgress.findUnique).toHaveBeenCalledWith({
      where: { userId_topicId: { userId: "u1", topicId: "t1" } },
    });
    expect(hint).toContain("30.09.2026");
  });

  it("kullanici bu konuyu hic calismadiysa genel ipucunu gosterir", async () => {
    prismaMock.userTopicProgress.findUnique.mockResolvedValue(null);

    const { hint } = await startCheck("u1", "t1");

    expect(hint).not.toContain("Son çalıştığın tarih");
  });
});
