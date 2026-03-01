import * as fs from "fs";
import * as path from "path";

const IMAGE_BASE_URL = "http://localhost:7900";

/**
 * Middleware to normalize image URLs in API responses
 * Keeps original file extension and prepends public base URL.
 */
export const optimizeImageUrls = async (req, res, next) => {
  // Store original send
  const originalSend = res.send;

  res.send = async function (body) {
    try {
      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      // Check if data exists in response
      if (body?.data) {
        body.data = await processImagesRecursively(body.data);
      }

      res.setHeader("Content-Type", "application/json");
      return originalSend.call(this, JSON.stringify(body));
    } catch (err) {
      console.error("Image optimization middleware error:", err);
      return originalSend.call(this, body);
    }
  };

  next();
};

async function processImagesRecursively(data) {
  if (Array.isArray(data)) {
    return Promise.all(data.map(processImagesRecursively));
  } else if (typeof data === "object" && data !== null) {
    const newData = { ...data };
    for (const key in newData) {
      if (typeof newData[key] === "string" && looksLikeImage(newData[key])) {
        const optimizedImagePath = await optimizeSingleImage(newData[key]);
        newData[key] = buildPublicImageUrl(optimizedImagePath);
      } else if (typeof newData[key] === "object") {
        newData[key] = await processImagesRecursively(newData[key]);
      }
    }
    return newData;
  }
  return data;
}

function looksLikeImage(value) {
  return /\.(jpg|jpeg|png|webp)$/i.test(value);
}

async function optimizeSingleImage(url) {
  try {
    if (/^https?:\/\//i.test(url)) return url;

    const normalizedUrl = url.replace(/\\/g, "/");
    const localPath = path.isAbsolute(normalizedUrl)
      ? normalizedUrl
      : path.join(process.cwd(), normalizedUrl.replace(/^\/+/, ""));

    if (!fs.existsSync(localPath)) return url;
    return normalizedUrl;
  } catch (error) {
    console.error("Error optimizing image:", error);
    return url;
  }
}

function buildPublicImageUrl(imagePath: string) {
  if (!imagePath) return imagePath;
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const normalizedPath = path
    .relative(process.cwd(), path.isAbsolute(imagePath) ? imagePath : path.join(process.cwd(), imagePath))
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  return `${IMAGE_BASE_URL}/${normalizedPath}`;
}
