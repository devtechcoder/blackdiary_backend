import * as mongoose from "mongoose";
import { model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Leadership = new Schema(
  {
    name: { type: String, default: null },
    designation: { type: String, default: null },
    description: { type: String, default: null },
    gender: { type: String, default: null },
    sequence: { type: Number, default: null },
    image: { type: String, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

mongoose.plugin(aggregatePaginate);
Leadership.index({ name: "text" });
Leadership.index({ sequence: 1 });

export default model<any>("Leadership", Leadership);
