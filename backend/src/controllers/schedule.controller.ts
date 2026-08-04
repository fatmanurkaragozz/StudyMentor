import type { Request, Response } from "express";
import { createScheduleSlotSchema } from "../validation/schemas.js";
import { createScheduleSlot, listSchedule } from "../services/schedule.service.js";

export async function postScheduleSlot(req: Request, res: Response) {
  const input = createScheduleSlotSchema.parse(req.body);
  const result = await createScheduleSlot(req.userId as string, input);
  res.status(201).json(result);
}

export async function getSchedule(req: Request, res: Response) {
  const result = await listSchedule(req.userId as string);
  res.json(result);
}
