import { Router } from "express";
import {
  createTaskController,
  getTaskByIdController,
} from "./tasks.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router();

router.post("/create", protect, createTaskController);
router.get("/:taskId", protect, getTaskByIdController);

export default router;
