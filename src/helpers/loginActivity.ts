import axios from "axios";
import type { Request } from "express";

const GEO_LOOKUP_TIMEOUT = 1200;

const isPrivateIp = (ip = "") => {
  const value = String(ip || "").trim().toLowerCase();
  if (!value) return true;
  if (value === "localhost" || value === "::1" || value === "127.0.0.1") return true;
  if (value.startsWith("::ffff:127.")) return true;
  if (value.startsWith("10.")) return true;
  if (value.startsWith("192.168.")) return true;

  const match = value.match(/^172\.(\d{1,2})\./);
  if (match) {
    const octet = Number(match[1]);
    if (octet >= 16 && octet <= 31) return true;
  }

  return false;
};

export const getClientIp = (req: Request) => {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.trim()) {
    return xForwardedFor.split(",")[0].trim().replace(/^::ffff:/i, "");
  }

  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string" && xRealIp.trim()) {
    return xRealIp.trim().replace(/^::ffff:/i, "");
  }

  const directIp = (req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || "").trim();
  return directIp.replace(/^::ffff:/i, "");
};

export const parseUserAgent = (userAgent = "") => {
  const ua = String(userAgent || "").toLowerCase();

  let device = "Desktop";
  if (/ipad|tablet|playbook|silk|sm-t|kindle/i.test(userAgent)) {
    device = "Tablet";
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|mobi/i.test(userAgent)) {
    device = "Mobile";
  }

  let browser = "Unknown";
  if (ua.includes("edg/") || ua.includes("edge/")) browser = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("chrome/") && !ua.includes("edg/") && !ua.includes("opr/")) browser = "Chrome";
  else if (ua.includes("firefox/")) browser = "Firefox";
  else if (ua.includes("safari/") && !ua.includes("chrome/")) browser = "Safari";
  else if (ua.includes("brave")) browser = "Brave";
  else if (ua.includes("samsungbrowser")) browser = "Samsung Browser";

  let os = "Unknown";
  if (ua.includes("windows nt")) os = "Windows";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";
  else if (ua.includes("mac os x") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("cros")) os = "Chrome OS";

  return { device, browser, os };
};

export const getLocationFromIp = async (ipAddress = "") => {
  if (!ipAddress || isPrivateIp(ipAddress)) {
    return "Localhost";
  }

  try {
    const response = await axios.get(`https://ipapi.co/${encodeURIComponent(ipAddress)}/json/`, {
      timeout: GEO_LOOKUP_TIMEOUT,
    });

    const city = response?.data?.city || "";
    const state = response?.data?.region || response?.data?.region_code || "";
    const country = response?.data?.country_name || "";

    return [city, state, country].filter(Boolean).join(", ") || country || "Unknown";
  } catch {
    return "Unknown";
  }
};

export const buildLoginActivityMeta = async (req: Request) => {
  const ipAddress = getClientIp(req) || "Unknown";
  const userAgent = String(req.headers["user-agent"] || "");
  const { device, browser, os } = parseUserAgent(userAgent);
  const location = await getLocationFromIp(ipAddress);

  return {
    ipAddress,
    device,
    browser,
    os,
    location,
    userAgent,
  };
};
