import type { PriorityLevel } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { predictPriority } from "./mlClient.service.js";
import { getDisplayTopicLabel } from "../utils/topicLabel.js";

interface SubmitCheckInput {
  attemptCount: number;
  hintCount: number;
  msFirstResponse: number;
  overlapTimeMs: number;
  selfGradedCorrect: boolean;
}

const RECOMMENDATION_TEXT: Record<PriorityLevel, (topicName: string) => { title: string; content: string }> = {
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

export async function startCheck(userId: string, topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
  if (!topic) {
    throw new HttpError(404, "Konu bulunamadı");
  }

  const priorCheckCount = await prisma.topicCheck.count({ where: { userId, topicId } });
  const opportunity = priorCheckCount + 1;

  const check = await prisma.topicCheck.create({
    data: { userId, topicId, opportunity },
  });

  const hint = topic.lastStudied
    ? `Son çalıştığın tarih: ${topic.lastStudied.toLocaleDateString("tr-TR")}. Notlarına göz at.`
    : "Bu konuyu birine anlatabilir misin? Kısa bir örnek soru çözmeyi dener misin?";

  return {
    checkId: check.id,
    opportunity,
    topicName: getDisplayTopicLabel(topic, topic.subject),
    subjectName: topic.subject.name,
    hint,
  };
}

export async function submitCheck(userId: string, checkId: string, input: SubmitCheckInput) {
  const check = await prisma.topicCheck.findUnique({
    where: { id: checkId },
    include: { topic: { include: { subject: true } } },
  });
  if (!check || check.userId !== userId) {
    throw new HttpError(404, "Kontrol bulunamadı");
  }
  if (check.submittedAt) {
    throw new HttpError(409, "Bu kontrol zaten tamamlanmış");
  }

  const skillName = `${check.topic.subject.name} - ${check.topic.name}`;
  const prediction = await predictPriority({
    skill_name: skillName,
    opportunity: check.opportunity,
    attempt_count: input.attemptCount,
    ms_first_response: input.msFirstResponse,
    overlap_time: input.overlapTimeMs,
    hint_count: input.hintCount,
  });

  await prisma.topicCheck.update({
    where: { id: checkId },
    data: {
      attemptCount: input.attemptCount,
      hintCount: input.hintCount,
      msFirstResponse: input.msFirstResponse,
      overlapTimeMs: input.overlapTimeMs,
      selfGradedCorrect: input.selfGradedCorrect,
      correctProbability: prediction?.correct_probability,
      priority: prediction?.priority,
      submittedAt: new Date(),
    },
  });

  await prisma.topic.update({ where: { id: check.topicId }, data: { lastStudied: new Date() } });

  if (!prediction) {
    return { mlAvailable: false, correctProbability: null, priority: null, recommendation: null };
  }

  const displayLabel = getDisplayTopicLabel(check.topic, check.topic.subject);
  const { title, content } = RECOMMENDATION_TEXT[prediction.priority](displayLabel);
  const recommendation = await prisma.aIRecommendation.create({
    data: { userId, topicId: check.topicId, title, content, type: "REVISION" },
  });

  return {
    mlAvailable: true,
    correctProbability: prediction.correct_probability,
    priority: prediction.priority,
    recommendation,
  };
}
