import {
  createWorkSpaceService,
  getAllWorkSpacesToUser,
  getWorkSpaceByIdService,
  updateWOrkSpaceService,
  deleteWorkSpaceService,
} from "./workspace.service.js";
import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
export const createWorkSpaceController = asyncWrapper(
  async (req, res, next) => {
    const data = await createWorkSpaceService(req.user.id, req.body);

    res.status(201).json({
      status: "success",
      data,
    });
  },
);

export const getAllWorkSpacesController = asyncWrapper(
  async (req, res, next) => {
    const data = await getAllWorkSpacesToUser(req.user.id);

    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const getWorkSpaceByIdController = asyncWrapper(
  async (req, res, next) => {
    const data = await getWorkSpaceByIdService(req.params.id, req.user.id);

    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const updateWorkSpaceController = asyncWrapper(
  async (req, res, next) => {
    const data = await updateWOrkSpaceService(
      req.params.id,
      req.user.id,
      req.body,
    );
    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const deleteWorkSpaceController = asyncWrapper(
  async (req, res, next) => {
    const data = await deleteWorkSpaceService(req.params.id, req.user.id);
    res.status(200).json({
      status: "success",
      data,
    });
  },
);
