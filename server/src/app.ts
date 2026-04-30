import express from "express";
import cors from "cors";

import routes from "./routes";

import { errorMiddleware } from "./middlewares/error.middleware";

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost";

const app = express();

app.use(
  cors({
    origin: `${CORS_ORIGIN}:${PORT}`,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api", routes);

app.use(errorMiddleware);

export default app;
