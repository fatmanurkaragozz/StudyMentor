import { Router } from "express";
import { prisma } from "../config/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

healthRouter.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (error) {
    res.status(503).json({ status: "unavailable", error: (error as Error).message });
  }
});
