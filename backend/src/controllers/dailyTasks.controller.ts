import type { Request, Response } from "express";
import { createDailyTaskSchema, completeDailyTaskSchema, modeQuerySchema, updateDailyTaskSchema } from "../validation/schemas.js";
import { createTask, listTasks, completeTask, deleteTask, updateTask } from "../services/dailyTasks.service.js";

export async function postDailyTask(req: Request, res: Response) {
  const input = createDailyTaskSchema.parse(req.body);
  const result = await createTask(req.userId as string, input);
  res.status(201).json(result);
}

export async function getDailyTasks(req: Request, res: Response) {
  const date = typeof req.query.date === "string" ? req.query.date : undefined;
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listTasks(req.userId as string, mode, date);
  res.json(result);
}

export async function postCompleteDailyTask(req: Request<{ id: string }>, res: Response) {
  const input = completeDailyTaskSchema.parse(req.body);
  await completeTask(req.userId as string, req.params.id, input.studySessionId);
  res.json({ message: "Tamamlandı" });
}

export async function patchDailyTask(req: Request<{ id: string }>, res: Response) {
  const input = updateDailyTaskSchema.parse(req.body);
  const result = await updateTask(req.userId as string, req.params.id, input);
  res.json(result);
}

export async function deleteDailyTaskHandler(req: Request<{ id: string }>, res: Response) {
  await deleteTask(req.userId as string, req.params.id);
  res.json({ message: "Silindi" });
}
