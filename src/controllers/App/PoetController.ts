import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/User";

export class PoetController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();

      let sort: any = { created_at: -1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = { is_delete: false };

      if (req.query.search && req.query.search.trim()) {
        filteredQuery.$or = [
          {
            name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
            hi_name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
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

      let myAggregate = User.aggregate(query);
      let list = await User.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "poet List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async viewDetails(req, res, next) {
    try {
      const startTime = new Date().getTime();

      let getData = await User.findById(req.params.id);
      if (!getData) {
        return _RS.api(res, false, "Poet not found", {}, startTime);
      }

      return _RS.api(res, true, "Poet Details fetch successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }
}
