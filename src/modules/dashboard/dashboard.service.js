import { DashboardRepository } from "./dashboard.repository.js";
import { workspaceModel } from "../workSpace/workspace.modle.js";
import appError from "../../shared/errors/appErrors.js";

const repo = new DashboardRepository();

const verifyAccess = async (workspaceId, userId) => {
  const workspace = await workspaceModel
    .findById(workspaceId)
    .select("members owner name");

  if (!workspace) throw new appError("Workspace not found.", 404);

  const isMember = workspace.members.some((m) => {
    const memberId = m.user ? m.user.toString() : m.toString();
    return memberId === userId.toString();
  });

  if (!isMember) throw new appError("Access denied.", 403);

  return workspace;
};

export const getReportStats = async ({ workspaceId, userId, boardId }) => {
  await verifyAccess(workspaceId, userId);
  return repo.getReportStats(workspaceId, boardId);
};

export const getTaskDistribution = async ({ workspaceId, userId, boardId }) => {
  await verifyAccess(workspaceId, userId);
  return repo.getTaskDistributionByColumn(workspaceId, boardId);
};

export const getDailyProductivity = async ({
  workspaceId,
  userId,
  boardId,
}) => {
  await verifyAccess(workspaceId, userId);
  return repo.getDailyProductivity(workspaceId, boardId);
};

export const getProjectDetails = async ({ workspaceId, userId }) => {
  await verifyAccess(workspaceId, userId);
  return repo.getProjectDetails(workspaceId);
};

export const getActiveProjects = async ({ workspaceId, userId }) => {
  await verifyAccess(workspaceId, userId);
  return repo.getActiveProjects(workspaceId);
};

export const getDashboardStats = async ({ workspaceId, userId }) => {
  await verifyAccess(workspaceId, userId);

  const [
    taskStats,
    memberStats,
    weeklyTaskStats,
    monthlyBoardStats,
    teamPerformance,
    activeProjects,
    reportStats,
    taskDistribution,
    dailyProductivity,
  ] = await Promise.all([
    repo.getTaskStats(workspaceId),
    repo.getMemberStats(workspaceId, userId),
    repo.getWeeklyTaskStats(workspaceId),
    repo.getMonthlyBoardStats(workspaceId),
    repo.getTeamPerformance(workspaceId),
    repo.getActiveProjects(workspaceId),
    repo.getReportStats(workspaceId),
    repo.getTaskDistributionByColumn(workspaceId),
    repo.getDailyProductivity(workspaceId),
  ]);

  return {
    taskStats,
    memberStats,
    weeklyTaskStats,
    monthlyBoardStats,
    teamPerformance,
    activeProjects,
    reportStats,
    taskDistribution,
    dailyProductivity,
  };
};
