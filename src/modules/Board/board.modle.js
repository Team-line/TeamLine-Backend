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
  // !Note : this conditiom is to the case if the frontend send empty array of columns or not send columns at all we will add the default columns to the board
  // so if the front send a coulmn array with length more than 0 we will not add the default columns to the board
  // the coulmn thats will added is thats created by the backend( TODO IN PROGRSS DONE)
  if (this.isNew && (!this.columns || this.columns.length === 0)) {
    this.columns = [
      { name: "To Do", order: 0 },
      { name: "In Progress", order: 1 },
      { name: "Done", order: 2 },
    ];
  }
});

boardSchema.index({ workspace: 1 });
export const boardModel = mongoose.model("Board", boardSchema);
