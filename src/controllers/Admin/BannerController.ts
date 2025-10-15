import Banner from "../../models/Banner";
import _RS from "../../helpers/ResponseHelper";
import * as mongoose from "mongoose";
import { ADDED_BY_TYPES } from "../../constants/constants";

export class BannerController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();

      let sort: any = { created_at: -1 };
      const country_id = req.country_id;
      let page = 1;
      let pageSize = 10000;

      const filter: any = {
        is_delete: false,
      };

      console.log("req.query.position", req.query.position);
      if (req.query.page) page = parseInt(req.query.page);
      if (req.query.pageSize) pageSize = parseInt(req.query.pageSize);
      if (req.query.city_id)
        filter.city_ids = {
          $in: [new mongoose.Types.ObjectId(req.query.city_id)],
        };
      if (req.query.banner_for) filter.banner_for = req.query.banner_for;
      if (req.query.position) filter.position = { $regex: new RegExp(req.query.position, "i") };
      if (req.query.status) {
        var arrayValues = req.query.status.split(",");
        var booleanValues = arrayValues.map(function (value) {
          return value.toLowerCase() === "true";
        });
        filter.is_active = { $in: booleanValues };
      }

      if (req.query.search) {
        const search = req.query.search.trim();
        filter.$or = [
          {
            position: {
              $regex: new RegExp(search),
              $options: "i",
            },
          },
        ];
      }

      const skip = (page - 1) * pageSize;

      let total = await Banner.countDocuments(filter);
      const data = await Banner.aggregate([
        {
          $match: { ...filter },
        },

        {
          $sort: {
            created_at: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: pageSize,
        },
      ]);

      return _RS.apiNew(
        res,
        true,
        "Banner retrieved successfully",
        {
          data,
          total,
          page,
          pageSize,
        },
        startTime
      );
    } catch (error) {
      console.error("Error:", error);
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { title, description, image, mobile_image, start_date, end_date, is_active, sort_order, rotation_time, banner_link, position, category, sub_category_ids, occasion_ids } = req.body;

      const addBanner = await Banner.create({
        title,
        description,
        image,
        mobile_image,
        start_date,
        end_date,
        is_active,
        sort_order,
        rotation_time,
        banner_link,
        position,
        category,
        sub_category_ids,
        occasion_ids,
        added_by: ADDED_BY_TYPES.ADMIN,
      });

      return _RS.apiNew(res, true, "Banner added successfully", addBanner, startTime);
    } catch (error) {
      console.error("Error:", error);
      next(error);
    }
  }
  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const id = req.params.id;
      const country_id = req.country_id;
      const { title, description, image, mobile_image, start_date, end_date, is_active, sort_order, rotation_time, banner_link, position, category, sub_category_ids, occasion_ids } = req.body;

      const banner = await Banner.findById(id);

      if (!banner) {
        return _RS.apiNew(res, false, "Banner not found", {}, startTime);
      }

      banner.title = title ? title : banner.title;
      banner.description = description ? description : banner.description;
      banner.image = image ? image : banner.image;
      banner.mobile_image = mobile_image ? mobile_image : banner.mobile_image;
      banner.start_date = start_date ? start_date : banner.start_date;
      banner.end_date = end_date ? end_date : banner.end_date;
      banner.sort_order = sort_order ? sort_order : banner.sort_order;
      banner.rotation_time = rotation_time ? rotation_time : banner.rotation_time;
      banner.position = position ? position : banner.position;
      banner.category = category ? category : banner.category;
      banner.sub_category_ids = sub_category_ids ? sub_category_ids : banner.sub_category_ids;
      banner.occasion_ids = occasion_ids ? occasion_ids : banner.occasion_ids;
      banner.is_active = is_active;
      banner.banner_link = banner_link;
      await banner.save();

      return _RS.apiNew(res, true, "Banner updated successfully", { data: banner }, startTime);
    } catch (error) {
      console.error("Error:", error);
      next(error);
    }
  }
  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const id = req.params.id;

      const choice = await Banner.findById(id);

      if (!choice) {
        return _RS.apiNew(res, false, "Banner not found", {}, startTime);
      }

      choice.is_active = !choice.is_active;

      await choice.save();

      return _RS.apiNew(res, true, "Banner status changed successfully", choice, startTime);
    } catch (error) {
      console.log("Error :", error);

      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const id = req.params.id;

      const user = await Banner.findById(id);

      if (!user) {
        return _RS.apiNew(res, false, "Banner not found", {}, startTime);
      }

      user.is_delete = true;

      await user.save();

      return _RS.apiNew(res, true, "Banner deleted successfully", user, startTime);
    } catch (error) {
      console.log("Error :", error);

      next(error);
    }
  }
}
