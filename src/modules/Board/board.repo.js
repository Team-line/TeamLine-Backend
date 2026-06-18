import { boardModel } from "./board.modle.js";

export const createBoard = async function (data) {
  return boardModel.create(data);
};

export const findBoradByid = function (id) {
  return boardModel.findById(id);
};
export const findBoradByidWithPopulate = function (id) {
  return boardModel.findById(id).populate("workspace");
};

export const findAllBoardsInWorkspace = function (workspaceId) {
  return boardModel.find({ workspace: workspaceId, isDeleted: false });
};

export const updateBoard = function (boardId, data) {
  return boardModel
    .findByIdAndUpdate(
      boardId,
      {
        $set: data,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
    .lean();
};

export const deleteBoard = function (boardId) {
  return boardModel
    .findByIdAndUpdate(
      boardId,
      {
        $set: { isDeleted: true },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    )
    .lean();
};

export const getCoulmnById = function (boardId, columnId) {
  return boardModel.findOne({ _id: boardId, "columns._id": columnId });
};

export const updateCoulmnName = function (boardId, columnId, newName) {
  return boardModel.findOneAndUpdate(
    { _id: boardId, "columns._id": columnId },
    { $set: { "columns.$.name": newName } },
    { new: true },
  );
};
