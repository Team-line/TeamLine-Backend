import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import ratelimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.route.js";
import workSpaceRouter from "./modules/workSpace/workspace.route.js";
import boardRouter from "./modules/Board/board.route.js";
import taskRouter from "./modules/tasks/tasks.route.js";
import timerRouter from "./modules/time-tracking/timeEntry.routes.js";
import reportRouter from "./modules/reports/report.routes.js";

import appErrors from "./shared/errors/appErrors.js";

import { globalErrorMiddleware } from "./shared/middlewares/globalErrorMiddleWare.js";
import { NODE_ENV } from "./config/env.js";
const app = express();

app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: [
      "https://team-line-frontend-eight.vercel.app",
      "http://localhost:3000",
      "http://localhost:5500",
    ],
    credentials: true,
  }),
);

//! testing the html form data
app.use(express.urlencoded({ extended: true }));

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(cookieParser());

const authLimiter = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes to reset the count
  max: 20,

  message: {
    status: "fail",
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info thats stay in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the unstandard `X-RateLimit-*` headers
});
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspaces", workSpaceRouter);
app.use("/api/v1/workspaces/:workspaceId/boards", boardRouter);
app.use("/api/v1/boards", boardRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/workspaces/:workspaceId/boards/:boardId/tasks", taskRouter);
app.use(
  "/api/v1/workspaces/:workspaceId/boards/:boardId/columns/:columnId/tasks",
  taskRouter,
);
app.use("/api/v1/timers", timerRouter);
app.use("/api/v1/reports", reportRouter);
app.use((req, res, next) => {
  next(new appErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorMiddleware);
export default app;
