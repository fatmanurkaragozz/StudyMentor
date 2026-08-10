import { prisma } from "../config/prisma.js";

export async function listRecommendations(userId: string) {
  const recommendations = await prisma.aIRecommendation.findMany({
    where: { userId },
    include: { topic: { include: { subject: true } } },
    orderBy: { createdAt: "desc" },
  });

  return recommendations.map(({ topic, ...rec }) => ({
    ...rec,
    topicName: topic?.name ?? null,
    subjectName: topic?.subject.name ?? null,
  }));
}
