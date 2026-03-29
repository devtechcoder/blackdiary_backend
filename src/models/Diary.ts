import * as mongoose from "mongoose";
import { model } from "mongoose";
import { CATEGORY_TYPE } from "../constants/constants";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Diary = new Schema(
  {
    content: { type: String, default: null },
    category: { type: String, enum: Object.values(CATEGORY_TYPE), default: null },
    sub_category_id: [{ type: Schema.Types.ObjectId, ref: "SubCategory", default: null }],
    occasion_ids: [{ type: Schema.Types.ObjectId, ref: "Occasion", default: null }],
    author: { type: Schema.Types.ObjectId, ref: "User", default: null },
    keywords: [{ type: Schema.Types.ObjectId, ref: "KeywordEmotion", default: [] }],
    total_likes: { type: Number, default: 0 },
    total_comment: { type: Number, default: 0 },
    total_share: { type: Number, default: 0 },
    added_by: { type: String, default: null },
    tags: [{ type: String, default: null }],
    is_active: { type: Boolean, default: true },
    is_published: { type: Boolean, default: true },
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
Diary.index({ category: "text" });
export default model<any>("Diary", Diary);
