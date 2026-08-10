import type { Request, Response } from "express";
import { createCustomSubjectSchema, addTopicSchema } from "../validation/schemas.js";
import { createOrGetCustomSubject, listMySubjects, addTopicToSubject, deleteSubject } from "../services/subjects.service.js";

export async function postCustomSubject(req: Request, res: Response) {
  const input = createCustomSubjectSchema.parse(req.body);
  const result = await createOrGetCustomSubject(req.userId as string, input.name.trim());
  res.json(result);
}

export async function getMySubjects(req: Request, res: Response) {
  const result = await listMySubjects(req.userId as string);
  res.json(result);
}

export async function postSubjectTopic(req: Request<{ subjectId: string }>, res: Response) {
  const input = addTopicSchema.parse(req.body);
  const result = await addTopicToSubject(req.userId as string, req.params.subjectId, input.name.trim());
  res.status(201).json(result);
}

export async function deleteSubjectHandler(req: Request<{ subjectId: string }>, res: Response) {
  await deleteSubject(req.userId as string, req.params.subjectId);
  res.json({ message: "Silindi" });
}
