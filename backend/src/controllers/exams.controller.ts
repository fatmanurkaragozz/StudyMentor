import type { Request, Response } from "express";
import { createExamSchema } from "../validation/schemas.js";
import { createExam, listExams } from "../services/exams.service.js";

export async function postExam(req: Request, res: Response) {
  const input = createExamSchema.parse(req.body);
  const result = await createExam(req.userId as string, input);
  res.status(201).json(result);
}

export async function getExams(req: Request, res: Response) {
  const result = await listExams(req.userId as string);
  res.json(result);
}
