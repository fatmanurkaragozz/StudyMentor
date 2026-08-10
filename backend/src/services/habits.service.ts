import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function toDateOnly(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

// Bugunden geriye dogru sayar; bugun henuz isaretlenmemisse dunden baslar
// (gun henuz bitmedi toleransi), ilk bosluga rastlayinca durur.
function computeStreak(completedDates: Set<string>): number {
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!completedDates.has(toDateKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let streak = 0;
  while (completedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function createHabit(userId: string, name: string) {
  const habit = await prisma.habit.create({ data: { userId, name } });
  return { id: habit.id, name: habit.name, streakDays: 0, completedDates: [] as string[] };
}

export async function listHabits(userId: string) {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: { logs: { where: { isCompleted: true } } },
    orderBy: { createdAt: "asc" },
  });

  return habits.map((habit) => {
    const completedDates = habit.logs.map((log) => toDateKey(log.date));
    return {
      id: habit.id,
      name: habit.name,
      streakDays: computeStreak(new Set(completedDates)),
      completedDates,
    };
  });
}

export async function toggleHabitLog(userId: string, habitId: string, dateStr: string) {
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== userId) {
    throw new HttpError(403, "Bu alışkanlığa erişimin yok");
  }

  const date = toDateOnly(dateStr);
  const existing = await prisma.habitLog.findUnique({ where: { habitId_date: { habitId, date } } });

  if (existing) {
    await prisma.habitLog.update({ where: { id: existing.id }, data: { isCompleted: !existing.isCompleted } });
  } else {
    await prisma.habitLog.create({ data: { habitId, date, isCompleted: true } });
  }
}
