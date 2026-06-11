import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  invitedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "accepted", "rejected"],
      message: "Status must be pending, accepted, or rejected.",
    },
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d",
  },
});

export default mongoose.model("Invitation", invitationSchema);
