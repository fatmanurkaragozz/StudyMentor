import type { Request, Response } from "express";
import { listTopicsForUser } from "../services/topics.service.js";

export async function getTopics(req: Request, res: Response) {
  const topics = await listTopicsForUser(req.userId as string);
  res.json(topics);
}
