import { Router } from "express";
import {
  createTaskController,
  getTaskByIdController,
  updateTaskController,
  moveTaskPositionController,
} from "./tasks.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router();

router.post("/create", protect, createTaskController);
router.get("/:taskId", protect, getTaskByIdController);
router.patch("/:taskId", protect, updateTaskController);
router.patch("/:taskId/move", protect, moveTaskPositionController);

export default router;
