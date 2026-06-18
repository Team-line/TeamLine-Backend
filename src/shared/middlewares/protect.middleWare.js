import { asyncWrapper } from "../utils/asyncWrapper.js";
import appError from "../errors/appErrors.js";
import { JWT_SECRET } from "../../config/env.js";
import { userModel } from "../../modules/users/user.model.js";
import jwt from "jsonwebtoken";
export const protect = asyncWrapper(async (req, res, next) => {
  let token; // !Note:if i wrote it outside the function it will be global variable (so the same var . and didint change in the function) but if i wrote it inside the function it will be local variable (so every time i call the function it will create new var and change it)
  // 1- check if the token exist
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new appError("You are not logged in! Please log in to get access.", 401),
    );
  }

  // 2- verify the token
  let decode;
  try {
    decode = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new appError("Invalid token. Please log in again.", 401));
  }

  // 3- check if the user still exist (the token is valid but the user is deleted)
  const user = await userModel.findById(decode.id);

  if (!user) {
    return next(
      new appError(
        "The user belonging to this token does no longer exist.",
        401,
      ),
    );
  }

  // 4- check if the user changed password after the token was issued
  if (user.changedPasswordAfter(decode.iat)) {
    return next(
      new appError("User recently changed password! Please log in again.", 401),
    );
  }

  // 5- grant access to protected route
  req.user = user;

  // 6- call the next middleware
  next();
});
