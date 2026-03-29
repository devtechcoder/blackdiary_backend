import * as mongoose from "mongoose";
import { model } from "mongoose";

const Schema = mongoose.Schema;

const ChatShayari = new Schema(
  {
    text: { type: String, required: true },
    category: { type: String, required: true },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

ChatShayari.index({ category: 1, is_active: 1 });

export default model<any>("ChatShayari", ChatShayari, "shayari");
