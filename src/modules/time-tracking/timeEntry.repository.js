import mongoose from "mongoose";
import { timeEntryModel } from "./timeEntry.model.js";

export class TimeEntryRepository {
  async create(data) {
    return timeEntryModel.create(data);
  }

  async findById(id) {
    return timeEntryModel.findById(id);
  }
  async findActiveTimer(userId) {
    return timeEntryModel
      .findOne({ user: userId, endTime: null })
      .populate("task", "title workspace");
  }

  async findByTask(taskId) {
    return timeEntryModel
      .find({ task: taskId })
      .populate("user", "displayName email avatarUrl")
      .sort({ startTime: -1 })
      .lean();
  }

  async save(entry) {
    return entry.save();
  }

  async deleteById(id) {
    return timeEntryModel.findByIdAndDelete(id);
  }

  async getTotalSecondsForTask(taskId) {
    const result = await timeEntryModel.aggregate([
      {
        $match: {
          task: new mongoose.Types.ObjectId(taskId),
          endTime: { $ne: null },
        },
      },
      { $group: { _id: null, total: { $sum: "$durationSeconds" } } },
    ]);
    return result[0]?.total || 0;
  }

  async aggregateForReport({ workspaceId, startDate, endDate, boardId }) {
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
        $match: {
          "taskData.board": new mongoose.Types.ObjectId(boardId),
        },
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
          userId: "$user",
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
