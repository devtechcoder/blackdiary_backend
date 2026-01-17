import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Leadership from "../../models/Leadership";
import { getCurrentTime } from "../../helpers/function";

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();

      let sort: any = { sequence: 1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = {};

      if (req.query.search && req.query.search.trim()) {
        const search = req.query.search.trim();

        filteredQuery.$or = [
          {
            name: { $regex: search, $options: "i" },
          },
          {
            designation: { $regex: search, $options: "i" },
          },
          {
            description: { $regex: search, $options: "i" },
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

      let myAggregate = Leadership.aggregate(query);
      let list = await Leadership.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Leadership List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }
}
