import type { Request, Response } from "express";
import { createHabitSchema, toggleHabitLogSchema } from "../validation/schemas.js";
import { createHabit, listHabits, toggleHabitLog } from "../services/habits.service.js";

export async function postHabit(req: Request, res: Response) {
  const input = createHabitSchema.parse(req.body);
  const result = await createHabit(req.userId as string, input.name.trim());
  res.status(201).json(result);
}

export async function getHabits(req: Request, res: Response) {
  const result = await listHabits(req.userId as string);
  res.json(result);
}

export async function postToggleHabitLog(req: Request<{ id: string }>, res: Response) {
  const input = toggleHabitLogSchema.parse(req.body);
  await toggleHabitLog(req.userId as string, req.params.id, input.date);
  res.json({ message: "Güncellendi" });
}
