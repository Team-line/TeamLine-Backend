import { Router } from "express";
import {
  createBoardController,
  addCoulmnToBOardController,
  getAllBoardsInWorkspaceController,
  getBoardByIdController,
  updateBoardController,
  deleteBoardController,
} from "./board.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router({ mergeParams: true });

router.post("/", protect, createBoardController);
router.get("/", protect, getAllBoardsInWorkspaceController);
router.get("/:boardId", protect, getBoardByIdController);
router.patch("/:boardId", protect, updateBoardController);
router.delete("/:boardId", protect, deleteBoardController);

router.post("/:boardId/columns", protect, addCoulmnToBOardController);
export default router;
