import AlertPermission from "../models/AlertPermission";

export const ALERT_PERMISSION_FIELDS = [
  "new_followers",
  "follow_requests",
  "likes_on_posts",
  "comments_and_replies",
  "mentions_and_tags",
  "direct_messages",
  "diary_shares",
  "security_alerts",
  "product_updates",
  "weekly_digest",
] as const;

export const buildDefaultAlertPermission = (userId) => ({
  user_id: userId,
  new_followers: true,
  follow_requests: true,
  likes_on_posts: true,
  comments_and_replies: true,
  mentions_and_tags: true,
  direct_messages: true,
  diary_shares: true,
  security_alerts: true,
  product_updates: true,
  weekly_digest: true,
});

export const sanitizeAlertPermissionPayload = (payload = {}) => {
  return ALERT_PERMISSION_FIELDS.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(payload, field)) {
      const value = payload[field];
      acc[field] = value === true || value === "true" || value === 1 || value === "1";
    }
    return acc;
  }, {});
};

export const ensureAlertPermission = async (userId) => {
  if (!userId) return null;

  return await AlertPermission.findOneAndUpdate(
    { user_id: userId },
    { $setOnInsert: buildDefaultAlertPermission(userId) },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};
