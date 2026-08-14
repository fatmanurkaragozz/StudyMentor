import type { PriorityLevel } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { REVIEW_INTERVAL_DAYS, getDisplayTopicLabel } from "./topics.service.js";

// Bir oturum/kontrol puanlandiktan sonra cagrilir. ML onceligi yoksa ya da bu
// (userId, topicId) icin zaten aktif bir hatirlatma varsa tekrar sorulmaz.
export async function proposeReminder(
  userId: string,
  topicId: string,
  priority: PriorityLevel | null,
): Promise<{ intervalDays: number } | null> {
  if (!priority) return null;

  const existing = await prisma.topicReminder.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  if (existing?.isActive) return null;

  return { intervalDays: REVIEW_INTERVAL_DAYS[priority] };
}

// Kullanicinin "evet"/"hayir" cevabi. accept=false ise hicbir sey yazilmiyor -
// red kalici olarak saklanmiyor, bir dahaki calismada tekrar sorulabilir.
export async function respondToReminder(
  userId: string,
  topicId: string,
  intervalDays: number,
  accept: boolean,
): Promise<void> {
  if (!accept) return;

  const nextReminderAt = new Date();
  nextReminderAt.setUTCDate(nextReminderAt.getUTCDate() + intervalDays);

  await prisma.topicReminder.upsert({
    where: { userId_topicId: { userId, topicId } },
    create: { userId, topicId, intervalDays, nextReminderAt, isActive: true },
    update: { intervalDays, nextReminderAt, isActive: true },
  });
}

// Bugun (ya da verilen tarihte) hatirlatilmasi gereken, kullaniciya ozel konular.
export async function listDueReminders(userId: string, asOf: Date = new Date()) {
  const due = await prisma.topicReminder.findMany({
    where: { userId, isActive: true, nextReminderAt: { lte: asOf } },
    include: { topic: { include: { subject: true } } },
    orderBy: { nextReminderAt: "asc" },
  });

  return due.map((reminder) => ({
    topicId: reminder.topicId,
    subjectId: reminder.topic.subjectId,
    topicName: getDisplayTopicLabel(reminder.topic, reminder.topic.subject),
    subjectName: reminder.topic.subject.name,
    intervalDays: reminder.intervalDays,
    nextReminderAt: reminder.nextReminderAt,
  }));
}

// Kullanici bu konuyu gercekten tekrar calistiginda (yeni bir StudySession/TopicCheck
// tamamlaninca) cagrilir - aktif bir hatirlatma varsa donguyu bir adim ileri alir.
// Sadece "bugune eklendi" gibi bir niyete degil, gercek calisma aktivitesine bagli.
export async function advanceReminderIfActive(userId: string, topicId: string): Promise<void> {
  const existing = await prisma.topicReminder.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });
  if (!existing || !existing.isActive) return;

  const nextReminderAt = new Date();
  nextReminderAt.setUTCDate(nextReminderAt.getUTCDate() + existing.intervalDays);

  await prisma.topicReminder.update({
    where: { userId_topicId: { userId, topicId } },
    data: { nextReminderAt },
  });
}
