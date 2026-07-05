import { ReportRepository } from "./report.repository.js";
import appError from "../../shared/errors/appErrors.js";
import { workspaceModel } from "../workSpace/workspace.modle.js";
import { createRequire } from "module";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const PDFDocument = require("pdfkit");

const __dirname = dirname(fileURLToPath(import.meta.url));
const repo = new ReportRepository();

const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new appError("Invalid date format. Use ISO 8601.", 400);
  }
  if (start >= end) {
    throw new appError("Start date must be before end date.", 400);
  }
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  if (diffDays > 90) {
    throw new appError("Date range cannot exceed 90 days.", 400);
  }
  return { start, end };
};

const secondsToHM = (seconds) => {
  const h = Math.floor((seconds || 0) / 3600);
  const m = Math.floor(((seconds || 0) % 3600) / 60);
  return `${h}h ${m}m`;
};

const requireOwner = async (workspaceId, userId) => {
  const workspace = await workspaceModel
    .findById(workspaceId)
    .select("owner name");

  if (!workspace) throw new appError("Workspace not found.", 404);

  if (workspace.owner.toString() !== userId.toString()) {
    throw new appError("Only the workspace owner can access reports.", 403);
  }
  return workspace;
};

// ── drawTableRow helper ───────────────────────────────────────────────────────
// Draws one row of cells at the current Y position.
const drawTableRow = (doc, columns, y, isHeader = false) => {
  const startX = 40;
  const rowHeight = 20;
  const totalWidth = 515;
  const colWidth = totalWidth / columns.length;

  if (isHeader) {
    doc.rect(startX, y, totalWidth, rowHeight).fill("#1F3864");
  } else {
    doc.rect(startX, y, totalWidth, rowHeight).fill("#F4F7FB");
  }

  columns.forEach((text, i) => {
    doc
      .fontSize(9)
      .fillColor(isHeader ? "#ffffff" : "#000000")
      .text(String(text), startX + i * colWidth + 4, y + 5, {
        width: colWidth - 8,
        lineBreak: false,
      });
  });

  return y + rowHeight + 1;
};

// ── getSummary ────────────────────────────────────────────────────────────────
export const getSummary = async ({
  workspaceId,
  userId,
  startDate,
  endDate,
  boardId,
}) => {
  await requireOwner(workspaceId, userId);
  const { start, end } = validateDateRange(startDate, endDate);

  const [timePerUser, timePerTask, taskStats] = await Promise.all([
    repo.getTimePerUser({
      workspaceId,
      startDate: start,
      endDate: end,
      boardId,
    }),
    repo.getTimePerTask({
      workspaceId,
      startDate: start,
      endDate: end,
      boardId,
    }),
    repo.getTaskStats({ workspaceId, boardId }),
  ]);

  return { taskStats, timePerUser, timePerTask };
};

// ── buildCSV ──────────────────────────────────────────────────────────────────
export const buildCSV = async ({
  workspaceId,
  userId,
  startDate,
  endDate,
  boardId,
}) => {
  await requireOwner(workspaceId, userId);
  const { start, end } = validateDateRange(startDate, endDate);

  const entries = await repo.getAllEntriesRaw({
    workspaceId,
    startDate: start,
    endDate: end,
    boardId,
  });

  const headers = [
    "Task ID",
    "Task Title",
    "User Name",
    "User Email",
    "Start Time",
    "End Time",
    "Duration (seconds)",
    "Duration",
    "Note",
    "Manual",
  ].join(",");

  const rows = entries.map((e) =>
    [
      e.taskId?.toString() || "",
      `"${(e.taskTitle || "").replace(/"/g, '""')}"`,
      `"${(e.userName || "").replace(/"/g, '""')}"`,
      e.userEmail || "",
      e.startTime ? new Date(e.startTime).toISOString() : "",
      e.endTime ? new Date(e.endTime).toISOString() : "",
      e.durationSeconds || 0,
      secondsToHM(e.durationSeconds),
      `"${(e.note || "").replace(/"/g, '""')}"`,
      e.isManual ? "Yes" : "No",
    ].join(","),
  );

  // UTF-8 BOM so Excel renders Arabic content correctly
  return "\uFEFF" + [headers, ...rows].join("\n");
};

// ── buildPDFStream ────────────────────────────────────────────────────────────
export const buildPDFStream = async ({
  workspaceId,
  userId,
  startDate,
  endDate,
  boardId,
}) => {
  const workspace = await requireOwner(workspaceId, userId);
  const { start, end } = validateDateRange(startDate, endDate);

  const [timePerUser, timePerTask, taskStats] = await Promise.all([
    repo.getTimePerUser({
      workspaceId,
      startDate: start,
      endDate: end,
      boardId,
    }),
    repo.getTimePerTask({
      workspaceId,
      startDate: start,
      endDate: end,
      boardId,
    }),
    repo.getTaskStats({ workspaceId, boardId }),
  ]);

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // ── Header ────────────────────────────────────────────────────────────────
  doc
    .fontSize(22)
    .fillColor("#1F3864")
    .text("TeamFlow Report", { align: "left" });

  doc
    .fontSize(11)
    .fillColor("#595959")
    .text(`Workspace: ${workspace.name}`)
    .text(
      `Period: ${start.toLocaleDateString("en-GB")} to ${end.toLocaleDateString("en-GB")}`,
    );

  doc.moveDown(1.5);

  // ── Task Overview ─────────────────────────────────────────────────────────
  doc.fontSize(14).fillColor("#2E75B6").text("Task Overview");
  doc.moveDown(0.4);

  let y = doc.y;
  y = drawTableRow(doc, ["Total Tasks", "Completed", "Overdue"], y, true);
  y = drawTableRow(
    doc,
    [taskStats.total, taskStats.completed, taskStats.overdue],
    y,
  );
  doc.y = y + 16;

  // ── Time per Member ───────────────────────────────────────────────────────
  doc.fontSize(14).fillColor("#2E75B6").text("Time per Member");
  doc.moveDown(0.4);

  y = doc.y;
  y = drawTableRow(doc, ["Name", "Email", "Tasks", "Total Time"], y, true);

  if (timePerUser.length === 0) {
    y = drawTableRow(doc, ["No entries in this period", "", "", ""], y);
  } else {
    timePerUser.forEach((u) => {
      y = drawTableRow(
        doc,
        [u.userName, u.userEmail, u.taskCount, secondsToHM(u.totalSeconds)],
        y,
      );
    });
  }
  doc.y = y + 16;

  // ── Time per Task ─────────────────────────────────────────────────────────
  doc.fontSize(14).fillColor("#2E75B6").text("Time per Task");
  doc.moveDown(0.4);

  y = doc.y;
  y = drawTableRow(doc, ["Task Title", "Log Count", "Total Time"], y, true);

  if (timePerTask.length === 0) {
    y = drawTableRow(doc, ["No entries in this period", "", ""], y);
  } else {
    timePerTask.forEach((t) => {
      y = drawTableRow(
        doc,
        [t.taskTitle, t.logCount, secondsToHM(t.totalSeconds)],
        y,
      );
    });
  }

  return doc;
};
