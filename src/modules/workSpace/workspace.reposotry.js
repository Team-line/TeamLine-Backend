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
    new: true,
    runValidators: true,
  });
};

export const deleteWorkSpace = async function (id) {
  return workspaceModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() },
    { new: true },
  );
};
