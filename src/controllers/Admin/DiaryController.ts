import * as mongoose from "mongoose";
import { ADDED_BY_TYPES } from "../../constants/constants";
import _RS from "../../helpers/ResponseHelper";
import Diary from "../../models/Diary";
import Post from "../../models/Post";

const normalizeObjectIdArray = (value: any) => {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  return Array.from(new Set(rawValues))
    .map((item) => (typeof item === "object" && item !== null ? item?._id || item?.id || item?.value : item))
    .filter((item) => mongoose.Types.ObjectId.isValid(String(item)))
    .map((item) => new mongoose.Types.ObjectId(String(item)));
};

const getModelByType = (type: any) => (String(type || "shayari").toLowerCase() === "post" ? Post : Diary);
const getTypeLabel = (type: any) => (String(type || "shayari").toLowerCase() === "post" ? "Post" : "Diary");
const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class DiaryController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.query.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const category = String(req.query.category || "").trim();
      const subCategoryIds = normalizeObjectIdArray(req.query.sub_category_id);
      const status = String(req.query.status || "").trim();

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      const filteredQuery: any = { is_delete: false };

      if (category) {
        filteredQuery.category = category;
      }

      if (subCategoryIds.length) {
        filteredQuery.sub_category_id = { $in: subCategoryIds };
      }

      if (status) {
        const statuses = status
          .split(",")
          .map((value) => value.trim().toLowerCase() === "true")
          .filter((value) => typeof value === "boolean");

        if (statuses.length) {
          filteredQuery.is_active = { $in: statuses };
        }
      }

      if (req.query.search && String(req.query.search).trim()) {
        const searchValue = new RegExp(escapeRegex(String(req.query.search).trim()), "i");
        filteredQuery.$or = [
          { category: { $regex: searchValue } },
          { title: { $regex: searchValue } },
          { hi_title: { $regex: searchValue } },
          { content: { $regex: searchValue } },
          { hi_content: { $regex: searchValue } },
        ];
      }

      const query: any = [
        {
          $match: filteredQuery,
        },
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "subcategories",
            localField: "sub_category_id",
            foreignField: "_id",
            as: "sub_category_id",
          },
        },
        {
          $lookup: {
            from: "keyword_emotions",
            localField: "keywords",
            foreignField: "_id",
            as: "keywords",
          },
        },
        {
          $sort: { created_at: -1 },
        },
      ];

      const myAggregate = Model.aggregate(query);
      const list = await Model.aggregatePaginate(myAggregate, options);
      return _RS.api(res, true, `${getTypeLabel(type)} List fetch successfully`, list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.body?.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const imagePath = req.file?.path || req.body?.image || null;

      const payload: any = {
        category: req.body?.category,
        sub_category_id: normalizeObjectIdArray(req.body?.sub_category_id),
        author: req.body?.author,
        occasion_ids: normalizeObjectIdArray(req.body?.occasion_ids),
        added_by: ADDED_BY_TYPES.SELF,
      };

      if (req.body?.keywords !== undefined) {
        payload.keywords = normalizeObjectIdArray(req.body?.keywords);
      }

      if (type === "shayari") {
        payload.content = req.body?.content;
      } else {
        if (!imagePath) {
          return _RS.api(res, false, "Valid image must be provided", {}, startTime);
        }
        payload.image = imagePath;
      }

      await new Model(payload).save();

      return _RS.api(res, true, `${getTypeLabel(type)} has been added successfully`, {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.body?.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const id = req.params.id;

      const data = await Model.findById(id);

      if (!data) {
        return _RS.api(res, false, `${getTypeLabel(type)} Not Found`, {}, startTime);
      }

      if (req.body?.occasion_ids !== undefined) data.occasion_ids = normalizeObjectIdArray(req.body?.occasion_ids);
      if (req.body?.category !== undefined) data.category = req.body?.category;
      if (req.body?.sub_category_id !== undefined) data.sub_category_id = normalizeObjectIdArray(req.body?.sub_category_id);
      if (req.body?.author !== undefined) data.author = req.body?.author;
      if (req.body?.keywords !== undefined) data.keywords = normalizeObjectIdArray(req.body?.keywords);

      if (type === "shayari" && req.body?.content !== undefined) {
        data.content = req.body?.content;
      }

      if (type !== "shayari") {
        const imagePath = req.file?.path || req.body?.image;
        if (imagePath) {
          data.image = imagePath;
        }
      }

      await data.save();

      return _RS.api(res, true, `${getTypeLabel(type)} has been updated successfully`, data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.query?.type || req.body?.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const record = await Model.findOne({ _id: req.params.id });

      if (!record) {
        return _RS.api(res, false, `${getTypeLabel(type)} not found`, record, startTime);
      }

      record.is_active = !record.is_active;
      await record.save();

      return _RS.api(res, true, `${getTypeLabel(type)} Status changed successfully`, record, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.query?.type || req.body?.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const record = await Model.findOne({ _id: req.params.id });

      if (!record) {
        return _RS.api(res, false, `${getTypeLabel(type)} not found`, {}, startTime);
      }

      record.is_delete = true;
      await record.save();

      return _RS.api(res, true, `${getTypeLabel(type)} deleted successfully`, record, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async viewDetails(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const type = String(req.query?.type || req.body?.type || "shayari").toLowerCase();
      const Model = getModelByType(type);
      const record = await Model.findOne({ _id: req.params.id }).populate("sub_category_id author keywords");

      if (!record) {
        return _RS.api(res, false, `${getTypeLabel(type)} not found`, {}, startTime);
      }

      return _RS.api(res, true, `${getTypeLabel(type)} reterived successfully`, record, startTime);
    } catch (err) {
      next(err);
    }
  }
}
