import LoginActivity from "../../models/LoginActivity";
import _RS from "../../helpers/ResponseHelper";

const buildRecentFilter = (userId) => {
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  return {
    userId,
    $or: [{ logoutAt: null }, { logoutAt: { $gte: sixtyDaysAgo } }],
  };
};

const getPagination = (req) => {
  const page = Math.max(parseInt(String(req.query.page || "1"), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.pageSize || req.query.limit || "20"), 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const formatActivity = (activity) => ({
  ...activity,
  isCurrentSession: !activity.logoutAt,
  lastActiveAt: activity.logoutAt || activity.loginAt,
});

export class LoginActivityController {
  static async recordLogin(req, userId) {
    try {
      const meta = req.loginActivityMeta || {};
      await LoginActivity.create({
        userId,
        ipAddress: meta.ipAddress || "Unknown",
        device: meta.device || "Desktop",
        browser: meta.browser || "Unknown",
        os: meta.os || "Unknown",
        location: meta.location || "Unknown",
        userAgent: meta.userAgent || "",
        loginAt: new Date(),
        logoutAt: null,
        status: "LOGIN",
      });
    } catch (error) {
      console.log("Login activity record error:", error?.message || error);
    }
  }

  static async logout(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const latestSession = await LoginActivity.findOne({
        userId: req.user.id,
        logoutAt: null,
      }).sort({ loginAt: -1, created_at: -1 });

      if (latestSession) {
        latestSession.logoutAt = new Date();
        latestSession.status = "LOGOUT";
        await latestSession.save();
      }

      return _RS.api(res, true, "Logout activity updated successfully", latestSession || {}, startTime);
    } catch (error) {
      next(error);
    }
  }

  static async getMine(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { page, limit, skip } = getPagination(req);
      const filter = buildRecentFilter(req.user.id);

      const [docs, totalDocs, totalLoginCount, totalLogoutCount, activeSessions] = await Promise.all([
        LoginActivity.find(filter).sort({ loginAt: -1, created_at: -1 }).skip(skip).limit(limit).lean(),
        LoginActivity.countDocuments(filter),
        LoginActivity.countDocuments({ ...filter, status: "LOGIN" }),
        LoginActivity.countDocuments({ ...filter, status: "LOGOUT" }),
        LoginActivity.countDocuments({ userId: req.user.id, logoutAt: null }),
      ]);
      const currentSession = await LoginActivity.findOne({
        userId: req.user.id,
        logoutAt: null,
      })
        .sort({ loginAt: -1, created_at: -1 })
        .select("_id")
        .lean();

      return _RS.api(
        res,
        true,
        "Login activity fetch successfully",
        {
          docs: docs.map(formatActivity),
          totalDocs,
          page,
          limit,
          totalPages: Math.ceil(totalDocs / limit) || 0,
          hasNextPage: skip + docs.length < totalDocs,
          summary: {
            totalLoginCount,
            totalLogoutCount,
            activeSessions,
          },
          currentSessionId: currentSession?._id || null,
        },
        startTime,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getByUserId(req, res, next) {
    const startTime = new Date().getTime();
    try {
      const { page, limit, skip } = getPagination(req);
      const userId = req.params.userId;
      const filter = buildRecentFilter(userId);

      const [docs, totalDocs, totalLoginCount, totalLogoutCount, activeSessions] = await Promise.all([
        LoginActivity.find(filter).sort({ loginAt: -1, created_at: -1 }).skip(skip).limit(limit).lean(),
        LoginActivity.countDocuments(filter),
        LoginActivity.countDocuments({ ...filter, status: "LOGIN" }),
        LoginActivity.countDocuments({ ...filter, status: "LOGOUT" }),
        LoginActivity.countDocuments({ userId, logoutAt: null }),
      ]);
      const currentSession = await LoginActivity.findOne({
        userId,
        logoutAt: null,
      })
        .sort({ loginAt: -1, created_at: -1 })
        .select("_id")
        .lean();

      return _RS.api(
        res,
        true,
        "Login activity fetch successfully",
        {
          docs: docs.map(formatActivity),
          totalDocs,
          page,
          limit,
          totalPages: Math.ceil(totalDocs / limit) || 0,
          hasNextPage: skip + docs.length < totalDocs,
          summary: {
            totalLoginCount,
            totalLogoutCount,
            activeSessions,
          },
          currentSessionId: currentSession?._id || null,
        },
        startTime,
      );
    } catch (error) {
      next(error);
    }
  }
}

export default LoginActivityController;
