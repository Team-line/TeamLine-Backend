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

export const findBoardByIdAndWorkspaceId = function (boardId, workspaceId) {
  return boardModel.findOne({
    _id: boardId,
    workspace: workspaceId,
    isDeleted: false,
  });
};

export const findColumnINBoard = function (boardId, workspaceId, columnId) {
  return boardModel.findOne(
    {
      _id: boardId,
      workspace: workspaceId,
      isDeleted: false,
    },
    { columns: { $elemMatch: { _id: columnId } } },
    // this will return the board with only the matching column in the columns array
    // { "_id": "board_111","columns": [{ "_id": "col_bbb", "name": "In Progress", "order": 1 }] }
  );
};

export const findColumnsByBoardId = function (boardId, workspaceId) {
  return boardModel.findOne(
    {
      _id: boardId,
      workspace: workspaceId,
      isDeleted: false,
    },
    { columns: 1 },
  );
};
