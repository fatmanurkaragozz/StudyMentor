import cors from "cors";
import express from "express";
import { router } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
