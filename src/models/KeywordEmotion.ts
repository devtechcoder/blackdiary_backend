import * as mongoose from "mongoose";
import { model } from "mongoose";
const Schema = mongoose.Schema;

const KeywordEmotion = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: null },
    categories: [{ type: String, required: true }],
    sub_category_ids: [{ type: Schema.Types.ObjectId, ref: "SubCategory", default: [] }],
    is_active: { type: Boolean, default: true },
    note: { type: String, default: null, trim: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

KeywordEmotion.index({ name: "text", note: "text" });
KeywordEmotion.index({ categories: 1 });
KeywordEmotion.index({ sub_category_ids: 1 });

export default model<any>("KeywordEmotion", KeywordEmotion, "keyword_emotions");
