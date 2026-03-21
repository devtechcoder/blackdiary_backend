import * as mongoose from "mongoose";
import { model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Setting = new Schema(
  {
    group: { type: String, default: null },
    value: { type: String, default: null },
    slug: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
mongoose.plugin(aggregatePaginate);
Setting.index({ slug: "text" });

export default model<any>("Setting", Setting);
