import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Model from "../../models/Master";
import { getCurrentTime } from "../../helpers/function";

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();
      let sort: any = { priority: 1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = { is_delete: false };

      if (req.query.slug && req.query.slug.trim()) {
        filteredQuery.slug = req.query.slug;
      }

      if (req.query.search && req.query.search.trim()) {
        const search = req.query.search.trim();

        filteredQuery.$or = [
          {
            title: { $regex: search, $options: "i" },
          },
          {
            sub_title: { $regex: search, $options: "i" },
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
      const { title, sub_title, link, priority, description, slug, type } = req.body;

      const create = await new Model({
        title,
        sub_title,
        link,
        priority,
        description,
        slug,
        type,
      }).save();

      return _RS.api(res, true, "Master has been added successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { title, sub_title, link, priority, description, slug, type } = req.body;
      const id = req.params.id;

      const getData = await Model.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Data Not Found!", {}, startTime);
      }

      getData.title = title ? title : getData.title;
      getData.sub_title = sub_title ? sub_title : getData.sub_title;
      getData.link = link ? link : getData.link;
      getData.priority = priority ? priority : getData.priority;
      getData.slug = slug ? slug : getData.slug;
      getData.description = description ? description : getData.description;
      getData.type = type ? type : getData.type;

      await getData.save();

      return _RS.api(res, true, "Master has been update successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();

      const getData = await Model.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Data not found!", {}, startTime);
      }

      getData.is_delete = true;
      await getData.save();

      return _RS.api(res, true, "Master deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
