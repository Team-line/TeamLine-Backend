import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import ratelimit from "express-rate-limit";

import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/users/user.route.js";
import workSpaceRouter from "./modules/workSpace/workspace.route.js";
import boardRouter from "./modules/Board/board.route.js";

import appErrors from "./shared/errors/appErrors.js";

import { globalErrorMiddleware } from "./shared/middlewares/globalErrorMiddleWare.js";
import { NODE_ENV } from "./config/env.js";
const app = express();

app.use(helmet());

if (NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(
  // TODO in the production (https://your-production-domain.com)
  cors({
    origin:
      NODE_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:3000",
    credentials: true, // its for the allow cookies and the authorization header

    optionsSuccessStatus: 200,
  }),
);

app.use(
  express.json({
    limit: "10kb",
  }),
);

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
app.use((req, res, next) => {
  next(new appErrors(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorMiddleware);
export default app;
