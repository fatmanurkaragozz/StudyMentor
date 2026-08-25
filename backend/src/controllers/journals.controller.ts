import type { Request, Response } from "express";
import { createJournalSchema, modeQuerySchema } from "../validation/schemas.js";
import { createJournal, listJournals } from "../services/journals.service.js";

export async function postJournal(req: Request, res: Response) {
  const input = createJournalSchema.parse(req.body);
  const result = await createJournal(req.userId as string, input);
  res.status(201).json(result);
}

export async function getJournals(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listJournals(req.userId as string, mode);
  res.json(result);
}
