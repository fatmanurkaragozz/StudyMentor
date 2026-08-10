import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function createTask(userId: string, input: { subjectId: string; topicId: string; date: string }) {
  const topic = await prisma.topic.findUnique({ where: { id: input.topicId }, include: { subject: true } });
  if (!topic || topic.subjectId !== input.subjectId) {
    throw new HttpError(400, "Geçersiz ders/konu");
  }

  const task = await prisma.dailyTask.create({
    data: { userId, subjectId: input.subjectId, topicId: input.topicId, date: toDateOnly(input.date) },
  });

  return {
    id: task.id,
    subjectId: task.subjectId,
    subjectName: topic.subject.name,
    topicId: task.topicId,
    topicName: topic.name,
    date: toDateKey(task.date),
    status: task.status,
    studySessionId: task.studySessionId,
  };
}

export async function listTasks(userId: string, dateStr?: string) {
  const date = toDateOnly(dateStr ?? toDateKey(new Date()));
  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date },
    include: { subject: true, topic: true },
    orderBy: { createdAt: "asc" },
  });

  return tasks.map((task) => ({
    id: task.id,
    subjectId: task.subjectId,
    subjectName: task.subject.name,
    topicId: task.topicId,
    topicName: task.topic.name,
    date: toDateKey(task.date),
    status: task.status,
    studySessionId: task.studySessionId,
  }));
}

export async function completeTask(userId: string, taskId: string, studySessionId: string) {
  const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) {
    throw new HttpError(403, "Bu göreve erişimin yok");
  }

  const session = await prisma.studySession.findUnique({ where: { id: studySessionId } });
  if (!session || session.userId !== userId) {
    throw new HttpError(403, "Bu oturuma erişimin yok");
  }

  await prisma.dailyTask.update({ where: { id: taskId }, data: { status: "DONE", studySessionId } });
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) {
    throw new HttpError(403, "Bu göreve erişimin yok");
  }
  await prisma.dailyTask.delete({ where: { id: taskId } });
}
