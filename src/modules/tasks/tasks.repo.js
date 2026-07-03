import { TaskModle } from "./tasks.modle.js";

export const createTask = async (taskData) => {
  return TaskModle.create(taskData);
};

export const findTaskRepo = async (taskId) => {
  return TaskModle.findOne({ _id: taskId, isDeleted: false }).populate(
    "assignees",
    "name email",
  );
};

export const findTaskWithoutPopulate = async function (taskId) {
  return TaskModle.findOne({ _id: taskId, isDeleted: false });
};

export const findAllTasksInBoardRepo = async (boardId) => {
  return TaskModle.find({ board: boardId, isDeleted: false })
    .populate("assignees", "name email")
    .sort({ order: 1 });
};
