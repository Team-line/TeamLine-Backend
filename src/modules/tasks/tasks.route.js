import { Router } from "express";
import {
  createTaskController,
  getTaskByIdController,
  updateTaskController,
  moveTaskPositionController,
  deleteTaskController,
  assignTaskController,
  getAllTasksController,
  toggleCompleteTaskController,
} from "./tasks.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router({ mergeParams: true });

router.post("/", protect, createTaskController);
router.get("/", protect, getAllTasksController);
router.get("/:taskId", protect, getTaskByIdController);
router.patch("/:taskId", protect, updateTaskController);
router.patch("/:taskId/move", protect, moveTaskPositionController);
router.delete("/:taskId", protect, deleteTaskController);

router.patch("/:taskId/assign", protect, assignTaskController);

router.patch("/:taskId/complete", protect, toggleCompleteTaskController);

export default router;
