// Load environment variables from .env file
require("dotenv").config();

import multer = require("multer");
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request, Response, NextFunction } from "express";

/* ---------------------------------------------------
   Cloudinary Config
--------------------------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

/* ---------------------------------------------------
   Cloudinary Storage (Multer)
--------------------------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "blackDiary_uploads",
    format: file.mimetype.split("/")[1], // auto jpg/png
    public_id: `img_${Date.now()}`, // unique name
  }),
});

/* ---------------------------------------------------
   Multer Upload Config
--------------------------------------------------- */
const uploader = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPG, JPEG & PNG images are allowed"));
    }
    cb(null, true);
  },
}).single("image");

/* ---------------------------------------------------
   Upload Middleware Class
--------------------------------------------------- */
export default class UploadFiles {
  static uploadSingleImage(req: any, res: Response, next: NextFunction) {
    uploader(req, res, (err: any) => {
      /* Multer specific errors */
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      /* Custom / Cloudinary errors */
      if (err) {
        console.log("err---->", err);
        return res.status(400).json({
          success: false,
          message: err.message || "Image upload failed",
        });
      }

      /* File not found */
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      /* Success → next controller */
      next();
    });
  }
}
