import jwt from "jsonwebtoken";
import {
  JWT_EXPIRE,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../config/env.js";
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "90d",
  });
  return { accessToken, refreshToken };
};

export const generateToekn = (userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};
