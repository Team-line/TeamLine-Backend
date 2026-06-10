import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["owner", "member"],
        message: "Role must be owner or member.",
      },
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required."],
      unique: [true, "Workspace name must be unique."],
      trim: true,
      minlength: [3, "Workspace name must be at least 3 characters."],
      maxlength: [50, "Workspace name cannot exceed 60 characters."],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description cannot exceed 300 characters."],
      default: null,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Workspace must have an owner."],
    },

    members: {
      type: [memberSchema],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "A workspace cannot exceed 50 members.",
      },
      default: [],
    },

    isDeleted: { type: Boolean, default: false, select: false },
    deletedAt: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// this is for add the owner to the members array if not already there when creating a workspace
workspaceSchema.pre("save", function () {
  const isOWnerMember = this.members.some(
    (u) => u.user.toString() === this.owner.toString(),
  );

  if (!isOWnerMember) {
    this.members.push({ user: this.owner, role: "owner" });
  }
});

workspaceSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } });
});

workspaceSchema.index({ owner: 1, isDeleted: 1 });
workspaceSchema.index({ "members.user": 1, isDeleted: 1 });
workspaceSchema.index({ owner: 1, name: 1 }, { unique: true });

workspaceSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

workspaceSchema.methods.isOwner = function (userId) {
  return this.owner.toString() === userId.toString();
};

workspaceSchema.methods.getMemberRole = function (userId) {
  const m = this.members.find((m) => m.user.toString() === userId.toString());
  return m ? m.role : null;
};

// to find the workspaces where the user is a member (including owner)
workspaceSchema.statics.findByMember = function (userId) {
  return this.find({ "members.user": userId, isDeleted: false });
};

export const workspaceModel = mongoose.model("Workspace", workspaceSchema);
