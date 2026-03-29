import * as mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog";
import User, { UserTypes } from "../models/User";
import ChangeLog from "../models/ChangeLog";
import * as fs from "fs";
import * as path from "path";
import { normalizeUserName } from "./userNameHelper";

export const activityLog = async (action, message, user_id) => {
  const user = await User.findById(user_id);
  if (!user) return;
  await ActivityLog.create({
    action,
    message,
    user_id,
  });
};

export const changeLog = async (action, message, sub_admin) => {
  const subAdmin = await User.findById(sub_admin);
  if (!subAdmin) {
    return;
  }

  const data = await ChangeLog.create({
    action,
    message,
    user_id: subAdmin,
  });

  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
  console.log("=>>>   ", data);
};

export const formattedEmail = (email) => {
  return email ? email?.trim()?.toLowerCase() : email;
};

export const getCurrentTime = () => {
  return new Date().getTime();
};

export const formattedUserName = (value) => {
  return normalizeUserName(value);
};

export const deleteLocalImageIfExists = (imagePath: string | null | undefined) => {
  try {
    if (!imagePath) return;
    if (/^https?:\/\//i.test(imagePath)) return;

    const normalizedPath = imagePath.replace(/\\/g, "/");
    const absolutePath = path.isAbsolute(normalizedPath) ? normalizedPath : path.join(process.cwd(), normalizedPath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (error) {
    console.log("Image delete error:", error);
  }
};
