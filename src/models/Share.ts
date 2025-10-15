import mongoose, { model, AggregatePaginateModel } from "mongoose";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { Schema } = mongoose;

const Share = new Schema(
  {
    shared_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    diary_id: {
      type: Schema.Types.ObjectId,
      ref: "Diary",
      required: true,
    },

    // 🔁 Type of Share: "internal" | "external"
    share_type: {
      type: String,
      enum: ["internal", "external"],
      required: true,
    },

    // ✅ INTERNAL SHARE: shared to users (chat-type)
    shared_to: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // ✅ EXTERNAL SHARE: platform name + url
    platform: {
      type: String,
      enum: ["whatsapp", "facebook", "instagram", "copy", "twitter", "other"],
    },
    share_url: {
      type: String,
    },

    meta: {
      ip: String,
      user_agent: String,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

Share.index({ shared_by: 1, diary_id: 1, platform: 1 });
Share.plugin(aggregatePaginate);

export default model<any, AggregatePaginateModel<any>>("Share", Share);
