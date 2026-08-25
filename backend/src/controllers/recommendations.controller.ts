import type { Request, Response } from "express";
import { listRecommendations, submitRecommendationFeedback } from "../services/recommendations.service.js";
import { modeQuerySchema, submitInsightFeedbackSchema } from "../validation/schemas.js";

export async function getRecommendations(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await listRecommendations(req.userId as string, mode);
  res.json(result);
}

export async function postRecommendationFeedback(req: Request<{ id: string }>, res: Response) {
  const input = submitInsightFeedbackSchema.parse(req.body);
  const result = await submitRecommendationFeedback(req.userId as string, req.params.id, input.feedback, input.reason);
  res.json(result);
}
