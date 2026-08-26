import type { Request, Response } from "express";
import { createFeedbackSchema } from "../validation/schemas.js";
import { submitFeedback } from "../services/feedback.service.js";

export async function postFeedback(req: Request, res: Response) {
  const input = createFeedbackSchema.parse(req.body);
  await submitFeedback(input);
  res.status(201).json({ message: "Geri bildiriminiz için teşekkürler!" });
}
