import * as mongoose from "mongoose";
import { model } from "mongoose";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

export const EmailLogStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

const EmailLogSchema = new Schema(
  {
    to: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: null, trim: true },
    slug: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [EmailLogStatus.SUCCESS, EmailLogStatus.FAILED],
      required: true,
    },
    response: { type: String, default: null },
    body: { type: String, default: null },
    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);
EmailLogSchema.index({ sentAt: -1 });
EmailLogSchema.index({ status: 1, slug: 1, to: 1, sentAt: -1 });

export default model<any>("EmailLog", EmailLogSchema);
