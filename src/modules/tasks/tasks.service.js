import {
  createTask,
  findTaskRepo,
  findTaskWithoutPopulate,
  findAllTasksInBoardRepo,
} from "./tasks.repo.js";
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

export const updateTaskService = async function ({
  userId,
  taskId,
  updateData,
}) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new appError("Invalid Task identity format", 400);
  }

  const task = await findTaskRepo(taskId);
  if (!task || task.isDeleted) {
    throw new appError("Task not found", 404);
  }

  await checkUserWorkspaceMembership(userId, task.workspace);

  const allowedFields = ["name", "description", "assignees", "labels"];
  const allowedUpdateData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      allowedUpdateData[field] = updateData[field];
    }
  });

  if (Object.keys(allowedUpdateData).length === 0) {
    return formatTaskResponse(task);
  }
  task.set(allowedUpdateData);
  await task.save();

  return formatTaskResponse(task);
};

export const moveTaskPositionService = async function ({
  userId,
  taskId,
  columnId,
  newOrder,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(taskId) ||
    !mongoose.Types.ObjectId.isValid(columnId)
  ) {
    throw new appError("Invalid Task or Column identity format", 400);
  }

  if (typeof newOrder !== "number" || newOrder < 1) {
    throw new appError("New order must be a valid positive number", 400);
  }

  const task = await findTaskRepo(taskId);
  if (!task || task.isDeleted) {
    throw new appError("Task not found", 404);
  }

  await checkUserWorkspaceMembership(userId, task.workspace);

  const TaskModel = mongoose.model("Task");
  const oldColumnId = task.column;
  const oldOrder = task.order;

  const isColumnChanged = oldColumnId.toString() !== columnId.toString();
  const isOrderChanged = oldOrder !== newOrder;

  if (!isColumnChanged && !isOrderChanged) {
    return formatTaskResponse(task);
  }

  // Validate column transition if the column has changed
  if (isColumnChanged) {
    await validateColumnTransition({
      currentBoardId: task.board,
      currentWorkspaceId: task.workspace,
      newColumnId: columnId,
    });
  }

  // ! if the task is moving within the same column, we need to adjust the order of other tasks in that column
  if (!isColumnChanged && isOrderChanged) {
    // ! 1) If the task is moving up (to a lower order number), we need to increment the order of tasks that are between the new and old order
    if (newOrder < oldOrder) {
      await TaskModel.updateMany(
        {
          board: task.board,
          column: oldColumnId,
          order: { $gte: newOrder, $lt: oldOrder }, //
          isDeleted: false,
        },
        { $inc: { order: 1 } },
      );
      // ! 2) If the task is moving down (to a higher order number), we need to decrement the order of tasks that are between the old and new order
    } else {
      await TaskModel.updateMany(
        {
          board: task.board,
          column: oldColumnId,
          order: { $gt: oldOrder, $lte: newOrder },
          isDeleted: false,
        },
        { $inc: { order: -1 } },
      );
    }
  }
  // ! if the task is moving to a different column, we need to adjust the order of tasks in both the old and new columns
  else if (isColumnChanged) {
    await TaskModel.updateMany(
      {
        board: task.board,
        column: oldColumnId,
        order: { $gt: oldOrder },
        isDeleted: false,
      },
      { $inc: { order: -1 } },
    );

    await TaskModel.updateMany(
      {
        board: task.board,
        column: columnId,
        order: { $gte: newOrder },
        isDeleted: false,
      },
      { $inc: { order: 1 } },
    );
  }

  task.column = columnId;
  task.order = newOrder;
  await task.save();

  return formatTaskResponse(task);
};

