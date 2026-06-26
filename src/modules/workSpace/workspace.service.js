import {
  createWorkSpace,
  getAllWorkSpacesRepo,
  getWorkSpaceById,
  updateWorkSpace,
  deleteWorkSpace,
  inviteMemberToWOrkSpaceRepo,
  createInvitationRepo,
  updateInvitationStatusRepo,
  findPendingInvitationByIdRepo,
  findMemberAndUpdateRoleRepo,
} from "./workspace.reposotry.js";
import { workspaceModel } from "./workspace.modle.js";
import { getUserViaEmail } from "../users/user.reposotry.js";
import { formatWorkspace } from "../../shared/utils/workSpaceResponce.js";
import appErrors from "../../shared/errors/appErrors.js";
import { sendEmail } from "../../shared/utils/email.service.js";
import { workspaceInviteTemplate } from "../../shared/utils/workspaceInvite.template.js";
import invitationModel from "../invitation/invitation.modle.js";

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

export const inviteMemberTOWorkSpace = async function (
  workspaceId,
  email,
  userId,
) {
  const user = await getUserViaEmail(email);

  if (!user) {
    throw new appErrors("User not found", 404);
  }
  const workspace = await getWorkSpaceById(workspaceId);
  if (!workspace) {
    throw new appErrors("workspace not found", 404);
  }
  const hasAccess = workspace.isOwner(userId);

  if (!hasAccess) {
    throw new appErrors("only the owner can invite ", 403);
  }

  if (workspace.isOwner(user._id) || workspace.isMember(user._id)) {
    throw new appErrors("User is already part of this workspace", 409);
  }

  const existingInvite = await invitationModel.findOne({
    workspace: workspaceId,
    invitedUser: user._id,
    status: "pending",
  });
  if (existingInvite) {
    throw new appErrors("An invitation is already pending for this user", 400);
  }

  if (workspace.members.length >= 50) {
    throw new appErrors(
      "Workspace has reached the maximum number of members",
      400,
    );
  }

  const invetation = await createInvitationRepo(workspaceId, user._id, userId);
  const inviteLink = `http://localhost:3000/api/v1/workspaces/invitations/${invetation._id}`;

  try {
    const emailSubject = `Invitation to join "${workspace.name}" Workspace`;
    const emailBody = workspaceInviteTemplate(workspace.name, inviteLink);
    await sendEmail(user.email, emailBody, emailSubject);
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw new appErrors(
      "Failed to send invitation email. Please try again later.",
      500,
    );
  }
  return { message: "Invitation sent successfully" };
};

export const acceptInvitationService = async function (inviteId, userId) {
  const invitation = await findPendingInvitationByIdRepo(inviteId);
  if (!invitation) {
    throw new appErrors("Invitation not found or already processed", 404);
  }
  if (invitation.invitedUser.toString() !== userId) {
    throw new appErrors(
      "You are not authorized to accept this invitation",
      403,
    );
  }
  await updateInvitationStatusRepo(inviteId, "accepted");

  const workspace = await inviteMemberToWOrkSpaceRepo(
    invitation.workspace,
    userId,
  );
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
