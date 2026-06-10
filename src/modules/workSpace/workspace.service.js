import {
  createWorkSpace,
  getAllWorkSpacesRepo,
  getWorkSpaceById,
  updateWorkSpace,
  deleteWorkSpace,
} from "./workspace.reposotry.js";

import appErrors from "../../shared/errors/appErrors.js";
export const createWorkSpaceService = async function (
  ownerID,
  { name, description },
) {
  const workspace = await createWorkSpace({
    name,
    description,
    owner: ownerID,
  });
  return workspace;
};

// ToDO its for the role admin

export const getAllWorkSpacesToUser = async function (userId) {
  const workspaces = await getAllWorkSpacesRepo(userId);

  return workspaces;
};

export const getWorkSpaceByIdService = async function (id, userId) {
  const workspace = await getWorkSpaceById(id);
  if (!workspace) {
    throw new appErrors("Workspace not found", 404);
  }
  // this to prevent anyone whos not belong to the workspace to got the workspace details
  const hasAccess = workspace.isOwner(userId) || workspace.isMember(userId);
  if (!hasAccess) {
    throw new appErrors(
      "only the owner or members can access the workspace",
      401,
    );
  }
  return workspace;
};

export const updateWOrkSpaceService = async function (id, userId, data) {
  const workspace = await updateWorkSpace(id, data);
  if (!workspace) {
    throw new appErrors("Workspace not found", 404);
  }
  const hasAccess = workspace.isOwner(userId);
  if (!hasAccess) {
    throw new appErrors(
      "only the owner can access the workspace to update it",
      401,
    );
  }
  return workspace;
};

export const deleteWorkSpaceService = async function (id, userId) {
  const workspace = await deleteWorkSpace(id);
  if (!workspace) {
    throw new appErrors("Workspace not found", 404);
  }
  const hasAccess = workspace.isOwner(userId);
  if (!hasAccess) {
    throw new appErrors(
      "only the owner can access the workspace to delete it",
      401,
    );
  }
  return workspace;
};
