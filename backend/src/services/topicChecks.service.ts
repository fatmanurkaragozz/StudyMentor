import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { getDisplayTopicLabel, getTopicWithSubject, markTopicReviewed } from "./topics.service.js";
import { scoreAndRecommend } from "./recommendations.service.js";
import { advanceReminderIfActive, proposeReminder } from "./topicReminders.service.js";

interface SubmitCheckInput {
  attemptCount: number;
  hintCount: number;
  msFirstResponse: number;
  overlapTimeMs: number;
  selfGradedCorrect: boolean;
}

export async function startCheck(userId: string, topicId: string) {
  const topic = await getTopicWithSubject(topicId);
  if (!topic) {
    throw new HttpError(404, "Konu bulunamadı");
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { educationLevel: true } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }

  const priorCheckCount = await prisma.topicCheck.count({ where: { userId, topicId } });
  const opportunity = priorCheckCount + 1;

  const check = await prisma.topicCheck.create({
    data: { userId, topicId, opportunity, educationLevel: user.educationLevel },
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

  const displayLabel = getDisplayTopicLabel(check.topic, check.topic.subject);

  const result = await scoreAndRecommend({
    userId,
    topicId: check.topicId,
    topicName: displayLabel,
    type: "REVISION",
    opportunity: check.opportunity,
    attemptCount: input.attemptCount,
    hintCount: input.hintCount,
    msFirstResponse: input.msFirstResponse,
    overlapTimeMs: input.overlapTimeMs,
  });

  await prisma.topicCheck.update({
    where: { id: checkId },
    data: {
      attemptCount: input.attemptCount,
      hintCount: input.hintCount,
      msFirstResponse: input.msFirstResponse,
      overlapTimeMs: input.overlapTimeMs,
      selfGradedCorrect: input.selfGradedCorrect,
      correctProbability: result.correctProbability,
      priority: result.priority,
      submittedAt: new Date(),
    },
  });

  await markTopicReviewed(check.topicId, result.priority);
  await advanceReminderIfActive(userId, check.topicId);
  const proposedReminder = await proposeReminder(userId, check.topicId, result.priority);

  return { ...result, proposedReminder };
}
