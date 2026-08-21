import type { Request, Response } from "express";
import { listTopicsForUser } from "../services/topics.service.js";
import { modeQuerySchema } from "../validation/schemas.js";

export async function getTopics(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const topics = await listTopicsForUser(req.userId as string, mode);
  res.json(topics);
}
