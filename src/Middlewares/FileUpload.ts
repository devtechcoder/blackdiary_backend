// const fs = require("fs");
// const path = require("path");
// const multer = require("multer");
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";

// const MIME_TYPE_MAP = {
//   "image/png": "png",
//   "image/jpeg": "jpeg",
//   "image/jpg": "jpg",
//   "video/mp4": "mp4",
//   "video/quicktime": "mov",
//   "video/webm": "webm",
//   "image/webp": "webp",
//   "text/csv": "csv",
//   "application/json": "json",
//   "application/pdf": "pdf",
// };

// const fileUpload = (uploadPath) => {
//   const fullPath = path.join(process.cwd(), "uploads", "images", uploadPath);

//   if (!fs.existsSync(fullPath)) {
//     fs.mkdirSync(fullPath, { recursive: true }); // creates nested folders
//   }

//   return multer({
//     limits: { fileSize: 50 * 1024 * 1024 }, //50 mb
//     storage: multer.diskStorage({
//       destination: (req, file, cb) => {
//         if (!fs.existsSync(fullPath)) {
//           fs.mkdirSync(fullPath, { recursive: true });
//         }
//         cb(null, fullPath);
//       },
//       filename: (req, file, cb) => {
//         const ext = MIME_TYPE_MAP[file.mimetype];
//         cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
//       },
//     }),
//     fileFilter: (req, file, cb) => {
//       cb(null, true);
//     },
//   });
// };

// export default fileUpload;

const multer = require("multer");
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUpload = (folderName = "blackDiary_uploads") => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: folderName, // 👈 dynamic folder
      resource_type: "image",
      format: file.mimetype.split("/")[1], // jpg / png / webp
      public_id: `img_${Date.now()}`,
    }),
  });

  return multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith("image")) {
        cb(new Error("Only image files allowed"), false);
      }
      cb(null, true);
    },
  });
};

export default fileUpload;
