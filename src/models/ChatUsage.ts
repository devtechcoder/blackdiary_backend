import * as mongoose from "mongoose";
import { model } from "mongoose";

const Schema = mongoose.Schema;

const ChatUsage = new Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

ChatUsage.index({ userId: 1, date: 1 }, { unique: true });

export default model<any>("ChatUsage", ChatUsage, "usage");
