import { asyncWrapper } from "../../shared/utils/asyncWrapper.js";
import { userModel } from "../users/user.model.js";
import { tokenModel } from "./token.modle.js";
import { findToken } from "./repo.auth.js";
import appError from "../../shared/errors/appErrors.js";
import jwt from "jsonwebtoken";
import { userResponse } from "../../shared/utils/userResponse.js";
import {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_EXPIRE,
  REFRESH_TOKEN_EXPIRE,
} from "../../config/env.js";
import { generateTokens } from "../../shared/utils/genarateToken.js";

export const registar = async function (data) {
  const { name, email, password } = data;

  const user = await userModel.findOne({ email });
  if (user) {
    throw new appError("the email already exists", 409);
  }

  const newUser = await userModel.create({ name, email, password });

  const { accessToken, refreshToken } = generateTokens(newUser._id);

  await tokenModel.create({
    userId: newUser._id,
    token: refreshToken,
    expiresAt: new Date(
      Date.now() + parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000,
    ),
  });

  return {
    newUser: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async function (data) {
  const { email, password } = data;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    throw new appError("the email or password is incorrect", 401);
  }

  const isCorrectPassword = await user.comparePassword(password);
  if (!isCorrectPassword) {
    throw new appError("the email or password is incorrect", 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);

  await tokenModel.create({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(
      Date.now() + parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000,
    ),
  });

  return {
    newUser: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

export const handleRefreshToken = async function (refreshToken) {
  if (!refreshToken) {
    throw new appError("Refresh token is required", 400);
  }

  const storedToken = await findToken(refreshToken);
  if (!storedToken) {
    throw new appError("Invalid refresh token", 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      await tokenModel.deleteOne({ token: refreshToken });

      throw new appError("Refresh token expired. Please login again.", 403);
    }
    throw new appError("Invalid refresh token.", 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokens(
    decoded.id,
  );

  // ! Update the stored token with the new refresh token and expiration date (its important to update the expiration date)
  // ! This is important to prevent the reuse of old refresh tokens
  storedToken.token = newRefreshToken;
  storedToken.expiresAt = new Date(
    Date.now() + parseInt(REFRESH_TOKEN_EXPIRE) * 24 * 60 * 60 * 1000,
  );
  await storedToken.save();

  return { accessToken, newRefreshToken };
};

export const logoutService = async (refreshToken) => {
  if (refreshToken) {
    await tokenModel.deleteOne({ token: refreshToken });
  }
};
