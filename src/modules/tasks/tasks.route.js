import { Router } from "express";
import {
  createTaskController,
  getTaskByIdController,
  updateTaskController,
  moveTaskPositionController,
  deleteTaskController,
  assignTaskController,
  getAllTasksController,
} from "./tasks.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router({ mergeParams: true });

router.post("/create", protect, createTaskController);
router.get("/", protect, getAllTasksController);
router.get("/:taskId", protect, getTaskByIdController);
router.patch("/:taskId", protect, updateTaskController);
router.patch("/:taskId/move", protect, moveTaskPositionController);
router.delete("/:taskId", protect, deleteTaskController);

router.patch("/:taskId/assign", protect, assignTaskController);

export default router;
