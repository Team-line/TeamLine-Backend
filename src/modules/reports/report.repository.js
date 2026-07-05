import mongoose from "mongoose";
import { timeEntryModel } from "../time-tracking/timeEntry.model.js";

export class ReportRepository {
  async getTimePerUser({ workspaceId, startDate, endDate, boardId }) {
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      endTime: { $ne: null },
      startTime: { $gte: startDate, $lte: endDate },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskData",
        },
      },
      { $unwind: "$taskData" },
    ];

    if (boardId) {
      pipeline.push({
        $match: { "taskData.board": new mongoose.Types.ObjectId(boardId) },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $group: {
          _id: "$user",
          userName: { $first: "$userData.name" },
          userEmail: { $first: "$userData.email" },
          totalSeconds: { $sum: "$durationSeconds" },
          uniqueTasks: { $addToSet: "$task" },
        },
      },
      {
        $project: {
          userName: 1,
          userEmail: 1,
          totalSeconds: 1,
          taskCount: { $size: "$uniqueTasks" },
        },
      },
      { $sort: { totalSeconds: -1 } },
    );

    return timeEntryModel.aggregate(pipeline);
  }

  async getTimePerTask({ workspaceId, startDate, endDate, boardId }) {
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      endTime: { $ne: null },
      startTime: { $gte: startDate, $lte: endDate },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskData",
        },
      },
      { $unwind: "$taskData" },
    ];

    if (boardId) {
      pipeline.push({
        $match: { "taskData.board": new mongoose.Types.ObjectId(boardId) },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: "$task",
          taskTitle: { $first: "$taskData.name" },
          totalSeconds: { $sum: "$durationSeconds" },
          logCount: { $sum: 1 },
        },
      },
      { $sort: { totalSeconds: -1 } },
    );

    return timeEntryModel.aggregate(pipeline);
  }

  async getTaskStats({ workspaceId, boardId }) {
    const Task = mongoose.model("Task");
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
    };

    if (boardId) {
      matchStage.board = new mongoose.Types.ObjectId(boardId);
    }

    const result = await Task.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$dueDate", null] },
                    { $lt: ["$dueDate", new Date()] },
                    { $eq: ["$isCompleted", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    return result[0] || { total: 0, completed: 0, overdue: 0 };
  }

  async getAllEntriesRaw({ workspaceId, startDate, endDate, boardId }) {
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      endTime: { $ne: null },
      startTime: { $gte: startDate, $lte: endDate },
    };

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "tasks",
          localField: "task",
          foreignField: "_id",
          as: "taskData",
        },
      },
      { $unwind: "$taskData" },
    ];

    if (boardId) {
      pipeline.push({
        $match: { "taskData.board": new mongoose.Types.ObjectId(boardId) },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $project: {
          taskId: "$taskData._id",
          taskTitle: "$taskData.title",
          userName: "$userData.displayName",
          userEmail: "$userData.email",
          startTime: 1,
          endTime: 1,
          durationSeconds: 1,
          note: 1,
          isManual: 1,
        },
      },
      { $sort: { startTime: -1 } },
    );

    return timeEntryModel.aggregate(pipeline);
  }
}
