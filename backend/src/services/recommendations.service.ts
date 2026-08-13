import type { PriorityLevel, RecommendationType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { predictPriority } from "./mlClient.service.js";

const REVISION_TEXT: Record<PriorityLevel, (topicName: string) => { title: string; content: string }> = {
  YUKSEK: (topicName) => ({
    title: `${topicName} için Yüksek Öncelik`,
    content: `${topicName} konusunu unutma riskin yüksek görünüyor - bu konuyu yakın zamanda tekrar etmelisin.`,
  }),
  ORTA: (topicName) => ({
    title: `${topicName} için Orta Öncelik`,
    content: `${topicName} konusunu orta vadede tekrar etmen faydalı olur.`,
  }),
  DUSUK: (topicName) => ({
    title: `${topicName} için Düşük Öncelik`,
    content: `${topicName} konusunu iyi biliyorsun gibi görünüyor, şimdilik düşük öncelikli.`,
  }),
};

function STUDY_PRIORITY_TEXT(topicName: string, priority: PriorityLevel): { title: string; content: string } {
  return {
    title: `${topicName} için Öneri`,
    content: `Son çalışma verine göre ${topicName} konusunun önceliği: ${priority}.`,
  };
}

interface ScoreAndRecommendInput {
  userId: string;
  topicId: string;
  topicName: string;
  type: Extract<RecommendationType, "REVISION" | "STUDY_PRIORITY">;
  opportunity: number;
  attemptCount: number;
  hintCount: number;
  msFirstResponse: number;
  overlapTimeMs: number;
}

// LearningEngine bir calisma etkinligi (StudySession/TopicCheck) bitince bunu cagirir.
// ML servisine sormak ve sonucu AIRecommendation olarak kaydetmek AICoach'in isi -
// LearningEngine kendi tablosuna yazmaz, sadece bu fonksiyonu cagirir.
export async function scoreAndRecommend(input: ScoreAndRecommendInput) {
  const prediction = await predictPriority({
    opportunity: input.opportunity,
    attempt_count: input.attemptCount,
    ms_first_response: input.msFirstResponse,
    overlap_time: input.overlapTimeMs,
    hint_count: input.hintCount,
  });

  if (!prediction) {
    return { mlAvailable: false, correctProbability: null, priority: null, recommendation: null };
  }

  const { title, content } = input.type === "REVISION"
    ? REVISION_TEXT[prediction.priority](input.topicName)
    : STUDY_PRIORITY_TEXT(input.topicName, prediction.priority);

  const recommendation = await prisma.aIRecommendation.create({
    data: { userId: input.userId, topicId: input.topicId, title, content, type: input.type, priority: prediction.priority },
  });

  return {
    mlAvailable: true,
    correctProbability: prediction.correct_probability,
    priority: prediction.priority,
    recommendation,
  };
}

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
