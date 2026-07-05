import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import { getSummary, buildCSV, buildPDFStream } from "./report.service.js";

const today = () => new Date().toISOString().split("T")[0];

export const getSummaryHandler = asyncWrapper(async (req, res) => {
  const { startDate, endDate, boardId } = req.query;

  const data = await getSummary({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    startDate,
    endDate,
    boardId,
  });

  res.status(200).json({ status: "success", data });
});

export const exportCSVHandler = asyncWrapper(async (req, res) => {
  const { startDate, endDate, boardId } = req.query;

  const csv = await buildCSV({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    startDate,
    endDate,
    boardId,
  });

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${today()}.csv"`,
  );
  res.send(csv);
});

export const exportPDFHandler = asyncWrapper(async (req, res) => {
  const { startDate, endDate, boardId } = req.query;

  const pdfStream = await buildPDFStream({
    workspaceId: req.params.workspaceId,
    userId: req.user.id,
    startDate,
    endDate,
    boardId,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report-${today()}.pdf"`,
  );

  pdfStream.pipe(res);
  pdfStream.end();
});
