import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Occasion = new Schema(
  {
    name: { type: String, default: null },
    hi_name: { type: String, default: null },
    description: { type: String, default: null },
    hi_description: { type: String, default: null },
    image: { type: String, default: null },
    added_by: { type: String, default: null },
    sort_number: { type: Number, default: null },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_delete: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);
Occasion.index({ name: "text" });
export default model<any, AggregatePaginateModel<any>>("Occasion", Occasion);
