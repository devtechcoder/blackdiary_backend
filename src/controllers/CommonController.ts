import _RS from "../helpers/ResponseHelper";
import { FileUpload } from "../helpers/FileUpload";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import User, { UserTypes } from "../models/User";
import Occasion from "../models/Occasion";
import { CATEGORY_DATA } from "../constants/constants";

export class CommonController {
  /** API for category only for admin */

  /**
   * @api {post} /api/common/image-upload Image Upload
   * @apiVersion 1.0.0
   * @apiName Image Upload
   * @apiGroup Masters
   * @apiParam {File} image Image.
   * @apiParam {String} type Type (Ex.Profile, Type can be which image you are uploading).
   */

  static async uploadImage(req, res, next) {
    try {
      const file = req.file;
      if (!file) {
        return _RS.api(res, false, "Image Upload Failed", {}, new Date().getTime());
      }

      const uploadPath = `${process.env.ASSET_URL ?? "http://localhost:7900/image/"}` + file.filename;
      return _RS.api(res, true, "Image Uploaded", { path: uploadPath }, new Date().getTime());
    } catch (error) {
      console.log(error);
    }
  }

  static async categories(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const getData = CATEGORY_DATA;
      return _RS.api(res, true, "categories List", getData, startTime);
    } catch (error) {
      console.log(error);
    }
  }

  static async subCategories(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const filter: any = { is_delete: false };
      if (req.params.id) {
        filter.category = { $in: [req.params.id] };
      }
      const getData = await SubCategory.find(filter).sort({ name: 1 });
      return _RS.api(res, true, "subCategories List", getData, startTime);
    } catch (error) {
      console.log(error);
    }
  }

  static async occasion(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const filter: any = { is_delete: false };
      if (req.params.id) {
        filter._id = req.params.occasionId;
      }
      const getData = await Occasion.find(filter).sort({ name: 1 });
      return _RS.api(res, true, "Occasion List", getData, startTime);
    } catch (error) {
      console.log(error);
    }
  }

  static async customers(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const filter: any = { is_delete: false, type: UserTypes.CUSTOMER };

      const getData = await User.find(filter).sort({ name: 1 });
      return _RS.api(res, true, "User List", getData, startTime);
    } catch (error) {
      console.log(error);
    }
  }
}
