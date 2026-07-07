import {
  getUserById,
  getUserViaEmail,
  getUserByResetToken,
  getUserByIdWithPAssword,
  getUserByIdAndUpdate,
  getUserByIdToDelete,
} from "./user.reposotry.js";
import { userResponse } from "../../shared/utils/userResponse.js";
import appErrors from "../../shared/errors/appErrors.js";
import { resetPasswordTemplate } from "../../shared/utils/resetPassword.template.js";
import { sendEmail } from "../../shared/utils/email.service.js";
import { generateToekn } from "../../shared/utils/genarateToken.js";
import { userModel } from "./user.model.js";

export const getUserProfile = async function (userId) {
  const user = await getUserById(userId);
  if (!user) {
    throw new appErrors("the user is not found", 404);
  }
  return userResponse(user);
};

export const forgotPassword = async function (email, resetBaseUrl) {
  //1- cheak if the user exists or not in the database
  const user = await getUserViaEmail(email);
  if (!user) {
    return; //! to prevent email enumeration attacks, we return a success message even if the user is not found
  }
  //2-  generate the reset token and save it to the database
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3- Send the reset token to the user's email

  const resetUrl = `${resetBaseUrl}/api/v1/users/reset-password/${resetToken}`;
  const subject = "Password Reset Request";
  const html = resetPasswordTemplate(
    user.name,
    resetUrl,
    user.passwordResetExpires,
  );

  try {
    await sendEmail(user.email, html, subject);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new appErrors("Failed to send password reset email", 500);
  }
};

export const resetPassword = async function (resetToken, newPassword) {
  // 1- Hash the reset token and find the user with the hashed token and check if the token is not expired
  const user = await getUserByResetToken(resetToken);
  if (!user) {
    throw new appErrors("Invalid or expired reset token", 400);
  }
  if (newPassword.length < 8) {
    throw new appErrors("Password too weak", 400);
  }
  // 2- If the user is found and the token is valid, update the user's password and clear the reset token and expiration time
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetCreatedAt = undefined;
  user.passwordResetExpires = undefined;
  // 3- Save the updated user to the database
  await user.save({ validateBeforeSave: false });

  // 4- Return a success message

  const token = generateToekn(user._id);
  return { user: userResponse(user), token };
};

export const resetUserPassword = async function (id, prePass, newPassword) {
  let user = await getUserByIdWithPAssword(id);
  if (!user) {
    throw new appErrors('the user not found with this id "' + id + '"', 404);
  }

  let resultOfComparingPasswords = await user.comparePassword(prePass);

  if (!resultOfComparingPasswords) {
    throw new appErrors("the password thats u provided is inCorrect", 401);
  }
  user.password = newPassword;
  await user.save(); //! here the correct is without validateBeforeSave because we want to run the pre save middleware to hash the password and update the passwordChangedAt field
  let token = generateToekn(user._id);

  return { user: userResponse(user), token };
};

export const updateUserDate = async function (id, data) {
  // Todo : test this condition
  if (data.password) {
    throw new appErrors(
      "you are not allowed to update the password in this route, please use the update password route",
      400,
    );
  }
  const user = await getUserById(id);
  if (!user) {
    throw new appErrors('the user not found with this id "' + id + '"', 404);
  }

  const allowedFields = ["name", "email", "avatar"];

  Object.keys(data).forEach((feild) => {
    if (allowedFields.includes(feild)) {
      user[feild] = data[feild];
    }
  });

  await user.save({ validateBeforeSave: true });

  return userResponse(user);
};

export const deleteUser = async function (id) {
  const user = await getUserByIdToDelete(id);

  if (!user) {
    throw new appErrors(`the user not found with this id "${id}"`, 404);
  }

  if (user.isDeleted && user.deletedAt) {
    throw new appErrors("the user is already deleted", 400);
  }

  user.isDeleted = true;
  user.deletedAt = Date.now();
  await user.save();
  return userResponse(user);
};

export const searchUserByEmail = async ({ email, requestingUserId }) => {
  const user = await userModel
    .findOne({ email: email.toLowerCase().trim(), isDeleted: false })
    .select("_id displayName name email avatarUrl");

  if (!user) {
    throw new appErrors("No user found with this email.", 404);
  }

  if (user._id.toString() === requestingUserId.toString()) {
    throw new appErrors("You cannot add yourself.", 400);
  }

  return user;
};
