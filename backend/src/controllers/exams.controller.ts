import type { Request, Response } from "express";
import { createExamSchema, examCatalogParamsSchema, modeQuerySchema, updateExamSchema } from "../validation/schemas.js";
import { createExam, listExams, updateExam, deleteExam } from "../services/exams.service.js";
import { getExamCatalog } from "../services/subjects.service.js";

export async function postExam(req: Request, res: Response) {
  const input = createExamSchema.parse(req.body);
  const result = await createExam(req.userId as string, input);
  res.status(201).json(result);
}

export async function getExams(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listExams(req.userId as string, mode);
  res.json(result);
}

export async function getExamCatalogHandler(req: Request<{ category: string }>, res: Response) {
  const { category } = examCatalogParamsSchema.parse(req.params);
  const result = await getExamCatalog(category);
  res.json(result);
}

export async function patchExam(req: Request<{ id: string }>, res: Response) {
  const input = updateExamSchema.parse(req.body);
  await updateExam(req.userId as string, req.params.id, input);
  res.json({ message: "Sınav güncellendi" });
}

export async function deleteExamHandler(req: Request<{ id: string }>, res: Response) {
  await deleteExam(req.userId as string, req.params.id);
  res.json({ message: "Sınav silindi" });
}
