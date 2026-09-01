import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Azure Container Apps'in ingress'i tek proxy hop'u - X-Forwarded-For'u ondan al.
  // Bu olmadan express-rate-limit'in varsayilan keyGenerator'i prod'daki HER istekte
  // (X-Forwarded-For header'i var + trust proxy false) ValidationError firlatiyordu -
  // auth/register dahil tum rate-limitli uclar 500 donuyordu.
  app.set("trust proxy", 1);
  app.use(cors({ origin: [config.frontendOrigin], credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
