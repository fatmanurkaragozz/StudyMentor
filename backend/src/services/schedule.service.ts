import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

interface CreateScheduleSlotInput {
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
}

async function assertOwnsSubject(userId: string, subjectId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== userId) {
    throw new HttpError(403, "Bu derse erişimin yok");
  }
}

export async function createScheduleSlot(userId: string, input: CreateScheduleSlotInput) {
  await assertOwnsSubject(userId, input.subjectId);

  const slot = await prisma.scheduleSlot.create({
    data: {
      userId,
      subjectId: input.subjectId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      location: input.location,
    },
  });

  return { id: slot.id };
}

export async function listSchedule(userId: string) {
  const slots = await prisma.scheduleSlot.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return slots.map((slot) => ({
    id: slot.id,
    subjectId: slot.subjectId,
    subjectName: slot.subject.name,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    location: slot.location,
  }));
}
