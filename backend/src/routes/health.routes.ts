import { Router } from "express";
import { getHealth, getDbHealth } from "../controllers/health.controller.js";

export const healthRouter = Router();

healthRouter.get("/health", getHealth);
healthRouter.get("/health/db", getDbHealth);
