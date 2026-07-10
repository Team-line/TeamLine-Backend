import { Router } from "express";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import {
  getDashboardStatsHandler,
  getActiveProjectsHandler,
  getReportStatsHandler,
  getTaskDistributionHandler,
  getDailyProductivityHandler,
  getProjectDetailsHandler,
} from "./dashboard.controller.js";

const dashboardRouter = Router();

// Main dashboard
dashboardRouter.get("/:workspaceId/stats", protect, getDashboardStatsHandler);
dashboardRouter.get(
  "/:workspaceId/projects",
  protect,
  getActiveProjectsHandler,
);

dashboardRouter.get(
  "/:workspaceId/report-stats",
  protect,
  getReportStatsHandler,
);
dashboardRouter.get(
  "/:workspaceId/task-distribution",
  protect,
  getTaskDistributionHandler,
);
dashboardRouter.get(
  "/:workspaceId/daily-productivity",
  protect,
  getDailyProductivityHandler,
);
dashboardRouter.get(
  "/:workspaceId/project-details",
  protect,
  getProjectDetailsHandler,
);

export default dashboardRouter;
