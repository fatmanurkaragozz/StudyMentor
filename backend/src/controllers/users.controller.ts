import type { Request, Response } from "express";
import { updateProfileSchema } from "../validation/schemas.js";
import { updateProfile, getMe as getMeService } from "../services/users.service.js";

export async function getMe(req: Request, res: Response) {
  const user = await getMeService(req.userId as string);
  res.json(user);
}

export async function patchMe(req: Request, res: Response) {
  const input = updateProfileSchema.parse(req.body);
  const user = await updateProfile(req.userId as string, input);
  res.json(user);
}
