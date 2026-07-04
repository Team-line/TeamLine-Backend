import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task is required."],
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: [true, "Workspace is required."],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required."],
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required."],
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, "Note cannot exceed 200 characters."],
      default: null,
    },
    isManual: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

timeEntrySchema.pre("save", function () {
  if (this.isModified("endTime") && this.endTime !== null) {
    this.durationSeconds = Math.floor(
      (this.endTime.getTime() - this.startTime.getTime()) / 1000,
    );
  }
});

timeEntrySchema.index({ task: 1, user: 1 });
timeEntrySchema.index({ workspace: 1, startTime: 1 });
timeEntrySchema.index({ workspace: 1, user: 1, startTime: 1 });

timeEntrySchema.index(
  { user: 1 },
  {
    name: "active_timer_lookup",
    partialFilterExpression: { endTime: null },
  },
);

export const timeEntryModel = mongoose.model("TimeEntry", timeEntrySchema);
