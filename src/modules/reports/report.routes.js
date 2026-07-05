import { Router } from "express";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import {
  getSummaryHandler,
  exportCSVHandler,
  exportPDFHandler,
} from "./report.controller.js";

const reportRouter = Router();

// GET /api/v1/reports/:workspaceId/summary?startDate=&endDate=&boardId=
reportRouter.get("/:workspaceId/summary", protect, getSummaryHandler);

// GET /api/v1/reports/:workspaceId/export/csv?startDate=&endDate=
reportRouter.get("/:workspaceId/export/csv", protect, exportCSVHandler);

// GET /api/v1/reports/:workspaceId/export/pdf?startDate=&endDate=
reportRouter.get("/:workspaceId/export/pdf", protect, exportPDFHandler);

export default reportRouter;
