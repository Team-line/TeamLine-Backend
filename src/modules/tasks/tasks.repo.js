import { TaskModle } from "./tasks.modle.js";

export const createTask = async (taskData) => {
  return TaskModle.create(taskData);
};

export const findTaskRepo = async (taskId) => {
  return TaskModle.findOne({ _id: taskId }).populate("assignees", "name email");
};
