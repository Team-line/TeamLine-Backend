import {
  createBoardService,
  addCoulmnToBOardService,
} from "./board.service.js";
import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";

export const createBoardController = asyncWrapper(async (req, res) => {
  const { workspaceId } = req.params;
  const data = await createBoardService(req.user.id, workspaceId, req.body);
  res.status(201).json({ status: "success", data });
});

export const addCoulmnToBOardController = asyncWrapper(async (req, res) => {
  const { boardId } = req.params;
  const { name } = req.body;
  const userId = req.user.id;
  const data = await addCoulmnToBOardService(userId, boardId, { name });
  res.status(200).json({ status: "success", data });
});
