import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: [config.frontendOrigin], credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
