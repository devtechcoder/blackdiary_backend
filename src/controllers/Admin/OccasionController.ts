import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Occasion from "../../models/Occasion";
import { ADDED_BY_TYPES } from "../../constants/constants";

export class OccasionController {
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
            hindi_name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
          },
        ];
      }

      if (req.query.status) {
        var arrayValues = req.query.status.split(",");
        var booleanValues = arrayValues.map(function (value) {
          return value.toLowerCase() === "true";
        });
        filteredQuery.is_active = { $in: booleanValues };
      }

      let query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: sort,
        },
      ];

      let myAggregate = Occasion.aggregate(query);
      let list = await Occasion.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Occasion List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, hi_name, description, hi_description, sort_number, is_active, is_featured } = req.body;
      let getData = await Occasion.findOne({
        name: name,
        is_delete: false,
      });

      if (getData) {
        return _RS.api(res, false, "Occasion already exist with this name", {}, startTime);
      }

      getData = await Occasion.findOne({
        sort_number,
        is_delete: false,
      });

      if (getData) {
        return _RS.api(res, false, "Occasion already exist with this sorting number!", {}, startTime);
      }

      const data = await new Occasion({
        image,
        name,
        hi_name,
        sort_number,
        is_active,
        is_featured,
        description,
        hi_description,
        added_by: ADDED_BY_TYPES.ADMIN,
      }).save();

      return _RS.api(res, true, "Occasion has been added successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, hi_name, description, hi_description, sort_number, is_active, is_featured } = req.body;
      const id = req.params.id;

      const getData = await Occasion.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Occasion Not Found", {}, startTime);
      }

      let isAlready = await Occasion.findOne({
        _id: { $ne: id },
        name: name,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Occasion already exist with this name", {}, startTime);
      }

      isAlready = await Occasion.findOne({
        _id: { $ne: id },
        sort_number,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Occasion already exist with this sorting number!", {}, startTime);
      }

      getData.name = name ? name : getData.name;
      getData.hi_name = hi_name ? hi_name : getData.hi_name;
      getData.description = description ? description : getData.description;
      getData.hi_description = hi_description ? hi_description : getData.hi_description;
      getData.sort_number = sort_number ? sort_number : getData.sort_number;
      getData.image = image ? image : getData.image;
      getData.is_active = is_active;
      getData.is_featured = is_featured;
      getData.save();

      return _RS.api(res, true, "Occasion has been update successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await Occasion.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Occasion not found", getData, startTime);
      }

      getData.is_active = !getData.is_active;
      await getData.save();

      return _RS.api(res, true, "Occasion Status changed successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await Occasion.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Occasion not found", {}, startTime);
      }

      getData.is_delete = true;
      await getData.save();

      return _RS.api(res, true, "Occasion deleted successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }
}
