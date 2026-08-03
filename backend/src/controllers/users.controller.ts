import type { Request, Response } from "express";
import { updateProfileSchema } from "../validation/schemas.js";
import { updateProfile } from "../services/users.service.js";

export async function patchMe(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body);
  const user = await updateProfile(req.userId as string, input);
  res.json(user);
}
