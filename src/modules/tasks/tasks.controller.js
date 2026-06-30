import {
  craeteTask,
  getTaskByIdService,
  updateTaskService,
  moveTaskPositionService,
  deleteTaskService,
  assignTaskService,
} from "./tasks.service.js";
import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";

export const createTaskController = asyncWrapper(async (req, res) => {
  const {
    name,
    description,
    workspace,
    board,
    column,
    createdBy,
    assignees,
    labels,
    order,
  } = req.body;

  const userId = req.user.id;

  const task = await craeteTask({
    name,
    description,
    workspace,
    board,
    column,
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
