import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "the name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "the email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "the password is required"],
      minlength: [6, "the password must be at least 6 characters long"],
      maxlength: [100, "the password must be less than 100 characters long"],
      select: false,
    },
    avatar: {
      type: String,
      default: "",
    },
    passwordChangedAt: Date,
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetCreatedAt: {
      type: Date,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);

  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
    // -1000 to ensure that the token is issued after the password is changed (JWT is deleted the millsecond)
  }
});

userSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTIssuedAt) {
  if (this.passwordChangedAt) {
    const PasswordChangedAtTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000, // convert to seconds and compare with JWTIssuedAt which is in seconds
      10,
    );
    return JWTIssuedAt < PasswordChangedAtTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resettoken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  this.passwordResetCreatedAt = Date.now();

  return resettoken;
};

export const userModel = mongoose.model("User", userSchema);
