import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Diary from "../../models/Diary";

import { ADDED_BY_TYPES } from "../../constants/constants";

export class DiaryController {
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
            title: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
            content: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
            hi_content: {
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

      let myAggregate = Diary.aggregate(query);
      let list = await Diary.aggregatePaginate(myAggregate, options);
      return _RS.api(res, true, "Diary List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, occasion_ids, category, sub_category_id, hi_title, title, author, content, hi_content, is_active, is_featured } = req.body;
      const getData = await Diary.findOne({
        category,
        content: content,
        hi_content: hi_content,
        is_delete: false,
      });

      if (getData) {
        return _RS.api(res, false, "Diary already exist with this content", {}, startTime);
      }

      const data = await new Diary({
        image,
        category,
        sub_category_id,
        hi_title,
        title,
        author,
        content,
        hi_content,
        is_active,
        is_featured,
        occasion_ids,
        added_by: ADDED_BY_TYPES.ADMIN,
      }).save();

      return _RS.api(res, true, "Diary has been added successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, occasion_ids, category, sub_category_id, hi_title, title, author, content, hi_content, is_active, is_featured } = req.body;

      const id = req.params.id;

      const getData = await Diary.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Diary Not Found", {}, startTime);
      }

      getData.occasion_ids = occasion_ids ? occasion_ids : getData.occasion_ids;
      getData.category = category ? category : getData.category;
      getData.sub_category_id = sub_category_id ? sub_category_id : getData.sub_category_id;
      getData.hi_title = hi_title ? hi_title : getData.hi_title;
      getData.title = title ? title : getData.title;
      getData.author = author ? author : getData.author;
      getData.content = content ? content : getData.content;
      getData.hi_content = hi_content ? hi_content : getData.hi_content;
      getData.image = image ? image : getData.image;
      getData.is_featured = is_featured;
      getData.save();

      return _RS.api(res, true, "Diary has been update successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const getCategory = await Diary.findOne({ _id: req.params.id });

      if (!getCategory) {
        return _RS.api(res, false, "Diary not found", getCategory, startTime);
      }

      getCategory.is_active = !getCategory.is_active;
      await getCategory.save();

      return _RS.api(res, true, "Diary Status changed successfully", getCategory, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await Diary.findOne({ _id: req.params.id });

      if (!getData) {
        return _RS.api(res, false, "Diary not found", {}, startTime);
      }

      getData.is_delete = true;
      await getData.save();

      return _RS.api(res, true, "Diary deleted successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async viewDetails(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getData = await Diary.findOne({ _id: req.params.id }).populate("category_id sub_category_id author");

      if (!getData) {
        return _RS.api(res, false, "Diary not found", {}, startTime);
      }

      return _RS.api(res, true, "Diary reterived successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }
}
