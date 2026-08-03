import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { predictPriority } from "./mlClient.service.js";
import { getDisplayTopicLabel } from "../utils/topicLabel.js";

interface CreateStudySessionInput {
  subjectId: string;
  topicId: string;
  durationMinutes: number;
  difficulty: number;
  productivity: number;
  notes?: string;
}

// Elle "dunku veri" girisi (mini-check yapmadan) - burada attempt_count/hint_count
// gercekten olculemedigi icin onaylanan notr varsayilanlar kullanilir. overlap_time
// ise girilen sureden gercekten hesaplaniyor, uydurulmuyor.
const DEFAULT_ATTEMPT_COUNT = 1;
const DEFAULT_HINT_COUNT = 0;
const DEFAULT_MS_FIRST_RESPONSE = 15000;

export async function createStudySession(userId: string, input: CreateStudySessionInput) {
  const topic = await prisma.topic.findUnique({ where: { id: input.topicId }, include: { subject: true } });
  if (!topic || topic.subjectId !== input.subjectId) {
    throw new HttpError(400, "Geçersiz ders/konu");
  }

  const studySession = await prisma.studySession.create({
    data: {
      userId,
      subjectId: input.subjectId,
      topicId: input.topicId,
      durationMinutes: input.durationMinutes,
      difficulty: input.difficulty,
      productivity: input.productivity,
      notes: input.notes,
    },
  });

  const priorChecks = await prisma.topicCheck.count({ where: { userId, topicId: input.topicId } });
  const priorSessions = await prisma.studySession.count({ where: { userId, topicId: input.topicId } });
  const opportunity = priorChecks + priorSessions; // bu oturum zaten sayildi, +1 gerekmiyor

  const prediction = await predictPriority({
    skill_name: `${topic.subject.name} - ${topic.name}`,
    opportunity: Math.max(1, opportunity),
    attempt_count: DEFAULT_ATTEMPT_COUNT,
    ms_first_response: DEFAULT_MS_FIRST_RESPONSE,
    overlap_time: input.durationMinutes * 60000,
    hint_count: DEFAULT_HINT_COUNT,
  });

  await prisma.topic.update({ where: { id: input.topicId }, data: { lastStudied: new Date() } });

  if (!prediction) {
    return { studySession, mlAvailable: false, correctProbability: null, priority: null, recommendation: null };
  }

  const displayLabel = getDisplayTopicLabel(topic, topic.subject);
  const recommendation = await prisma.aIRecommendation.create({
    data: {
      userId,
      topicId: input.topicId,
      title: `${displayLabel} için Öneri`,
      content: `Son çalışma verine göre ${displayLabel} konusunun önceliği: ${prediction.priority}.`,
      type: "STUDY_PRIORITY",
    },
  });

  return {
    studySession,
    mlAvailable: true,
    correctProbability: prediction.correct_probability,
    priority: prediction.priority,
    recommendation,
  };
}
