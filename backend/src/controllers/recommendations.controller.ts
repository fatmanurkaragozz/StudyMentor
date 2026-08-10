import type { Request, Response } from "express";
import { listRecommendations } from "../services/recommendations.service.js";

export async function getRecommendations(req: Request, res: Response) {
  const result = await listRecommendations(req.userId as string);
  res.json(result);
}
