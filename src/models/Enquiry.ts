import * as mongoose from "mongoose";
import { model } from "mongoose";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

export const EnquiryStatuses = {
  NEW: "new",
  VIEWED: "viewed",
  ARCHIVED: "archived",
  SPAM: "spam",
};

const Enquiry = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: null, trim: true },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: Object.values(EnquiryStatuses),
      default: EnquiryStatuses.NEW,
    },
  },
  {
    timestamps: true,
  },
);

mongoose.plugin(aggregatePaginate);
Enquiry.index({ name: "text", email: "text", message: "text" });

export default model<any>("Enquiry", Enquiry);
