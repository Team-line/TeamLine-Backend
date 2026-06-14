import {
  createBoard,
  findBoradByid,
  findBoradByidWithPopulate,
} from "./board.repo.js";
import appErrs from "../../shared/errors/appErrors.js";
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
