import mongoose from "mongoose";
const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Label name must be at least 2 characters."],
      maxlength: [30, "Label name cannot exceed 30 characters."],
    },
    color: {
      type: String,
      match: [
        /^#[0-9A-Fa-f]{6}$/,
        "Color must be a valid hex string (e.g. #FF5733).",
      ],
    },
  },
  { _id: false },
);

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this task."],
      trim: true,
      minlength: [2, "Title must be at least 2 characters."],
      maxlength: [200, "Title cannot exceed 200 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters."],
      default: null,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Please provide a workspace for this task."],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true, "Please provide a Board for this task."],
    },
    column: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide a Column for this task."],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user for this task."],
    },
    assignees: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A task cannot have more than 5 assignees.",
      },
      default: [],
    },
    labels: {
      type: [labelSchema],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: "A task cannot have more than 3 labels.",
      },
      default: [],
    },
    dueDate: {
      // its a deadLine of the task
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    order: {
      type: Number,
      required: [true, "Task must have an order value."],
    },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ column: 1, order: 1 });

taskSchema.index({ board: 1, isDeleted: 1 });

taskSchema.index({ workspace: 1, dueDate: 1 });

taskSchema.index({ workspace: 1, assignees: 1 });

taskSchema.index({ workspace: 1, isCompleted: 1, isDeleted: 1 });

taskSchema.pre("save", function () {
  if (!this.isModified("isCompleted")) return;

  this.completedAt = this.isCompleted ? new Date() : null;
});

taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

export const TaskModle = mongoose.model("Task", taskSchema);
