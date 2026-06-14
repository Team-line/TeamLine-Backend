import mongoose from "mongoose";

const columnsSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: "coulmnName",
  },
  order: {
    type: Number,
    default: 0,
  },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "BoardName",
    },
    description: {
      type: String,
      trim: true,
      default: "BoardDescription",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
    },

    columns: {
      type: [columnsSchema],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "a board cannot exceed 10 columns",
      },
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

boardSchema.pre("save", function () {
  if (this.isNew) {
    this.columns = [
      { name: "To Do", order: 0 },
      { name: "In Progress", order: 1 },
      { name: "Done", order: 2 },
    ];
  }
});

boardSchema.index({ workspace: 1 });
export const boardModel = mongoose.model("Board", boardSchema);
