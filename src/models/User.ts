import * as mongoose from "mongoose";
import { model, AggregatePaginateModel } from "mongoose";
import { CATEGORY_TYPE } from "../constants/constants";
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

export const UserTypes = {
  ADMIN: "Admin",
  CUSTOMER: "Customer",
  SUBADMIN: "Sub-Admin",
  TEACHER: "Teacher",
  NULL: null,
};

export const SignUpTypes = {
  EMAIL: "Email",
  PHONE: "Phone",
  NULL: null,
};

const User = new Schema(
  {
    uid: { type: String, default: null },
    name: { type: String, default: null },
    user_name: { type: String, default: null },
    mobile_number: { type: String, default: null },
    country_code: { type: String, default: null },
    email: { type: String, default: null },
    password: { type: String },
    otp_data: {
      otp: { type: Number, default: null },
      otpExpiresTime: { type: Date, default: null },
    },

    dob: { type: String, default: null },
    category: [{ type: String, enum: Object.values(CATEGORY_TYPE), default: null }],
    gender: { type: String, enum: ["Male", "Female", "Other", null], default: null },
    language: { type: String, default: "en" },
    bio: { type: String, default: null },
    website_link: { type: String, default: null },
    is_suggestion_verify: { type: Number, default: null },
    image: { type: String, default: null },
    is_active: { type: Boolean, default: true },
    is_delete: { type: Boolean, default: false },
    is_otp_verify: { type: Boolean, default: false },
    added_by: { type: String, default: null },
    type: { type: String, enum: Object.values(UserTypes), default: null },
    signup_type: { type: String, enum: Object.values(SignUpTypes), default: null },
    social_type: { type: String, default: null },
    social_id: { type: String, default: null },
    device_token: { type: String, default: null },
    device_type: { type: String, default: null },
    permission: { type: Array, default: [] },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

User.pre("save", function (next) {
  if (!this["uid"]) {
    this["uid"] = generateRandomId();
  }

  next();
});

function generateRandomId() {
  return Math.floor(100000 + Math.random() * 900000);
}

mongoose.plugin(aggregatePaginate);
User.index({ name: "text" });
User.index({ user_location: "2dsphere" });

export default model<any, AggregatePaginateModel<any>>("User", User);
