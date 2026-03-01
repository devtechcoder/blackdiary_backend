import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Master = new Schema(
  {
    title: { type: String, default: null },
    sub_title: { type: String, default: null },
    link: { type: String, default: null },
    priority: { type: String, default: null },
    description: { type: String, default: null },
    slug: { type: String, default: null },
    type: { type: String, default: null },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("Master", Master);
