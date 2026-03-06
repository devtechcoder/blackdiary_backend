import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Seo = new Schema(
  {
    section: { type: String, default: "page" },
    page_key: { type: String, required: true, trim: true },
    primary: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      keywords: { type: String, default: null },
    },
    openGraph: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      image: { type: String, default: null },
      url: { type: String, default: null },
      type: { type: String, default: null },
      site_name: { type: String, default: null },
    },
    twitter: {
      title: { type: String, default: null },
      description: { type: String, default: null },
      image: { type: String, default: null },
      url: { type: String, default: null },
      type: { type: String, default: null },
      site_name: { type: String, default: null },
    },
    common: {
      title: { type: String, default: null },
      robots: { type: String, default: null },
      language: { type: String, default: null },
      author: { type: String, default: null },
      description: { type: String, default: null },
      keywords: { type: String, default: null },
      image: { type: String, default: null },
      url: { type: String, default: null },
      type: { type: String, default: null },
      site_name: { type: String, default: null },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

mongoose.plugin(aggregatePaginate);
Seo.index({ page_key: 1 }, { unique: true });
Seo.index({ page_key: "text", section: "text" });

export default model<any, AggregatePaginateModel<any>>("Seo", Seo);
