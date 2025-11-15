import * as multer from "multer";
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const time = moment().format("YYYY-MM-DD_HH-mm-ss");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);

    cb(null, `${file.fieldname}-${time}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage: storage });

export default class UploadFiles {
  static uploadSingleImage = upload.single("image");
}
