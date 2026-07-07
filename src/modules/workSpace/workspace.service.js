import {
  createWorkSpace,
  getAllWorkSpacesRepo,
  getWorkSpaceById,
  updateWorkSpace,
  deleteWorkSpace,
  findMemberAndUpdateRoleRepo,
  findWorkspaceMembersRepo,
} from "./workspace.reposotry.js";
import { workspaceModel } from "./workspace.modle.js";
import { getUserViaEmail } from "../users/user.reposotry.js";
import { formatWorkspace } from "../../shared/utils/workSpaceResponce.js";
import appErrors from "../../shared/errors/appErrors.js";
import { sendEmail } from "../../shared/utils/email.service.js";
import { workspaceInviteTemplate } from "../../shared/utils/workspaceInvite.template.js";
import { userModel } from "../users/user.model.js";

export const createWorkSpaceService = async function (
  ownerID,
  { name, description },
) {
  const workspace = await createWorkSpace({
    name,
    description,
    owner: ownerID,
  });
  return formatWorkspace(workspace);
};

export const getAllWorkSpacesToUser = async function (userId) {
  const workspaces = await getAllWorkSpacesRepo(userId);

  return workspaces.map((w) => formatWorkspace(w));
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
  return formatWorkspace(workspace);
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
  return formatWorkspace(workspace);
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
  return formatWorkspace(workspace);
};

export const findMemberAndUpdateRoleService = async function (
  workspcaeId,
  userID,
  ownerid,
  role,
) {
  const workspace = await getWorkSpaceById(workspcaeId);

  if (!workspace) {
    throw new appErrors("Workspace not found", 404);
  }
  const user = workspace.members.find(
    (m) => m.user.toString() === userID.toString(),
  );
  if (!user) {
    throw new appErrors("User not found", 404);
  }
  if (!workspace.isOwner(ownerid)) {
    throw new appErrors("only the owner can update the role ", 403);
  }
  const ownerCount = workspace.members.filter((m) => m.role === "owner").length;
  if (user.role === "owner" && ownerCount === 1 && role !== "owner") {
    throw new appErrors("A workspace must have at least one owner", 400);
  }

  const updatedWorkspace = await findMemberAndUpdateRoleRepo(
    workspaceId,
    userID,
    role,
  );
  return formatWorkspace(updatedWorkspace);
};

export const checkUserWorkspaceMembership = async (userId, workspaceId) => {
  // the exists method its need a index for the workspace and members.user field to be fast
  // also its more efficient than findOne because it will stop searching once it find a match
  // its only search in the index without loading the full document like findOne does
  const workspace = await workspaceModel.findOne(
    {
      _id: workspaceId,
      "members.user": userId,
      isDeleted: false,
    },
    { members: 1 },
  );

  if (!workspace) {
    throw new appErrors("You are not a member of this workspace", 403);
  }

  return workspace;
};

export const getWorkspaceMembersService = async function ({
  userId,
  workspaceId,
}) {
  await checkUserWorkspaceMembership(userId, workspaceId);

  const workspaceData = await findWorkspaceMembersRepo(workspaceId);
  if (!workspaceData) {
    throw new appError("Workspace not found", 404);
  }

  const formattedMembers = workspaceData.members
    .filter((member) => member.user)
    .map((member) => ({
      id: member.user._id,
      name: member.user.name,
      email: member.user.email,
      avatar: member.user.avatar || null,
      role: member.role,
    }));

  return formattedMembers;
};

export const addMemberDirectly = async ({
  workspaceId,
  targetUserId,
  role = "member",
  requestingUserId,
}) => {
  const workspace = await workspaceModel
    .findById(workspaceId)
    .select("owner members name isDeleted");

  if (!workspace || workspace.isDeleted) {
    throw new appErrors("Workspace not found.", 404);
  }

  if (workspace.owner.toString() !== requestingUserId.toString()) {
    throw new appErrors("Only the workspace owner can add members.", 403);
  }

  if (workspace.members.length >= 50) {
    throw new appErrors("Workspace has reached the limit of 50 members.", 400);
  }

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === targetUserId.toString(),
  );

  if (alreadyMember) {
    throw new appErrors("This user is already a workspace member.", 409);
  }

  const userExists = await userModel
    .findById(targetUserId)
    .select("_id displayName name email");

  if (!userExists) {
    throw new appErrors("User not found.", 404);
  }

  workspace.members.push({
    user: targetUserId,
    role,
    joinedAt: new Date(),
  });

  await workspace.save();

  return {
    message: "Member added successfully.",
    member: {
      _id: userExists._id,
      displayName: userExists.displayName || userExists.name,
      email: userExists.email,
      role,
    },
  };
};
