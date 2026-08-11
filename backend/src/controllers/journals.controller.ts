import type { Request, Response } from "express";
import { createJournalSchema } from "../validation/schemas.js";
import { createJournal, listJournals } from "../services/journals.service.js";

export async function postJournal(req: Request, res: Response) {
  const input = createJournalSchema.parse(req.body);
  const result = await createJournal(req.userId as string, input);
  res.status(201).json(result);
}

export async function getJournals(req: Request, res: Response) {
  const result = await listJournals(req.userId as string);
  res.json(result);
}
