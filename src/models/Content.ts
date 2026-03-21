import * as mongoose from "mongoose";
import { model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Content = new Schema(
  {
    name: { type: String, default: null },
    slug: { type: String, default: null },
    description: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
mongoose.plugin(aggregatePaginate);

export default model<any>("Content", Content);
