import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Leadership from "../../models/Leadership";
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

  static async add(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { name, designation, description, gender, sequence = 1, image } = req.body;

      const create = await new Leadership({
        name,
        designation,
        description,
        gender,
        sequence,
        image,
      }).save();

      return _RS.api(res, true, "Leadership has been added successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { name, designation, description, gender, sequence = 1, image } = req.body;
      const id = req.params.id;

      const getData = await Leadership.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Leadership Not Found!", {}, startTime);
      }

      getData.name = name ? name : getData.name;
      getData.designation = designation ? designation : getData.designation;
      getData.description = description ? description : getData.description;
      getData.gender = gender ? gender : getData.gender;
      getData.sequence = sequence ? sequence : getData.sequence;
      getData.image = image ? image : getData.image;

      await getData.save();

      return _RS.api(res, true, "Leadership has been update successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();

      const getData = await Leadership.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Leadership not found!", {}, startTime);
      }

      await getData.remove();

      return _RS.api(res, true, "Leadership deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
