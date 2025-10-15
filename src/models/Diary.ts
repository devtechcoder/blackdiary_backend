import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
import { CATEGORY_TYPE } from "../constants/constants";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Diary = new Schema(
  {
    // category_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    category: { type: String, enum: Object.values(CATEGORY_TYPE), default: null },
    sub_category_id: [{ type: Schema.Types.ObjectId, ref: "SubCategory", default: null }],
    occasion_ids: [{ type: Schema.Types.ObjectId, ref: "Occasion", default: null }],
    author: { type: Schema.Types.ObjectId, ref: "User", default: null },
    title: { type: String, default: null },
    hi_title: { type: String, default: null },
    content: { type: String, default: null },
    hi_content: { type: String, default: null },
    total_likes: { type: Number, default: 0 },
    total_comment: { type: Number, default: 0 },
    total_share: { type: Number, default: 0 },
    image: { type: String, default: null },
    added_by: { type: String, default: null },
    tags: [{ type: String, default: null }],
    is_active: { type: Boolean, default: true },
    is_published: { type: Boolean, default: true },
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
Diary.index({ name: "text" });
export default model<any, AggregatePaginateModel<any>>("Diary", Diary);
