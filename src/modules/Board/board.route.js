import { Router } from "express";
import {
  createBoardController,
  addCoulmnToBOardController,
} from "./board.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router({ mergeParams: true });

router.post("/", protect, createBoardController);

router.post("/:boardId/columns", protect, addCoulmnToBOardController);
export default router;
