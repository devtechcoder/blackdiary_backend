import * as mongoose from "mongoose";
import { model } from "mongoose";
const Schema = mongoose.Schema;

const LoginActivity = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ipAddress: { type: String, default: null },
    device: { type: String, default: null },
    browser: { type: String, default: null },
    os: { type: String, default: null },
    location: { type: String, default: null },
    userAgent: { type: String, default: null },
    loginAt: { type: Date, default: Date.now },
    logoutAt: { type: Date, default: null },
    status: { type: String, enum: ["LOGIN", "LOGOUT"], default: "LOGIN", index: true },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

LoginActivity.index({ userId: 1, loginAt: -1 });
LoginActivity.index({ userId: 1, logoutAt: 1 });

export default model<any>("LoginActivity", LoginActivity);
