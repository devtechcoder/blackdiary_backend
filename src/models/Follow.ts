import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Follow = new Schema(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User", // user who is following
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User", // user who is being followed
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

Follow.index({ follower: 1, following: 1 }, { unique: true });

mongoose.plugin(aggregatePaginate);
export default model<any, AggregatePaginateModel<any>>("Follow", Follow);
