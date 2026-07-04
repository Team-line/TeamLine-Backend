import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import {
  startTimer,
  stopTimer,
  addManualEntry,
  editTimeEntry,
  deleteTimeEntry,
  getTaskTimeEntries,
  getActiveTimer,
} from "./timeEntry.service.js";

export const startTimerHandler = asyncWrapper(async (req, res) => {
  const entry = await startTimer({
    taskId: req.params.taskId,
    userId: req.user.id,
  });
  res.status(201).json({ status: "success", data: entry });
});

export const stopTimerHandler = asyncWrapper(async (req, res) => {
  const entry = await stopTimer({
    taskId: req.params.taskId,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", data: entry });
});

export const addManualEntryHandler = asyncWrapper(async (req, res) => {
  const entry = await addManualEntry({
    taskId: req.params.taskId,
    userId: req.user.id,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    note: req.body.note,
  });
  res.status(201).json({ status: "success", data: entry });
});

export const editTimeEntryHandler = asyncWrapper(async (req, res) => {
  const entry = await editTimeEntry({
    entryId: req.params.id,
    userId: req.user.id,
    updateData: req.body,
  });
  res.status(200).json({ status: "success", data: entry });
});

export const deleteTimeEntryHandler = asyncWrapper(async (req, res) => {
  await deleteTimeEntry({
    entryId: req.params.id,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", message: "Time entry deleted." });
});

export const getTaskTimeEntriesHandler = asyncWrapper(async (req, res) => {
  const data = await getTaskTimeEntries({
    taskId: req.params.taskId,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", data });
});

export const getActiveTimerHandler = asyncWrapper(async (req, res) => {
  const timer = await getActiveTimer(req.user.id);
  res.status(200).json({ status: "success", data: timer });
});
