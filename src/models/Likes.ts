import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Like = new Schema(
  {
    liked_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
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
export default model<any, AggregatePaginateModel<any>>("Like", Like);
