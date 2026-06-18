import { tokenModel } from "./token.modle.js";

export const findToken = async function (refreshToken) {
  return tokenModel.findOne({ token: refreshToken });
};
