import { Router } from "express";
import {
  createWorkSpaceController,
  getAllWorkSpacesController,
  getWorkSpaceByIdController,
  updateWorkSpaceController,
  deleteWorkSpaceController,
  getWorkspaceMembersController,
  addMemberDirectlyHandler,
} from "./workspace.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
} from "./workspace.valedator.js";
const workSpaceRouter = Router();

workSpaceRouter.post(
  "/",
  protect,
  validateRequest(createWorkspaceSchema),
  createWorkSpaceController,
);

workSpaceRouter.get("/", protect, getAllWorkSpacesController);

workSpaceRouter.get("/:id", protect, getWorkSpaceByIdController);

workSpaceRouter.patch(
  "/:id",
  protect,
  validateRequest(updateWorkspaceSchema),
  updateWorkSpaceController,
);

workSpaceRouter.delete("/:id", protect, deleteWorkSpaceController);

workSpaceRouter.post("/:id/members", protect, addMemberDirectlyHandler);

workSpaceRouter.get(
  "/:workspaceId/members",
  protect,
  getWorkspaceMembersController,
);
export default workSpaceRouter;
