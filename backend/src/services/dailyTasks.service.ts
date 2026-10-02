import type { Prisma, UserMode } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { requireTopicInSubject } from "./topics.service.js";

function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface CreateTaskInput {
  subjectId?: string;
  topicId?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  date: string;
  mode: UserMode;
}

type TaskWithRelations = Prisma.DailyTaskGetPayload<{ include: { subject: true; topic: true } }>;

function toTaskRow(task: TaskWithRelations) {
  return {
    id: task.id,
    subjectId: task.subjectId,
    subjectName: task.subject?.name ?? null,
    topicId: task.topicId,
    topicName: task.topic?.name ?? null,
    title: task.title,
    startTime: task.startTime,
    endTime: task.endTime,
    date: toDateKey(task.date),
    status: task.status,
    studySessionId: task.studySessionId,
  };
}

export async function createTask(userId: string, input: CreateTaskInput) {
  // Serbest metinli planda ders/konu yok; varsa konunun gercekten o derse ait oldugunu dogrula.
  if (input.subjectId && input.topicId) {
    await requireTopicInSubject(input.topicId, input.subjectId);
  }

  const task = await prisma.dailyTask.create({
    data: {
      userId,
      subjectId: input.subjectId ?? null,
      topicId: input.topicId ?? null,
      title: input.title ?? null,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      date: toDateOnly(input.date),
      mode: input.mode,
    },
    include: { subject: true, topic: true },
  });

  return toTaskRow(task);
}

export async function listTasks(userId: string, mode: UserMode, dateStr?: string) {
  const date = toDateOnly(dateStr ?? toDateKey(new Date()));
  const tasks = await prisma.dailyTask.findMany({
    where: { userId, date, mode },
    include: { subject: true, topic: true },
    // Saatli planlar saat sirasinda, saatsizler eklenme sirasinda en sonda.
    orderBy: [{ startTime: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  return tasks.map(toTaskRow);
}

// Defterim: isaretleme (PLANNED/DONE) ve yapilmamis maddeyi baska gune ("Bugune tasi") alma.
export async function updateTask(
  userId: string,
  taskId: string,
  input: { status?: "PLANNED" | "DONE"; date?: string },
) {
  const task = await prisma.dailyTask.findUnique({ where: { id: taskId } });
  if (!task || task.userId !== userId) {
    throw new HttpError(403, "Bu göreve erişimin yok");
  }

  const updated = await prisma.dailyTask.update({
    where: { id: taskId },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.date ? { date: toDateOnly(input.date) } : {}),
    },
    include: { subject: true, topic: true },
  });

  return toTaskRow(updated);
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
