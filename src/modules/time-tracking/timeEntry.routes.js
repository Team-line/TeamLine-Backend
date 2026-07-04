import { Router } from "express";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  startTimerHandler,
  stopTimerHandler,
  addManualEntryHandler,
  editTimeEntryHandler,
  deleteTimeEntryHandler,
  getTaskTimeEntriesHandler,
  getActiveTimerHandler,
} from "./timeEntry.controller.js";
import { manualEntrySchema, editEntrySchema } from "./timeEntry.validation.js";

const timerRouter = Router();

timerRouter.get("/active", protect, getActiveTimerHandler);

timerRouter.post("/tasks/:taskId/start", protect, startTimerHandler);

timerRouter.post("/tasks/:taskId/stop", protect, stopTimerHandler);

timerRouter.post(
  "/tasks/:taskId/manual",
  protect,
  validateRequest(manualEntrySchema),
  addManualEntryHandler,
);

timerRouter.get("/tasks/:taskId/entries", protect, getTaskTimeEntriesHandler);

timerRouter.patch(
  "/entries/:id",
  protect,
  validateRequest(editEntrySchema),
  editTimeEntryHandler,
);

timerRouter.delete("/entries/:id", protect, deleteTimeEntryHandler);

export default timerRouter;
