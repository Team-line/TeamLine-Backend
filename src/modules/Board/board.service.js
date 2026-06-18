import {
  createBoard,
  findBoradByid,
  findBoradByidWithPopulate,
  findAllBoardsInWorkspace,
  updateBoard,
  deleteBoard,
  getCoulmnById,
  updateCoulmnName,
} from "./board.repo.js";
import appErrs from "../../shared/errors/appErrors.js";
import { checkUserWorkspaceMembership } from "../workSpace/workspace.service.js";
import { boardResponse } from "../../shared/utils/boaed.response.js";
export const createBoardService = async function (
  userId,
  workspaceId,
  { name, description },
) {
  const board = await createBoard({
    name,
    description,
    createdBy: userId,
    workspace: workspaceId,
  });
  return boardResponse(board);
};

export const addCoulmnToBOardService = async function (
  userId,
  boardId,
  { name, order },
) {
  const board = await findBoradByidWithPopulate(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }
  console.log(board);
  console.log(board.workspace);
  console.log(board.workspace.members);

  // ! to check if the user is a member of the board or not
  const isMember = board.workspace.members.some(
    (member) => member.user.toString() === userId.toString(),
  );
  if (!isMember) {
    throw new appErrs("You are not a member of this board", 403);
  }
  if (board.isDeleted) {
    throw new appErrs("Board is deleted", 400);
  }

  if (board.columns.some((column) => column.name === name)) {
    throw new appErrs("Column with this name already exists", 400);
  }

  if (board.columns.length >= 10) {
    throw new appErrs(
      "Maximum number of columns reached cant add more max is 10",
      400,
    );
  }
  const lastColumn = board.columns[board.columns.length - 1];
  const newOrder = lastColumn ? lastColumn.order + 1 : 0;
  board.columns.push({ name, order: newOrder });
  await board.save();

  return boardResponse(board);
};

export const getAllBoardsInWorkspaceService = async function (
  userId,
  workspaceId,
) {
  await checkUserWorkspaceMembership(userId, workspaceId);

  const boards = await findAllBoardsInWorkspace(workspaceId);
  return boards.map(boardResponse);
};

export const getBoardByIdService = async function (
  userId,
  workspaceId,
  boardId,
) {
  await checkUserWorkspaceMembership(userId, workspaceId);
  const board = await findBoradByidWithPopulate(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }
  return boardResponse(board);
};

export const updateBoardService = async function (
  userId,
  workspaceId,
  boardId,
  data,
) {
  await checkUserWorkspaceMembership(userId, workspaceId);
  const board = await findBoradByid(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }

  const allowedFields = ["name", "description"];
  const filteredData = {};
  Object.keys(data).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredData[key] = data[key];
    }
  });

  if (Object.keys(filteredData).length === 0) {
    throw new appErrs("No valid fields provided for update", 400);
  }

  const updatedBoard = await updateBoard(boardId, filteredData);
  return boardResponse(updatedBoard);
};

export const deleteBoardService = async function (
  userId,
  workspaceId,
  boardId,
) {
  await checkUserWorkspaceMembership(userId, workspaceId);
  const board = await findBoradByid(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }
  const deletedBoard = await deleteBoard(boardId);
  return boardResponse(deletedBoard);
};

export const getCoulmnByIdService = async function (
  userId,
  boardId,
  workspaceId,
  columnId,
) {
  const board = await findBoradByid(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }

  await checkUserWorkspaceMembership(userId, workspaceId);

  const column = board.columns.find(
    (c) => c._id.toString() === columnId.toString(),
  );
  if (!column) {
    throw new appErrs("Column not found", 404);
  }

  return column;
};

export const changeCoulmnNameService = async function (
  userId,
  boardId,
  workspaceId,
  columnId,
  newName,
) {
  const board = await findBoradByid(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }
  await checkUserWorkspaceMembership(userId, workspaceId);
  if (board.isDeleted) {
    throw new appErrs("Board is deleted", 400);
  }
  const coulmn = await getCoulmnByIdService(
    userId,
    boardId,
    workspaceId,
    columnId,
  );
  if (!coulmn) {
    throw new appErrs("Column not found", 404);
  }
  if (coulmn.columns.some((column) => column.name === newName)) {
    throw new appErrs("Column with this name already exists", 400);
  }
  const updatedColumn = await updateCoulmnName(boardId, columnId, newName);
  return boardResponse(updatedColumn);
};

export const deleteCoulmnService = async function (userId, boardId, columnId) {
  const board = await findBoradByid(boardId);
  if (!board) {
    throw new appErrs("Board not found", 404);
  }
  await checkUserWorkspaceMembership(userId, workspaceId);
  if (board.isDeleted) {
    throw new appErrs("Board is deleted", 400);
  }
  const coulmn = await getCoulmnById(boardId, columnId);
  if (!coulmn) {
    throw new appErrs("Column not found", 404);
  }

  if (board.columns.length <= 1) {
    throw new appErrs("Cannot delete the last column of the board", 400);
  }

  // this is for the  delete the column from the board and save the board
  board.columns = board.columns.filter(
    (column) => column._id.toString() !== columnId.toString(),
  );
  await board.save();
  return boardResponse(board);
};
