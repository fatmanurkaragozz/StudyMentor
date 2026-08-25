import type { Request, Response } from "express";
import { createStudySessionSchema, modeQuerySchema } from "../validation/schemas.js";
import { createStudySession, listStudySessions } from "../services/studySessions.service.js";

export async function postStudySession(req: Request, res: Response) {
  const input = createStudySessionSchema.parse(req.body);
  const result = await createStudySession(req.userId as string, input);
  res.status(201).json(result);
}

export async function getStudySessions(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listStudySessions(req.userId as string, mode);
  res.json(result);
}
