import {
  createBoardService,
  addCoulmnToBOardService,
  getAllBoardsInWorkspaceService,
  getBoardByIdService,
  updateBoardService,
  deleteBoardService,
  changeCoulmnNameService,
  deleteCoulmnService,
  getCoulmnByIdService,
  getAllCoulmnsService,
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

export const getAllBoardsInWorkspaceController = asyncWrapper(
  async (req, res) => {
    const { workspaceId } = req.params;
    const userId = req.user.id;
    const data = await getAllBoardsInWorkspaceService(userId, workspaceId);
    res.status(200).json({ status: "success", data });
  },
);

export const getBoardByIdController = asyncWrapper(async (req, res) => {
  const { workspaceId, boardId } = req.params;
  const userId = req.user.id;
  const data = await getBoardByIdService(userId, workspaceId, boardId);
  res.status(200).json({ status: "success", data });
});

export const updateBoardController = asyncWrapper(async (req, res) => {
  const { workspaceId, boardId } = req.params;
  const userId = req.user.id;
  const data = await updateBoardService(userId, workspaceId, boardId, req.body);
  res.status(200).json({ status: "success", data });
});

export const deleteBoardController = asyncWrapper(async (req, res) => {
  const { workspaceId, boardId } = req.params;
  const userId = req.user.id;
  await deleteBoardService(userId, workspaceId, boardId);
  res.status(204).json({ status: "success", data: null });
});

export const getCoulmnByIdController = asyncWrapper(async (req, res) => {
  const { boardId, columnId, workspaceId } = req.params;
  const userId = req.user.id;
  const data = await getCoulmnByIdService(
    userId,
    boardId,
    workspaceId,
    columnId,
  );
  res.status(200).json({ status: "success", data });
});

export const changeCoulmnNameController = asyncWrapper(async (req, res) => {
  const { boardId, columnId, workspaceId } = req.params;
  const userId = req.user.id;
  const { newName } = req.body;
  const data = await changeCoulmnNameService(
    userId,
    boardId,
    workspaceId,
    columnId,
    newName,
  );
  res.status(200).json({ status: "success", data });
});

export const deleteCoulmnController = asyncWrapper(async (req, res) => {
  const { boardId, columnId, workspaceId } = req.params;
  const userId = req.user.id;
  await deleteCoulmnService(userId, workspaceId, boardId, columnId);
  res.status(204).json({ status: "success", data: null });
});

export const getAllCoulmnsController = asyncWrapper(async (req, res) => {
  const { workspaceId, boardId } = req.params;
  const userId = req.user.id;

  const data = await getAllCoulmnsService(userId, workspaceId, boardId);

  res.status(200).json({ status: "success", data });
});
