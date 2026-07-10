import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import {
  getDashboardStats,
  getActiveProjects,
  getReportStats,
  getTaskDistribution,
  getDailyProductivity,
  getProjectDetails,
} from "./dashboard.service.js";

export const getDashboardStatsHandler = asyncWrapper(async (req, res) => {
  const data = await getDashboardStats({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", data });
});

export const getActiveProjectsHandler = asyncWrapper(async (req, res) => {
  const data = await getActiveProjects({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", data });
});

export const getReportStatsHandler = asyncWrapper(async (req, res) => {
  const data = await getReportStats({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    boardId: req.query.boardId || null,
  });
  res.status(200).json({ status: "success", data });
});

export const getTaskDistributionHandler = asyncWrapper(async (req, res) => {
  const data = await getTaskDistribution({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    boardId: req.query.boardId || null,
  });
  res.status(200).json({ status: "success", data });
});

export const getDailyProductivityHandler = asyncWrapper(async (req, res) => {
  const data = await getDailyProductivity({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    boardId: req.query.boardId || null,
  });
  res.status(200).json({ status: "success", data });
});

export const getProjectDetailsHandler = asyncWrapper(async (req, res) => {
  const data = await getProjectDetails({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
  });
  res.status(200).json({ status: "success", data });
});
