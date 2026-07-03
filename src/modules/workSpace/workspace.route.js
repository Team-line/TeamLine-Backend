import { Router } from "express";
import {
  createWorkSpaceController,
  getAllWorkSpacesController,
  getWorkSpaceByIdController,
  updateWorkSpaceController,
  deleteWorkSpaceController,
  inviteMemberCOntroller,
  acceptInvitationController,
  getWorkspaceMembersController,
} from "./workspace.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
import {
  createWorkspaceSchema,
  inviteMemberSchema,
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

workSpaceRouter.get(
  "/invitations/:inviteId",
  protect,
  acceptInvitationController,
);

workSpaceRouter.post(
  "/:id/invitations",
  protect,
  validateRequest(inviteMemberSchema),
  inviteMemberCOntroller,
);

workSpaceRouter.get(
  "/:workspaceId/members",
  protect,
  getWorkspaceMembersController,
);
export default workSpaceRouter;
