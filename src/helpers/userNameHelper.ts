import * as mongoose from "mongoose";
import User, { UserTypes } from "../models/User";

export const USER_NAME_PATTERN = /^[a-z0-9](?:[a-z0-9._]{1,28}[a-z0-9])?$/;

export const normalizeUserName = (value: any) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().toLowerCase().replace(/^@+/, "").replace(/[^a-z0-9._]/g, "");
};

export const isValidUserName = (value: any) => {
  const normalized = normalizeUserName(value);
  return USER_NAME_PATTERN.test(normalized);
};

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isUserNameTaken = async (value: any, excludeId?: string | null) => {
  const normalized = normalizeUserName(value);

  if (!normalized) {
    return false;
  }

  const query: any = {
    user_name: { $regex: new RegExp(`^${escapeRegex(normalized)}$`, "i") },
    is_delete: false,
    type: UserTypes.CUSTOMER,
  };

  if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
  }

  const existing = await User.findOne(query).select("_id");
  return Boolean(existing);
};

const buildCandidateUserName = (base: string, suffix = 0) => {
  const suffixText = suffix > 0 ? `_${suffix}` : "";
  const maxBaseLength = Math.max(1, 30 - suffixText.length);
  return `${base.slice(0, maxBaseLength)}${suffixText}`;
};

export const createAvailableUserName = async (value: any, excludeId?: string | null) => {
  const normalized = normalizeUserName(value);

  if (!normalized) {
    return "";
  }

  let suffix = 0;
  let candidate = buildCandidateUserName(normalized, suffix);

  while (await isUserNameTaken(candidate, excludeId)) {
    suffix += 1;
    candidate = buildCandidateUserName(normalized, suffix);
  }

  return candidate;
};
