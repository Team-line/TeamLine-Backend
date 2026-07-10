import mongoose from "mongoose";
import { TaskModle } from "../tasks/tasks.modle.js";
import { boardModel } from "../Board/board.modle.js";
import { workspaceModel } from "../workSpace/workspace.modle.js";
import { timeEntryModel } from "../time-tracking/timeEntry.model.js";

export class DashboardRepository {
  async getTaskStats(workspaceId) {
    const result = await TaskModle.aggregate([
      {
        $match: {
          workspace: new mongoose.Types.ObjectId(workspaceId),

          isDeleted: { $ne: true },
        },
      },
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
          active: {
            $sum: { $cond: ["$isCompleted", 0, 1] },
          },
        },
      },
    ]);

    return result[0] || { total: 0, completed: 0, overdue: 0, active: 0 };
  }

  async getBoardCount(workspaceId) {
    return boardModel.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
      isArchived: { $ne: true },
    });
  }

  async getActiveProjects(workspaceId) {
    const boards = await boardModel
      .find({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
      })
      .select("_id name createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const projects = await Promise.all(
      boards.map(async (board) => {
        const taskStats = await TaskModle.aggregate([
          { $match: { board: board._id, isDeleted: { $ne: true } } },
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

        const stats = taskStats[0] || { total: 0, completed: 0, overdue: 0 };
        const progress =
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

        const nearestDueTask = await TaskModle.findOne({
          board: board._id,
          isDeleted: { $ne: true },
          isCompleted: false,
          dueDate: { $ne: null },
        })
          .sort({ dueDate: 1 })
          .select("dueDate")
          .lean();

        return {
          _id: board._id,
          name: board.name,
          progress,
          totalTasks: stats.total,
          completedTasks: stats.completed,
          overdueTasks: stats.overdue,
          nearestDueDate: nearestDueTask?.dueDate || null,
          status: progress === 100 ? "completed" : "active",
        };
      }),
    );

    return projects;
  }

  async getWeeklyTaskStats(workspaceId) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeek = await TaskModle.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
      createdAt: { $gte: oneWeekAgo },
    });

    const lastWeek = await TaskModle.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
      createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
    });

    return { thisWeek, lastWeek };
  }

  async getMonthlyBoardStats(workspaceId) {
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );

    const thisMonth = await boardModel.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
      createdAt: { $gte: oneMonthAgo },
    });

    return { thisMonth };
  }

  async getTeamPerformance(workspaceId) {
    const stats = await TaskModle.aggregate([
      {
        $match: {
          workspace: new mongoose.Types.ObjectId(workspaceId),
          isDeleted: { $ne: true },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
        },
      },
    ]);

    const { total, completed } = stats[0] || { total: 0, completed: 0 };
    if (total === 0) return { score: 0, label: "No Data" };

    const percentage = Math.round((completed / total) * 100);
    let label = "Needs Work";
    if (percentage >= 80) label = "Excellent";
    else if (percentage >= 60) label = "Good";
    else if (percentage >= 40) label = "Average";

    return { score: percentage, label };
  }

  async getMemberStats(workspaceId, userId) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const myActiveTasks = await TaskModle.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      assignees: new mongoose.Types.ObjectId(userId),
      isCompleted: false,
      isDeleted: { $ne: true },
    });

    const myCompletedThisWeek = await TaskModle.countDocuments({
      workspace: new mongoose.Types.ObjectId(workspaceId),
      assignees: new mongoose.Types.ObjectId(userId),
      isCompleted: true,
      completedAt: { $gte: oneWeekAgo },
      isDeleted: { $ne: true },
    });

    const activeTimer = await timeEntryModel
      .findOne({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        user: new mongoose.Types.ObjectId(userId),
        endTime: null,
      })
      .populate("task", "name");

    return { myActiveTasks, myCompletedThisWeek, activeTimer };
  }

  async getReportStats(workspaceId, boardId) {
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
    };

    if (boardId) {
      matchStage.board = new mongoose.Types.ObjectId(boardId);
    }

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    );
    const twoMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      now.getDate(),
    );

    const [
      taskStats,
      boardCount,
      memberCount,
      lastMonthCompleted,
      thisMonthCompleted,
      thisMonthBoards,
    ] = await Promise.all([
      TaskModle.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
          },
        },
      ]),

      boardModel.countDocuments({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
      }),

      workspaceModel
        .findById(workspaceId)
        .select("members")
        .lean()
        .then((ws) => ws?.members?.length || 0),

      TaskModle.countDocuments({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        isCompleted: true,
        completedAt: { $gte: twoMonthsAgo, $lt: oneMonthAgo },
      }),

      TaskModle.countDocuments({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        isCompleted: true,
        completedAt: { $gte: oneMonthAgo },
      }),

      boardModel.countDocuments({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        createdAt: { $gte: oneMonthAgo },
      }),
    ]);

    const stats = taskStats[0] || { total: 0, completed: 0 };
    const completionRate =
      stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const completionChange =
      lastMonthCompleted > 0
        ? Math.round(
            ((thisMonthCompleted - lastMonthCompleted) / lastMonthCompleted) *
              100,
          )
        : 0;

    const boardsChangePercent =
      boardCount > 0 ? Math.round((thisMonthBoards / boardCount) * 100) : 0;

    return {
      activeMembers: { count: memberCount },
      completionRate: { percentage: completionRate },
      completedTasks: {
        count: stats.completed,
        total: stats.total,
        changePercent: completionChange,
      },
      monitoredProjects: {
        count: boardCount,
        newThisMonth: thisMonthBoards,
        changePercent: boardsChangePercent,
      },
    };
  }

  async getTaskDistributionByColumn(workspaceId, boardId) {
    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
    };

    if (boardId) {
      matchStage.board = new mongoose.Types.ObjectId(boardId);
    }

    const distribution = await TaskModle.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "boards",
          localField: "board",
          foreignField: "_id",
          as: "boardData",
        },
      },

      { $unwind: { path: "$boardData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          columnId: "$column",
          columnName: {
            $filter: {
              input: { $ifNull: ["$boardData.columns", []] },
              as: "col",
              cond: { $eq: ["$$col._id", "$column"] },
            },
          },
        },
      },
      { $unwind: { path: "$columnName", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$columnId",
          columnName: { $first: "$columnName.name" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const total = distribution.reduce((sum, col) => sum + col.count, 0);

    return {
      total,
      columns: distribution.map((col) => ({
        columnId: col._id,
        name: col.columnName || "Uncategorized",
        count: col.count,
        percentage: total > 0 ? Math.round((col.count / total) * 100) : 0,
      })),
    };
  }

  async getDailyProductivity(workspaceId, boardId) {
    const now = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push(date);
    }

    const matchStage = {
      workspace: new mongoose.Types.ObjectId(workspaceId),
      isDeleted: { $ne: true },
      isCompleted: true,
      completedAt: { $gte: days[0], $lte: now },
    };

    if (boardId) {
      matchStage.board = new mongoose.Types.ObjectId(boardId);
    }

    const completed = await TaskModle.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: "$completedAt" },
            month: { $month: "$completedAt" },
            day: { $dayOfMonth: "$completedAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return days.map((date) => {
      const match = completed.find(
        (c) =>
          c._id.year === date.getFullYear() &&
          c._id.month === date.getMonth() + 1 &&
          c._id.day === date.getDate(),
      );

      return {
        date: date.toISOString().split("T")[0],
        day: dayNames[date.getDay()],
        completedTasks: match?.count || 0,
      };
    });
  }

  async getProjectDetails(workspaceId) {
    const boards = await boardModel
      .find({
        workspace: new mongoose.Types.ObjectId(workspaceId),
        isDeleted: { $ne: true },
        isArchived: { $ne: true },
      })
      .populate("createdBy", "name email avatar")
      .sort({ createdAt: -1 })
      .lean();

    return Promise.all(
      boards.map(async (board) => {
        const taskStats = await TaskModle.aggregate([
          { $match: { board: board._id, isDeleted: { $ne: true } } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: { $sum: { $cond: ["$isCompleted", 1, 0] } },
            },
          },
        ]);

        const stats = taskStats[0] || { total: 0, completed: 0 };
        const progress =
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0;

        const assigneeAgg = await TaskModle.aggregate([
          {
            $match: {
              board: board._id,
              isDeleted: { $ne: true },
              assignees: { $exists: true, $not: { $size: 0 } },
            },
          },
          { $unwind: "$assignees" },
          { $group: { _id: "$assignees" } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $project: {
              _id: "$user._id",
              name: "$user.name",
              avatar: "$user.avatar",
              email: "$user.email",
            },
          },
        ]);

        let status = "active";
        if (progress === 100) status = "completed";
        else if (progress >= 75) status = "nearly_complete";
        else if (progress >= 30) status = "in_progress";

        return {
          _id: board._id,
          name: board.name,
          manager: board.createdBy
            ? {
                _id: board.createdBy._id,
                name: board.createdBy.name || board.createdBy.email,
                avatar: board.createdBy.avatar || null,
              }
            : null,
          teamMembers: assigneeAgg,
          progress,
          totalTasks: stats.total,
          completedTasks: stats.completed,
          status,
        };
      }),
    );
  }
  async getAllWorkspacesWithProjects(userId) {
    const workspaces = await workspaceModel
      .find({
        "members.user": new mongoose.Types.ObjectId(userId),
        isDeleted: { $ne: true },
      })
      .select("_id name members owner")
      .lean();

    const result = await Promise.all(
      workspaces.map(async (workspace) => {
        const boards = await boardModel
          .find({
            workspace: workspace._id,
            isDeleted: { $ne: true },
            isArchived: { $ne: true },
          })
          .select("_id name createdAt")
          .sort({ createdAt: -1 })
          .lean();

        const boardsWithStats = await Promise.all(
          boards.map(async (board) => {
            const taskStats = await TaskModle.aggregate([
              {
                $match: {
                  board: board._id,
                  isDeleted: { $ne: true },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: { $cond: ["$isCompleted", 1, 0] },
                  },
                },
              },
            ]);

            const stats = taskStats[0] || { total: 0, completed: 0 };
            const progress =
              stats.total > 0
                ? Math.round((stats.completed / stats.total) * 100)
                : 0;

            return {
              _id: board._id,
              name: board.name,
              progress,
              totalTasks: stats.total,
              completedTasks: stats.completed,
            };
          }),
        );

        const userRole =
          workspace.members.find((m) => {
            const memberId = m.user ? m.user.toString() : m.toString();
            return memberId === userId.toString();
          })?.role || "member";

        return {
          _id: workspace._id,
          name: workspace.name,
          role: userRole,
          totalBoards: boards.length,
          boards: boardsWithStats,
        };
      }),
    );

    return result;
    // test
  }
}
