import * as mongoose from "mongoose";
import { model } from "mongoose";
const Schema = mongoose.Schema;

const AlertPermission = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    new_followers: { type: Boolean, default: true },
    follow_requests: { type: Boolean, default: true },
    likes_on_posts: { type: Boolean, default: true },
    comments_and_replies: { type: Boolean, default: true },
    mentions_and_tags: { type: Boolean, default: true },
    direct_messages: { type: Boolean, default: true },
    diary_shares: { type: Boolean, default: true },
    security_alerts: { type: Boolean, default: true },
    product_updates: { type: Boolean, default: true },
    weekly_digest: { type: Boolean, default: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    collection: "alert_permission",
  },
);

AlertPermission.index({ user_id: 1 }, { unique: true });

export default model<any>("AlertPermission", AlertPermission);
