import { Router } from "express";
import {
  createWorkSpaceController,
  getAllWorkSpacesController,
  getWorkSpaceByIdController,
  updateWorkSpaceController,
  deleteWorkSpaceController,
} from "./workspace.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import { createWorkspaceSchema } from "./workspace.valedator.js";
const workSpaceRouter = Router();

workSpaceRouter.post(
  "/",
  protect,
  validateRequest(createWorkspaceSchema),
  createWorkSpaceController,
);

workSpaceRouter.get("/", protect, getAllWorkSpacesController);

workSpaceRouter.get("/:id", protect, getWorkSpaceByIdController);

workSpaceRouter.patch("/:id", protect, updateWorkSpaceController);

workSpaceRouter.delete("/:id", protect, deleteWorkSpaceController);
export default workSpaceRouter;
