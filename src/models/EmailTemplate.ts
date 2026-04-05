import * as mongoose from "mongoose";
import { model } from "mongoose";

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const EmailTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);

EmailTemplateSchema.index({ slug: 1 }, { unique: true });
EmailTemplateSchema.index({ name: "text", slug: "text", subject: "text" });

export default model<any>("EmailTemplate", EmailTemplateSchema);