export const validateColumnTransition = async function ({
  currentBoardId,
  currentWorkspaceId,
  newColumnId,
}) {
  if (!mongoose.Types.ObjectId.isValid(newColumnId)) {
    throw new appError("Invalid target column identity format", 400);
  }

  const boardInWorkspace = await findBoardByIdAndWorkspaceId(
    currentBoardId,
    currentWorkspaceId,
  );

  if (!boardInWorkspace) {
    throw new appError(
      "The board associated with this task does not belong to the workspace.",
      400,
    );
  }

  const columnExists = boardInWorkspace.columns.some(
    (col) => col._id.toString() === newColumnId.toString(),
  );

  if (!columnExists) {
    throw new appError(
      "The specified target column does not belong to this board.",
      400,
    );
  }
};

export const deleteTaskService = async function ({ userId, taskId }) {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new appError("Invalid Task identity format", 400);
  }

  const task = await findTaskRepo(taskId);
  if (!task || task.isDeleted) {
    throw new appError("Task not found or already deleted", 404);
  }

  await checkUserWorkspaceMembership(userId, task.workspace);

  const TaskModel = mongoose.model("Task");
  const deletedOrder = task.order;
  const columnId = task.column;

  await TaskModel.updateMany(
    {
      board: task.board,
      column: columnId,
      order: { $gt: deletedOrder },
      isDeleted: false,
    },
    { $inc: { order: -1 } },
  );

  task.isDeleted = true;
  task.order = 0;
  await task.save();

  return { message: "Task deleted successfully and column order re-aligned" };
};

export const assignTaskService = async function ({
  taskId,
  userId,
  assigneesId,
}) {
  // 1) check if the task exists and is not deleted
  const task = await findTaskWithoutPopulate(taskId);
  if (!task || task.isDeleted) {
    throw new appError("Task not found or already deleted", 404);
  }

  //2) check if the user is the owner of the task
  if (userId.toString() !== task.createdBy.toString()) {
    throw new appError(
      "You are not the owner of this task the owner can assign the task only",
      403,
    );
  }
  // 3) check if the user is a member of the workspace
  const workspace = await checkUserWorkspaceMembership(userId, task.workspace);

  // 4) check if the assigneesId is an array and has at most 5 members
  console.log(assigneesId);
  console.log(assigneesId.length);

  if (!Array.isArray(assigneesId) || assigneesId.length > 5) {
    throw new appError(
      "Assignees must be an array with at most 5 members",
      400,
    );
  }

  // 5) cheak if the assigneesId are valid ObjectIds

  for (const assigneeId of assigneesId) {
    if (!mongoose.Types.ObjectId.isValid(assigneeId)) {
      throw new appError(
        `Invalid assignee identity format: ${assigneeId}`,
        400,
      );
    }
  }

  // 6) cheak if the assigneesId are members of the workspace
  // its for a convert to string to compare with the assigneesId
  const workspaceMemberIds = workspace.members.map((member) =>
    member.user.toString(),
  );

  const allAssigneesAreMembers = assigneesId.every((assigneeId) =>
    workspaceMemberIds.includes(assigneeId.toString()),
  );

  if (!allAssigneesAreMembers) {
    throw new appError("All assignees must be members of the workspace", 400);
  }

  // 7) assign the task to the assigneesId

  task.assignees = assigneesId;

  await task.save();
  await task.populate("assignees", "name email");

  // ToDo before saving the task send email to the assignees that they have been assigned to the task

  return {
    message: "Task assigned successfully",
    task: formatTaskResponse(task),
  };
};

export const getAllTasksService = async function ({
  userId,
  workspaceId,
  boardId,
}) {
  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    throw new appError("Invalid Workspace identity format", 400);
  }
  if (!mongoose.Types.ObjectId.isValid(boardId)) {
    throw new appError("Invalid Board identity format", 400);
  }

  await checkUserWorkspaceMembership(userId, workspaceId);

  const boardInWorkspace = await findBoardByIdAndWorkspaceId(
    boardId,
    workspaceId,
  );
  if (!boardInWorkspace) {
    throw new appError(
      "The board associated with these tasks does not belong to the workspace.",
      400,
    );
  }

  const tasks = await findAllTasksInBoardRepo(boardId);

  return tasks.map(formatTaskResponse);
};
