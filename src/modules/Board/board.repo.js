import { boardModel } from "./board.modle.js";

export const createBoard = async function (data) {
  return boardModel.create(data);
};

export const findBoradByid = function (id) {
  return boardModel.findById(id);
};
export const findBoradByidWithPopulate = function (id) {
  return boardModel.findById(id).populate("workspace");
};
