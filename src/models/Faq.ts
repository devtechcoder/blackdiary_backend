import * as mongoose from "mongoose";
import { model } from "mongoose";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const FaqSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, default: null },
    priority: { type: Number, required: true, default: 1 },
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);
FaqSchema.index({ question: "text", answer: "text" });

export default model<any>("Faq", FaqSchema);
