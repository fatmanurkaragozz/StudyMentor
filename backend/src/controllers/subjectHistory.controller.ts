import type { Request, Response } from "express";
import { modeQuerySchema, submitInsightFeedbackSchema } from "../validation/schemas.js";
import { getSubjectStatsList } from "../services/subjectHistory.service.js";
import { getCachedInsights, generateSubjectInsight, submitInsightFeedback } from "../services/subjectInsight.service.js";

export async function getSubjectHistory(req: Request, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const userId = req.userId as string;

  const stats = await getSubjectStatsList(userId, mode);
  const insights = await getCachedInsights(userId, stats.map((entry) => entry.subjectId));

  const result = stats.map((entry) => ({
    ...entry,
    insight: insights.get(entry.subjectId) ?? null,
  }));

  res.json(result);
}

export async function postSubjectInsight(req: Request<{ subjectId: string }>, res: Response) {
  const { mode } = modeQuerySchema.parse(req.query);
  const result = await generateSubjectInsight(req.userId as string, req.params.subjectId, mode === "STUDENT");
  res.json(result);
}

export async function postSubjectInsightFeedback(req: Request<{ subjectId: string }>, res: Response) {
  const input = submitInsightFeedbackSchema.parse(req.body);
  const result = await submitInsightFeedback(req.userId as string, req.params.subjectId, input.feedback, input.reason);
  res.json(result);
}
