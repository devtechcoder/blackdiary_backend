import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Diary from "../../models/Diary";

import { ADDED_BY_TYPES } from "../../constants/constants";
import Post from "../../models/Post";

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
      const { type, image, occasion_ids, category, sub_category_id, author, content } = req.body;

      if (type === "shayari") {
        await new Diary({
          category,
          sub_category_id,
          author,
          content,
          occasion_ids,
          added_by: ADDED_BY_TYPES.SELF,
        }).save();
      } else {
        await new Post({
          category,
          sub_category_id,
          author,
          image,
          occasion_ids,
          added_by: ADDED_BY_TYPES.SELF,
        }).save();
      }

      return _RS.api(res, true, "Diary has been added successfully", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const { type, image, occasion_ids, category, sub_category_id, author, content, is_active, is_featured } = req.body;

      const id = req.params.id;

      // Detect Model
      let Model = type === "shayari" ? Diary : Post;

      const data = await Model.findById(id);

      if (!data) {
        return _RS.api(res, false, `${type === "shayari" ? "Diary" : "Post"} Not Found`, {}, startTime);
      }

      // Common fields
      if (occasion_ids) data.occasion_ids = occasion_ids;
      if (category) data.category = category;
      if (sub_category_id) data.sub_category_id = sub_category_id;
      if (author) data.author = author;

      // Shayari fields
      if (type === "shayari") {
        if (content) data.content = content;
      }

      // Post fields
      if (type !== "shayari") {
        if (image) data.image = image;
        // Posts may not use content (based on your add API)
      }

      await data.save();

      return _RS.api(res, true, `${type === "shayari" ? "Diary" : "Post"} has been updated successfully`, data, startTime);
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
