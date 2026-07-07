import { workspaceModel } from "./workspace.modle.js";
export const createWorkSpace = async function (data) {
  return workspaceModel.create(data);
};

export const getAllWorkSpacesRepo = async function (userId) {
  return workspaceModel.findByMember(userId);
};

export const getWorkSpaceById = async function (id) {
  return workspaceModel.findOne({ _id: id, isDeleted: false });
};

export const updateWorkSpace = async function (id, data) {
  return workspaceModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    returnDocument: "after",
    runValidators: true,
  });
};

export const deleteWorkSpace = async function (id) {
  return workspaceModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { returnDocument: "after" },
  );
};

export const findWorkspaceMembersRepo = async (workspaceId) => {
  return workspaceModel
    .findById(workspaceId)
    .select("members")
    .populate("members.user", "name email avatar");
};
// ********************* invetation code *****************8

export const updateInvitationStatusRepo = async function (inviteId, status) {
  return invitationModel.findByIdAndUpdate(
    inviteId,
    { status },
    { returnDocument: "after" },
  );
};

export const findMemberAndUpdateRoleRepo = async function (
  workspaceID,
  userId,
  role,
) {
  return workspaceModel.findOneAndUpdate(
    {
      _id: workspaceID,
      "members.user": userId,
      isDeleted: false,
    },
    {
      $set: {
        "members.$.role": role,
      },
    },
    {
      runValidators: true,
      returnDocument: "after",
    },
  );
};
