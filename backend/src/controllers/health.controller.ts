import type { Request, Response } from "express";
import { checkDatabaseConnection } from "../services/health.service.js";

export function getHealth(_req: Request, res: Response) {
  res.json({ status: "ok" });
}

export async function getDbHealth(_req: Request, res: Response) {
  try {
    await checkDatabaseConnection();
    res.json({ status: "ok" });
  } catch (error) {
    res.status(503).json({ status: "unavailable", error: (error as Error).message });
  }
}
