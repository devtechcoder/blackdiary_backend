import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
import { CATEGORY_TYPE } from "../constants/constants";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const SubCategory = new Schema(
  {
    // category_id: { type: Schema.Types.ObjectId, ref: "category", default: null },
    category: [{ type: String, enum: Object.values(CATEGORY_TYPE), default: null }],
    name: { type: String, default: null },
    hi_name: { type: String, default: null },
    image: { type: String, default: null },
    added_by: { type: String, default: null },
    bg_color: { type: String, default: null },
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
SubCategory.index({ name: "text" });
export default model<any, AggregatePaginateModel<any>>("SubCategory", SubCategory);
