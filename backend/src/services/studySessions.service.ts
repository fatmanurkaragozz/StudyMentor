import type { UserMode } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { getDisplayTopicLabel, markTopicReviewed, requireTopicInSubject } from "./topics.service.js";
import { scoreAndRecommend } from "./recommendations.service.js";
import { advanceReminderIfActive, proposeReminder } from "./topicReminders.service.js";
import { isVisibleInMode } from "./subjectHistory.service.js";

interface CreateStudySessionInput {
  subjectId: string;
  topicId: string;
  durationMinutes: number;
  difficulty: number;
  productivity: number;
  notes?: string;
}

// Elle "dunku veri" girisi (mini-check yapmadan) - burada gercek bir soru/deneme
// olmadigi icin attempt_count/hint_count'u tek tek olcemiyoruz. Ama kullanicinin
// bildirdigi "Zorluk Algisi" (1-5) tam olarak bu ikisinin temsil ettigi "zorlanma"
// sinyalini tasiyor: notebook'un feature importance analizinde (spaced_repetition_eda.ipynb,
// bolum 5) hint_count en guclu tekil yordayici (korelasyon r=-0.54), attempt_count ise
// Random Forest'te en yuksek importance'a sahip (%45.9) ozellikler. Sabit bir notr
// deger yerine bu gercek geri bildirimden turetiyoruz - bkz. STRUGGLE_BY_DIFFICULTY.
const STRUGGLE_BY_DIFFICULTY: Record<number, { attemptCount: number; hintCount: number }> = {
  1: { attemptCount: 1, hintCount: 0 },
  2: { attemptCount: 1, hintCount: 0 },
  3: { attemptCount: 2, hintCount: 1 },
  4: { attemptCount: 3, hintCount: 2 },
  5: { attemptCount: 4, hintCount: 3 },
};

// ms_first_response, ASSISTments verisinde TEK bir soruya ilk yanit suresi - bunu
// 25 dakikalik bir calisma oturumuna genellemenin gercek bir dayanagi yok (zorluk/
// verimlilik algisi gibi dogal bir karsiligi yok), o yuzden - uydurmaktansa - notr
// bir sabit olarak birakiyoruz.
const DEFAULT_MS_FIRST_RESPONSE = 15000;

// overlap_time de ayni kavramsal sorunu tasiyor: ASSISTments'ta "bir soruya
// harcanan sure" (medyan ~27sn), ama Pomodoro oturumlari 15-50 dakika suruyor -
// egitim verisinin 99. yuzdelik sinirinda bile (~7dk) bu, ciddi bir "zorlanma"
// sinyali olarak ogrenilmis. Gercek durationMinutes'i buraya koymak, oturum ne
// kadar iyi geçerse gecsin, HER Pomodoro tahminini YUKSEK onceliğe/cok dusuk
// olasiliğa cokertiyordu (bkz. deneme: 25dk'lik oturumda zorluk=1 ile zorluk=5
// ayirt edilemiyordu). O yuzden - digerleri gibi - notr birakiyoruz; deger,
// egitim verisinin medyanindan (~27sn) geliyor. durationMinutes StudySession
// kaydinda gercek haliyle saklanmaya devam ediyor, sadece ML ozelligi olarak
// kullanilmiyor.
const DEFAULT_OVERLAP_TIME_MS = 27000;

export async function createStudySession(userId: string, input: CreateStudySessionInput) {
  const topic = await requireTopicInSubject(input.topicId, input.subjectId);

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

  const { attemptCount, hintCount } = STRUGGLE_BY_DIFFICULTY[input.difficulty];
  const displayLabel = getDisplayTopicLabel(topic, topic.subject);

  const result = await scoreAndRecommend({
    userId,
    topicId: input.topicId,
    topicName: displayLabel,
    type: "STUDY_PRIORITY",
    opportunity: Math.max(1, opportunity),
    attemptCount,
    hintCount,
    msFirstResponse: DEFAULT_MS_FIRST_RESPONSE,
    overlapTimeMs: DEFAULT_OVERLAP_TIME_MS,
  });

  await markTopicReviewed(input.topicId, result.priority);
  // Bu konuyu gercekten calisti, aktif bir hatirlatma varsa donguyu ilerlet;
  // yoksa (ya da zaten aktifse) yeni bir oneri sunulabilir mi diye bak.
  await advanceReminderIfActive(userId, input.topicId);
  const proposedReminder = await proposeReminder(userId, input.topicId, result.priority);

  return { studySession, ...result, proposedReminder };
}

export async function listStudySessions(userId: string, mode: UserMode) {
  const sessions = await prisma.studySession.findMany({
    where: { userId },
    include: { subject: true, topic: true },
    orderBy: { createdAt: "desc" },
  });

  // StudySession'un kendi mode alani yok - dersin/ugrasin ait oldugu Subject uzerinden
  // (recommendations.service.ts ile ayni isVisibleInMode kurali) turetiliyor.
  return sessions
    .filter((s) => isVisibleInMode(s.subject, mode))
    .map((s) => ({
      id: s.id,
      subjectName: s.subject.name,
      topicName: s.topic.name,
      durationMinutes: s.durationMinutes,
      difficulty: s.difficulty,
      productivity: s.productivity,
      notes: s.notes,
      createdAt: s.createdAt,
    }));
}
