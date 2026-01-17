import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Model from "../../models/Content";
import { getCurrentTime } from "../../helpers/function";

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();

      let sort: any = { created_at: -1 };

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

  static async add(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { name, slug, description } = req.body;

      const create = await new Model({
        name,
        slug,
        description,
      }).save();

      return _RS.api(res, true, "Content has been added successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { name, slug, description } = req.body;
      const id = req.params.id;

      const getData = await Model.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Content Not Found!", {}, startTime);
      }

      getData.name = name ? name : getData.name;
      getData.slug = slug ? slug : getData.slug;
      getData.description = description ? description : getData.description;

      await getData.save();

      return _RS.api(res, true, "Content has been update successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();

      const getData = await Model.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Content not found!", {}, startTime);
      }

      await getData.remove();

      return _RS.api(res, true, "Content deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
