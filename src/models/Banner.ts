import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
import { CATEGORY_TYPE } from "../constants/constants";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

export const Position = {
  TOP: "Top banner",
  MID: "Mid banner",
  BOTTOM: "Bottom banner",
  NULL: null,
};

const Banner = new Schema(
  {
    title: { type: String, default: null },
    description: { type: String, default: null },
    image: { type: String, default: null },
    mobile_image: { type: String, default: null },
    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },
    click_count: { type: Number, default: 0 },
    sort_order: { type: Number, default: 0 },
    rotation_time: { type: String, default: null },
    banner_link: { type: String, default: null },
    added_by: { type: String, default: null },
    position: { type: String, enum: Object.values(Position), default: null },
    is_active: { type: Boolean, default: true },
    is_delete: { type: Boolean, default: false },
    category: { type: String, enum: Object.values(CATEGORY_TYPE), default: null },
    sub_category_ids: [{ type: Schema.Types.ObjectId, ref: "SubCategory", default: null }],
    occasion_ids: [{ type: Schema.Types.ObjectId, ref: "Occasion", default: null }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);
mongoose.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("Banner", Banner);
