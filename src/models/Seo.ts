import * as mongoose from "mongoose";
import { model } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const Seo = new Schema(
  {
    slug: { type: String, required: true, trim: true },
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
      canonical: { type: String, default: null },
      robots: { type: String, default: null },
      author: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  },
);

mongoose.plugin(aggregatePaginate);
Seo.index({ slug: 1 }, { unique: true });
Seo.index({ slug: "text", "primary.title": "text", "openGraph.title": "text", "twitter.title": "text" });

export default model<any>("Seo", Seo);
