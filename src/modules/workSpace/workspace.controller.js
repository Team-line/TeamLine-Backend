import {
  createWorkSpaceService,
  getAllWorkSpacesToUser,
  getWorkSpaceByIdService,
  updateWOrkSpaceService,
  deleteWorkSpaceService,
  findMemberAndUpdateRoleService,
  getWorkspaceMembersService,
  addMemberDirectly,
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

export const getWorkspaceMembersController = asyncWrapper(async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user.id;

  const members = await getWorkspaceMembersService({ userId, workspaceId });

  res.status(200).json({
    status: "success",
    results: members.length,
    data: members,
  });
});

export const addMemberDirectlyHandler = asyncWrapper(async (req, res) => {
  const data = await addMemberDirectly({
    workspaceId: req.params.id,
    targetUserEmail: req.body.email,
    role: req.body.role,
    requestingUserId: req.user.id,
  });

  res.status(200).json({ status: "success", data });
});
