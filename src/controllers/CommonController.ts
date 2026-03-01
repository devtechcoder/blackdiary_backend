import _RS from "../helpers/ResponseHelper";
import { FileUpload } from "../helpers/FileUpload";
import Category from "../models/Category";
import SubCategory from "../models/SubCategory";
import User, { UserTypes } from "../models/User";
import Occasion from "../models/Occasion";
import { CATEGORY_DATA } from "../constants/constants";
import Follow from "../models/Follow";
import Content from "../models/Content";
import Master from "../models/Master";
import Setting from "../models/Setting";
export class Controller {
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

      console.log("Uploaded File:", file);

      if (!file) {
        return _RS.api(res, false, "Image Upload Failed", {}, new Date().getTime());
      }

      // Cloudinary gives URL in file.path
      const imageUrl = file.path;

      return _RS.api(res, true, "Image Uploaded Successfully", { url: imageUrl }, new Date().getTime());
    } catch (error) {
      console.log("Upload Error:", error);
      return _RS.api(res, false, "Internal Server Error", {}, new Date().getTime());
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

  static async searchAccount(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { q } = req.query;
      const filter: any = { is_delete: false };
      let data = [];
      if (q && q.trim() !== "") {
        filter.$or = [{ name: { $regex: q, $options: "i" } }, { user_name: { $regex: q, $options: "i" } }, { email: { $regex: q, $options: "i" } }, { phone: { $regex: q, $options: "i" } }];
        filter.type = { $in: [UserTypes.CUSTOMER] };
        data = await User.find(filter).sort({ name: 1 }).limit(50);
      } else {
        const searchQuery: any = { is_delete: false };
        if (q) {
          searchQuery.$or = [{ name: { $regex: q, $options: "i" } }, { hi_name: { $regex: q, $options: "i" } }];
        }
        const [occasions, subCategories] = await Promise.all([
          Occasion.aggregate([{ $match: searchQuery }, { $sort: { name: 1 } }, { $addFields: { type: "occasion" } }]),
          SubCategory.aggregate([{ $match: searchQuery }, { $sort: { name: 1 } }, { $addFields: { type: "sub_category" } }]),
        ]);
        data = [...occasions, ...subCategories].sort((a, b) => a.name.localeCompare(b.name));
      }

      return _RS.api(res, true, "search List", data, startTime);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  static async getUserProfile(req, res, next) {
    try {
      const startTime = Date.now();
      const { q } = req.query;

      if (!q || !q.trim()) {
        return _RS.api(res, true, "search List", {}, startTime);
      }

      // Build filter
      const filter = {
        is_delete: false,
        type: { $in: [UserTypes.CUSTOMER] },
        user_name: q.trim(),
      };

      // Fetch user first
      const user = await User.findOne(filter);

      if (!user) {
        return _RS.api(res, true, "User not found", {}, startTime);
      }

      // Run 2 queries in parallel (faster)
      const [followersCount, followingCount] = await Promise.all([
        Follow.countDocuments({ following: user._id }), // people who follow him
        Follow.countDocuments({ follower: user._id }), // people he follows
      ]);

      const result = {
        ...user.toObject(),
        followers: followersCount,
        following: followingCount,
      };

      return _RS.api(res, true, "User profile", result, startTime);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  static async getCms(req, res, next) {
    const startTime = new Date().getTime();
    const slug = req.params.slug;

    try {
      const getData = await Content.findOne({ slug: slug });

      return _RS.api(res, true, "cms data!", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getMasters(req, res, next) {
    const startTime = new Date().getTime();
    const slug = req.params.slug;

    try {
      let filter: any = { is_delete: false };
      if (slug) {
        filter.slug = slug;
      }
      const getData = await Master.find(filter).sort({ priority: 1 });

      return _RS.api(res, true, "master data!", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getSettings(req, res, next) {
    const startTime = new Date().getTime();
    const slug = req.params.slug;

    let filter: any = {};
    if (slug) {
      filter.group = slug;
    }

    try {
      const getData = await Setting.find(filter);

      return _RS.api(res, true, "settings data!", getData, startTime);
    } catch (err) {
      next(err);
    }
  }
}
