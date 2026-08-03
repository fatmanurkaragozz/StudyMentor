import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing token");
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}
