import { userModel } from "./user.model.js";
import crypto from "crypto";
export const createUser = async function (data) {
  const { name, email, password } = data;
  return userModel.create({ name, email, password });
};

export const getUserById = async function (id) {
  return userModel.findById(id);
};

export const getUserViaEmail = async function (email) {
  return userModel.findOne({ email });
};

export const getUserByResetToken = async function (resetToken) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  return userModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

export const getUserByIdWithPAssword = async function (id) {
  return userModel.findById(id).select("+password");
};

export const getUserByIdAndUpdate = async function (id, data) {
  return userModel.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
    new: true,
    runValidators: true,
  });
};

export const getUserByIdToDelete = async function (id) {
  return userModel.findOne({ _id: id, isDeleted: false });
};
