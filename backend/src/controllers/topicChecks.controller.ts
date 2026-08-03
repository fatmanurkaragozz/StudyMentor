import type { Request, Response } from "express";
import { startTopicCheckSchema, submitTopicCheckSchema } from "../validation/schemas.js";
import { startCheck, submitCheck } from "../services/topicChecks.service.js";

export async function postStartCheck(req: Request, res: Response) {
  const { topicId } = startTopicCheckSchema.parse(req.body);
  const result = await startCheck(req.userId as string, topicId);
  res.status(201).json(result);
}

export async function postSubmitCheck(req: Request<{ id: string }>, res: Response) {
  const input = submitTopicCheckSchema.parse(req.body);
  const result = await submitCheck(req.userId as string, req.params.id, input);
  res.json(result);
}
