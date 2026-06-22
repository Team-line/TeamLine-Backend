import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import {
  login,
  registar,
  handleRefreshToken,
  logoutService,
} from "./auth.service.js";

import { JWT_EXPIRE, REFRESH_TOKEN_EXPIRE } from "../../config/env.js";
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "none",
  maxAge,
});

export const signUp = asyncWrapper(async (req, res, next) => {
  const { newUser, accessToken, refreshToken } = await registar(req.body);

  res.cookie(
    "accessToken",
    accessToken,
    getCookieOptions(parseInt(JWT_EXPIRE) * 60 * 60 * 1000),
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieOptions(parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000),
  );

  res.status(201).json({
    status: "success",
    data: { user: newUser },
  });
});

export const signIn = asyncWrapper(async (req, res, next) => {
  const { newUser, accessToken, refreshToken } = await login(req.body);

  res.cookie(
    "accessToken",
    accessToken,
    getCookieOptions(parseInt(JWT_EXPIRE) * 60 * 60 * 1000),
  );
  res.cookie(
    "refreshToken",
    refreshToken,
    getCookieOptions(parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000),
  );

  res.status(200).json({
    status: "success",
    data: { user: newUser },
  });
});

export const refresh = asyncWrapper(async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;

  const { accessToken, newRefreshToken } =
    await handleRefreshToken(oldRefreshToken);

  res.cookie(
    "accessToken",
    accessToken,
    getCookieOptions(parseInt(JWT_EXPIRE) * 60 * 60 * 1000),
  );
  res.cookie(
    "refreshToken",
    newRefreshToken,
    getCookieOptions(parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000),
  );

  res
    .status(200)
    .json({ status: "success", message: "Token refreshed successfully" });
});

export const logout = asyncWrapper(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  await logoutService(refreshToken);

  res.clearCookie("accessToken", getCookieOptions(0));
  res.clearCookie("refreshToken", getCookieOptions(0));

  res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
});
