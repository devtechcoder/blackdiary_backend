import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    comment: { type: String, default: null },
    comment_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    diary_id: { type: Schema.Types.ObjectId, ref: "Diary", default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);
Comment.index({ comment: "text" });
export default model<any, AggregatePaginateModel<any>>("Comment", Comment);
