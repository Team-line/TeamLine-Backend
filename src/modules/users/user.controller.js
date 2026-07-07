import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import {
  forgotPassword,
  resetPassword,
  getUserProfile,
  resetUserPassword,
  updateUserDate,
  searchUserByEmail,
} from "./user.service.js";
export const getProfile = asyncWrapper(async function (req, res, next) {
  let data = await getUserProfile(req.user.id);

  res.status(200).json({
    status: "success",
    data,
  });
});

export const forgotPasswordController = asyncWrapper(
  async function (req, res, next) {
    const { email } = req.body;

    const resetBaseUrl = `${req.protocol}://${req.get("host")}`;
    await forgotPassword(email, resetBaseUrl);
    res.status(200).json({
      status: "success",
      message:
        "if the email is correct, you will receive a password reset email",
    });
  },
);

export const resetPasswordController = asyncWrapper(
  async function (req, res, next) {
    const { resetToken } = req.params;
    const { newPassword } = req.body;
    const data = await resetPassword(resetToken, newPassword);
    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const updateMyPassword = asyncWrapper(async function (req, res, next) {
  const { password, newPassword } = req.body;

  const data = await resetUserPassword(req.user.id, password, newPassword);

  res.status(200).json({
    status: "success",
    data,
  });
});

export const updateUserDateController = asyncWrapper(
  async function (req, res, next) {
    const data = await updateUserDate(req.user.id, req.body);

    res.status(200).json({
      status: "success",
      data,
    });
  },
);

export const searchUserByEmailHandler = asyncWrapper(async (req, res) => {
  const user = await searchUserByEmail({
    email: req.query.email,
    requestingUserId: req.user.id,
  });

  res.status(200).json({ status: "success", data: user });
});
