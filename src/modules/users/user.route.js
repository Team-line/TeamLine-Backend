import { Router } from "express";
import {
  getProfile,
  forgotPasswordController,
  resetPasswordController,
  updateMyPassword,
  updateUserDateController,
} from "./user.controller.js";
import { protect } from "../../shared/middlewares/protect.middleWare.js";
import {
  forgotPasswordSchema,
  updateUserPasswordSchma,
  updateUserDataSchema,
} from "./user.valedator.js";
import { validateRequest } from "../../shared/middlewares/validation.middleware.js";
let userRouter = Router();

userRouter.get("/me", protect, getProfile);

userRouter.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  forgotPasswordController,
);

// ToDO : put the frontend url in the env file and use it here instead of constructing the url in the controller
userRouter.patch("/reset-password/:resetToken", resetPasswordController);

userRouter.patch(
  "/updateMyPassword",
  protect,
  validateRequest(updateUserPasswordSchma),
  updateMyPassword,
);

userRouter.patch(
  "/updateMyData",
  protect,
  validateRequest(updateUserDataSchema),
  updateUserDateController,
);
export default userRouter;
