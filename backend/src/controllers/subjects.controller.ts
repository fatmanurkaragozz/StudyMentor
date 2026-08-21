import type { Request, Response } from "express";
import { createCustomSubjectSchema, addTopicSchema, modeQuerySchema, renameSubjectSchema, renameTopicSchema } from "../validation/schemas.js";
import {
  createOrGetCustomSubject,
  listMySubjects,
  addTopicToSubject,
  deleteSubject,
  renameSubject,
  renameTopic,
  deleteTopic,
} from "../services/subjects.service.js";

export async function postCustomSubject(req: Request, res: Response) {
  const input = createCustomSubjectSchema.parse(req.body);
  const result = await createOrGetCustomSubject(req.userId as string, input.name.trim(), input.mode);
  res.json(result);
}

export async function getMySubjects(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listMySubjects(req.userId as string, mode);
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

export async function patchSubjectHandler(req: Request<{ subjectId: string }>, res: Response) {
  const input = renameSubjectSchema.parse(req.body);
  const result = await renameSubject(req.userId as string, req.params.subjectId, input.name.trim());
  res.json(result);
}

export async function patchSubjectTopicHandler(req: Request<{ subjectId: string; topicId: string }>, res: Response) {
  const input = renameTopicSchema.parse(req.body);
  const result = await renameTopic(req.userId as string, req.params.subjectId, req.params.topicId, input.name.trim());
  res.json(result);
}

export async function deleteSubjectTopicHandler(req: Request<{ subjectId: string; topicId: string }>, res: Response) {
  await deleteTopic(req.userId as string, req.params.subjectId, req.params.topicId);
  res.json({ message: "Silindi" });
}
