import { craeteTask, getTaskByIdService } from "./tasks.service.js";
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
