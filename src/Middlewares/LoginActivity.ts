import { buildLoginActivityMeta } from "../helpers/loginActivity";

const captureLoginActivity = async (req, res, next) => {
  try {
    req.loginActivityMeta = await buildLoginActivityMeta(req);
  } catch (error) {
    req.loginActivityMeta = {
      ipAddress: "Unknown",
      device: "Desktop",
      browser: "Unknown",
      os: "Unknown",
      location: "Unknown",
      userAgent: String(req.headers["user-agent"] || ""),
    };
  }

  next();
};

export default captureLoginActivity;
