import type { Request, Response } from "express";
import { respondToReminderSchema } from "../validation/schemas.js";
import { respondToReminder, listDueReminders } from "../services/topicReminders.service.js";

export async function postTopicReminder(req: Request, res: Response) {
  const input = respondToReminderSchema.parse(req.body);
  await respondToReminder(req.userId as string, input.topicId, input.intervalDays, input.accept);
  res.status(201).json({ message: input.accept ? "Hatırlatma eklendi" : "Tamam" });
}

export async function getDueTopicReminders(req: Request, res: Response) {
  const result = await listDueReminders(req.userId as string);
  res.json(result);
}
