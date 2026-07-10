import {
  createTaskService,
  getTaskByIdService,
  updateTaskService,
  moveTaskPositionService,
  deleteTaskService,
  assignTaskService,
  getAllTasksService,
  toggleCompleteTaskService,
} from "./tasks.service.js";
import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
export const createTaskController = asyncWrapper(async (req, res) => {
  const { name, description, assignees, labels, order } = req.body;
  const { workspaceId, boardId, columnId } = req.params; // Get IDs from URL
  const userId = req.user.id;

  const task = await createTaskService({
    name,
    description,
    workspace: workspaceId,
    board: boardId,
    column: columnId,
    assignees,
    labels,
    order,
    userId,
  });

  res.status(201).json({
    status: "success",
    data: task,
  });
});

export const getTaskByIdController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await getTaskByIdService({ taskId, userId });

  res.status(200).json({
    status: "success",
    data: task,
  });
});

export const updateTaskController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const updatedTask = await updateTaskService({ taskId, userId, updateData });

  res.status(200).json({
    status: "success",
    data: updatedTask,
  });
});

export const moveTaskPositionController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { newPosition, newColumnId } = req.body;
  await moveTaskPositionService({
    taskId,
    userId,
    newOrder: newPosition,
    columnId: newColumnId,
  });
  res.status(200).json({
    status: "success",
    data: null,
  });
});

export const deleteTaskController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const result = await deleteTaskService({ taskId, userId });
  res.status(200).json({
    status: "success",
    data: result,
  });
});

export const assignTaskController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  const { assignees } = req.body;

  const task = await assignTaskService({
    taskId,
    userId,
    assigneesId: assignees,
  });

  res.status(200).json({
    status: "success",
    data: task,
  });
});

export const getAllTasksController = asyncWrapper(async (req, res) => {
  const { workspaceId, boardId } = req.params;
  const userId = req.user.id;

  const tasks = await getAllTasksService({ userId, workspaceId, boardId });

  res.status(200).json({
    status: "success",
    data: tasks,
  });
});

export const toggleCompleteTaskController = asyncWrapper(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;

  const task = await toggleCompleteTaskService({ taskId, userId });

  res.status(200).json({
    status: "success",
    data: task,
  });
});
