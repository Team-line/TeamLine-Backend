import mongoose from "mongoose";
import { TimeEntryRepository } from "./timeEntry.repository.js";
import { workspaceModel } from "../workSpace/workspace.modle.js";
import { TaskModle } from "../tasks/tasks.modle.js";
import appError from "../../shared/errors/appErrors.js";

const repo = new TimeEntryRepository();

const verifyAccess = async (taskId, userId) => {
  const task = await TaskModle.findById(taskId).select("workspace title");
  if (!task) throw new appError("Task not found.", 404);

  const workspace = await workspaceModel
    .findById(task.workspace)
    .select("members");
  if (!workspace) throw new appError("Workspace not found.", 404);

  // to check if the user is a member of the workspace
  const isMember = workspace.members.some(
    (m) => m.user.toString() === userId.toString(),
  );
  if (!isMember)
    throw new appError("Access denied u cant access this task.", 403);

  return task;
};

export const startTimer = async ({ taskId, userId }) => {
  await verifyAccess(taskId, userId);

  const active = await repo.findActiveTimer(userId);
  if (active) {
    throw new appError(
      `You have an active timer on "${active.task?.title || "another task"}". Stop it before starting a new one.`,
      409,
    );
  }

  const task = await TaskModle.findById(taskId).select("workspace");

  return repo.create({
    task: taskId,
    workspace: task.workspace,
    user: userId,
    startTime: new Date(),
    isManual: false, //
  });
};

export const stopTimer = async ({ taskId, userId }) => {
  const active = await repo.findActiveTimer(userId);

  if (!active) {
    throw new appError("You have no active timer.", 404);
  }

  if (active.task._id.toString() !== taskId.toString()) {
    throw new appError(
      `Your active timer is on "${active.task.title}", not this task.`,
      400,
    );
  }

  active.endTime = new Date();
  return repo.save(active);
};

// its
export const addManualEntry = async ({
  taskId,
  userId,
  startTime,
  endTime,
  note,
}) => {
  const task = await verifyAccess(taskId, userId);

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start > new Date())
    throw new appError("Start time cannot be in the future.", 422);
  if (end <= start)
    throw new appError("End time must be after start time.", 422);

  const durationSeconds = Math.floor((end - start) / 1000);
  if (durationSeconds > 86400)
    throw new appError("Duration cannot exceed 24 hours.", 422);

  const fullTask = await TaskModle.findById(taskId).select("workspace");

  return repo.create({
    task: taskId,
    workspace: fullTask.workspace,
    user: userId,
    startTime: start,
    endTime: end,
    durationSeconds,
    note: note || null,
    isManual: true,
  });
};

export const editTimeEntry = async ({ entryId, userId, updateData }) => {
  const entry = await repo.findById(entryId);
  if (!entry) throw new appError("Time entry not found.", 404);

  // Verify the user owns this entry or is the workspace owner
  const workspace = await workspaceModel
    .findById(entry.workspace)
    .select("members owner");
  const isEntryOwner = entry.user.toString() === userId.toString();
  const isWorkspaceOwner = workspace?.owner.toString() === userId.toString();

  if (!isEntryOwner && !isWorkspaceOwner) {
    throw new appError("You are not authorized to edit this entry.", 403);
  }

  if (updateData.startTime) entry.startTime = new Date(updateData.startTime);
  if (updateData.endTime) entry.endTime = new Date(updateData.endTime);
  if (updateData.note !== undefined) entry.note = updateData.note;

  if (entry.endTime && entry.startTime >= entry.endTime) {
    throw new appError("End time must be after start time.", 422);
  }

  if (entry.endTime) {
    entry.durationSeconds = Math.floor(
      (entry.endTime.getTime() - entry.startTime.getTime()) / 1000,
    );
  }

  return repo.save(entry);
};

export const deleteTimeEntry = async ({ entryId, userId }) => {
  const entry = await repo.findById(entryId);
  if (!entry) throw new appError("Time entry not found.", 404);

  const workspace = await workspaceModel
    .findById(entry.workspace)
    .select("owner");
  const isEntryOwner = entry.user.toString() === userId.toString();
  const isWorkspaceOwner = workspace?.owner.toString() === userId.toString();

  if (!isEntryOwner && !isWorkspaceOwner) {
    throw new appError("You are not authorized to delete this entry.", 403);
  }

  return repo.deleteById(entryId);
};

export const getTaskTimeEntries = async ({ taskId, userId }) => {
  await verifyAccess(taskId, userId);

  const entries = await repo.findByTask(taskId);
  const totalSeconds = await repo.getTotalSecondsForTask(taskId);

  return { entries, totalSeconds };
};

export const getActiveTimer = async (userId) => {
  return repo.findActiveTimer(userId);
};
