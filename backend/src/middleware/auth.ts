import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing token", "TOKEN_MISSING");
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch (err) {
    // Suresi dolmus (TOKEN_EXPIRED) vs baska sekilde gecersiz (imza/format) ayrimi -
    // frontend bunu gorunce sessizce /auth/refresh denemeli mi yoksa dogrudan
    // login'e mi atmali karar verebiliyor.
    if (err instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Token expired", "TOKEN_EXPIRED");
    }
    throw new HttpError(401, "Invalid token", "TOKEN_INVALID");
  }
}
