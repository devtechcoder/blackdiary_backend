import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import SubCategory from "../../models/SubCategory";
import { UserTypes } from "../../models/User";
import { ChangeLogAction } from "../../models/ChangeLog";
import { changeLog } from "../../helpers/function";
import { ADDED_BY_TYPES } from "../../constants/constants";

export class SubCategoryController {
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

      let filteredQuery: any = {
        is_delete: false,
      };
      if (req.query.search && req.query.search.trim()) {
        filteredQuery.$or = [
          {
            name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
          },
          {
            hindi_name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
          },
          {
            hinglish_name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
          },
          {
            "category_id.name": {
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

      let myAggregate = SubCategory.aggregate(query);
      let list = await SubCategory.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Subcategory List", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, bg_color, name, hi_name, sort_number, added_by, is_featured, is_active, category } = req.body;

      let isAlready = await SubCategory.findOne({
        category,
        name,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Sub Category already exist with this name", isAlready, startTime);
      }

      isAlready = await SubCategory.findOne({
        category,
        name,
        sort_number,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Sub Category already exist with this sort number", isAlready, startTime);
      }

      const subCategory = await SubCategory.create({
        image,
        name,
        hi_name,
        added_by: added_by ? added_by : ADDED_BY_TYPES.ADMIN,
        is_featured,
        is_active,
        sort_number,
        category,
        bg_color,
      });

      if (req.user.type == UserTypes.TEACHER) {
        await changeLog(ChangeLogAction.ADD, `Added New Sub Category ${subCategory?.name}.`, req.user.id);
      }

      return _RS.api(res, true, "Sub Category has been added successfully", subCategory, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, hi_name, sort_number, is_featured, is_active, category, bg_color } = req.body;
      const id = req.params.id;

      const getSubCategory = await SubCategory.findById(id);

      if (!getSubCategory) {
        return _RS.notFound(res, "NOTFOUND", "Sub Category Not Found", {}, startTime);
      }

      let isAlready = await SubCategory.findOne({
        _id: { $ne: id },
        category,
        name,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Sub Category already exist with this name", isAlready, startTime);
      }

      isAlready = await SubCategory.findOne({
        _id: { $ne: id },
        category,
        name,
        sort_number,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Sub Category already exist with this sort number", isAlready, startTime);
      }

      getSubCategory.name = name ? name : getSubCategory.name;
      getSubCategory.hi_name = hi_name ? hi_name : getSubCategory.hi_name;
      getSubCategory.sort_number = sort_number ? sort_number : getSubCategory.sort_number;
      getSubCategory.category = category ? category : getSubCategory.category;
      getSubCategory.image = image ? image : getSubCategory.image;
      getSubCategory.bg_color = bg_color ? bg_color : getSubCategory.bg_color;
      getSubCategory.is_featured = is_featured;
      getSubCategory.is_active = is_active;
      getSubCategory.save();

      if (req.user.type == UserTypes.TEACHER) {
        await changeLog(ChangeLogAction.UPDATE, `Updated Sub Category ${getSubCategory?.name}.`, req.user.id);
      }
      return _RS.api(res, true, "Sub Category has been update successfully", getSubCategory, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getSubCategory = await SubCategory.findOne({ _id: req.params.id });

      if (!getSubCategory) {
        return _RS.api(res, false, "Sub Category not found", getSubCategory, startTime);
      }

      getSubCategory.is_active = !getSubCategory.is_active;
      await getSubCategory.save();

      if (req.user.type == UserTypes.TEACHER) {
        await changeLog(ChangeLogAction.STATUS, `Changed Status Sub Category ${getSubCategory?.name}.`, req.user.id);
      }
      return _RS.api(res, true, "Sub Category Status changed successfully", getSubCategory, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getSubCategory = await SubCategory.findOne({ _id: req.params.id });

      if (!getSubCategory) {
        return _RS.api(res, true, "Sub Category not found", getSubCategory, startTime);
      }

      getSubCategory.is_delete = true;
      await getSubCategory.save();

      if (req.user.type == UserTypes.TEACHER) {
        await changeLog(ChangeLogAction.DELETE, `Deleted Sub Category ${getSubCategory?.name}.`, req.user.id);
      }
      return _RS.api(res, true, "Sub Category deleted successfully", getSubCategory, startTime);
    } catch (err) {
      next(err);
    }
  }
}
