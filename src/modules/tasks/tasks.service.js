import { createTask, findTaskRepo } from "./tasks.repo.js";
import { checkUserWorkspaceMembership } from "../workSpace/workspace.service.js";
import { findBoardByIdAndWorkspaceId } from "../Board/board.repo.js";
import { formatTaskResponse } from "../../shared/utils/task.res.js";
import appError from "../../shared/errors/appErrors.js";
import mongoose from "mongoose";
export const craeteTask = async function (taskData) {
  const {
    name,
    description,
    workspace,
    board,
    column,
    assignees,
    labels,
    order,
    userId,
  } = taskData;

  if (
    !mongoose.Types.ObjectId.isValid(workspace) ||
    !mongoose.Types.ObjectId.isValid(board) ||
    !mongoose.Types.ObjectId.isValid(column)
  ) {
    throw new appError(
      "Invalid Workspace, Board, or Column identity format",
      400,
    );
  }

  await checkUserWorkspaceMembership(userId, workspace);

  const boardInWorkspace = await findBoardByIdAndWorkspaceId(board, workspace);
  if (!boardInWorkspace) {
    throw new appError(
      "The specified board does not belong to the provided workspace.",
      400,
    );
  }
  const columnExists = boardInWorkspace.columns.some(
    (col) => col._id.toString() === column.toString(),
  );
  if (!columnExists) {
    throw new appError(
      "The specified column does not belong to this board.",
      400,
    );
  }
  const currentTasksCount = await mongoose.model("Task").countDocuments({
    board,
    column,
    isDeleted: false,
  });
  const task = await createTask({
    name,
    description,
    workspace,
    board,
    column,
    createdBy: userId,
    assignees: assignees || [],
    labels: labels || [],
    order: currentTasksCount + 1,
  });

  return formatTaskResponse(task);
};

export const getTaskByIdService = async function ({ userId, taskId }) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new appError("Invalid Task identity format", 400);
  }

  const task = await findTaskRepo(taskId);
  if (!task || task.isDeleted) {
    throw new appError("Task not found", 404);
  }

  const workspaceId = task.workspace;
  const boardId = task.board;
  const columnId = task.column;

  await checkUserWorkspaceMembership(userId, workspaceId);

  const boardInWorkspace = await findBoardByIdAndWorkspaceId(
    boardId,
    workspaceId,
  );
  if (!boardInWorkspace) {
    throw new appError(
      "The board associated with this task does not belong to the workspace.",
      400,
    );
  }

  const columnExists = boardInWorkspace.columns.some(
    (col) => col._id.toString() === columnId.toString(),
  );
  if (!columnExists) {
    throw new appError(
      "The column associated with this task does not belong to this board.",
      400,
    );
  }

  return formatTaskResponse(task);
};
