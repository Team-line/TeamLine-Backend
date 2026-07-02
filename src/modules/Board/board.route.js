import { Router } from "express";
import {
  createBoardController,
  addCoulmnToBOardController,
  getAllBoardsInWorkspaceController,
  getBoardByIdController,
  updateBoardController,
  deleteBoardController,
  changeCoulmnNameController,
  deleteCoulmnController,
  getCoulmnByIdController,
  getAllCoulmnsController,
} from "./board.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
const router = Router({ mergeParams: true });

router.post("/", protect, createBoardController);
router.get("/", protect, getAllBoardsInWorkspaceController);
router.get("/:boardId", protect, getBoardByIdController);
router.patch("/:boardId", protect, updateBoardController);
router.delete("/:boardId", protect, deleteBoardController);
router.get("/:boardId/columns", protect, getAllCoulmnsController);

router.patch(
  "/:boardId/columns/:columnId",
  protect,
  changeCoulmnNameController,
);

router.delete("/:boardId/columns/:columnId", protect, deleteCoulmnController);
router.get("/:boardId/columns/:columnId", protect, getCoulmnByIdController);

router.post("/:boardId/columns", protect, addCoulmnToBOardController);
export default router;
