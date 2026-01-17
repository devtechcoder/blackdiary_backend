import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Model from "../../models/Setting";
import { getCurrentTime } from "../../helpers/function";
import { group } from "console";
import { GENERAL_SETTINGS_ENUM_SLUGS, SOCIAL_SETTINGS_ENUM_SLUGS } from "../../constants/constants";

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();

      let sort: any = { created_at: -1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 200,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = {};

      if (req.query.search && req.query.search.trim()) {
        const search = req.query.search.trim();

        filteredQuery.$or = [
          {
            group: { $regex: search, $options: "i" },
          },
          {
            slug: { $regex: search, $options: "i" },
          },
        ];
      }

      let query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: sort,
        },
      ];

      let myAggregate = Model.aggregate(query);
      let list = await Model.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async addEdit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { data } = req.body;
      for (const item of data) {
        const { group, value, slug } = item;
        if (![...GENERAL_SETTINGS_ENUM_SLUGS, ...SOCIAL_SETTINGS_ENUM_SLUGS].includes(slug)) {
          continue;
        }
        const existingSetting = await Model.findOne({ slug: slug });
        if (existingSetting) {
          // Update existing setting
          existingSetting.group = group;
          existingSetting.value = value;
          await existingSetting.save();
        } else {
          // Create new setting
          await new Model({
            group,
            value,
            slug,
          }).save();
        }
      }

      return _RS.api(res, true, "Settings have been saved successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
