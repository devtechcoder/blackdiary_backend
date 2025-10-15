import * as mongoose from "mongoose";

import _RS from "../../helpers/ResponseHelper";
import Category from "../../models/Category";
import SubCategory from "../../models/SubCategory";
import { ADDED_BY_TYPES } from "../../constants/constants";
import User, { UserTypes } from "../../models/User";

export class CategoryController {
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

      let myAggregate = Category.aggregate(query);
      let list = await Category.aggregatePaginate(myAggregate, options);

      const sdata = await Promise.all(
        list.docs.map(async (item) => {
          const haveItem = await SubCategory.findOne({
            category_id: item._id,
            is_delete: false,
          });
          return {
            ...item,
            have_item: haveItem ? true : false,
          };
        })
      );

      const adata = await Promise.all(
        sdata.map(async (item) => {
          const haveActiveItem = await SubCategory.findOne({
            category_id: item._id,
            is_delete: false,
            is_active: true,
          });
          return {
            ...item,
            have_active_item: haveActiveItem ? true : false,
          };
        })
      );

      list = { ...list, docs: adata };

      return _RS.api(res, true, "Category List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, hi_name, sort_number, is_active, is_featured } = req.body;
      let getData = await Category.findOne({
        name: name,
        is_delete: false,
      });

      if (getData) {
        return _RS.api(res, false, "Category already exist with this email", {}, startTime);
      }

      getData = await Category.findOne({
        sort_number,
        is_delete: false,
      });

      if (getData) {
        return _RS.api(res, false, "Category already exist with this sorting number!", {}, startTime);
      }

      const data = await new Category({
        image,
        name,
        hi_name,
        sort_number,
        is_active,
        is_featured,
        added_by: ADDED_BY_TYPES.ADMIN,
      }).save();

      return _RS.api(res, true, "Category has been added successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { image, name, hi_name, sort_number, is_active, is_featured } = req.body;
      const id = req.params.id;

      const getData = await Category.findById(id);

      if (!getData) {
        return _RS.api(res, false, "Category Not Found", {}, startTime);
      }

      let isAlready = await Category.findOne({
        _id: { $ne: id },
        name: name,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Category already exist with this email", {}, startTime);
      }

      isAlready = await Category.findOne({
        _id: { $ne: id },
        sort_number,
        is_delete: false,
      });

      if (isAlready) {
        return _RS.api(res, false, "Category already exist with this sorting number!", {}, startTime);
      }

      getData.name = name ? name : getData.name;
      getData.hi_name = hi_name ? hi_name : getData.hi_name;
      getData.sort_number = sort_number ? sort_number : getData.sort_number;
      getData.image = image ? image : getData.image;
      getData.is_active = is_active;
      getData.is_featured = is_featured;
      getData.save();

      return _RS.api(res, true, "Category has been update successfully", getData, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getCategory = await Category.findOne({ _id: req.params.id });

      if (!getCategory) {
        return _RS.api(res, false, "Category not found", getCategory, startTime);
      }

      getCategory.is_active = !getCategory.is_active;
      await getCategory.save();

      return _RS.api(res, true, "Category Status changed successfully", getCategory, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const startTime = new Date().getTime();

      const getCategory = await Category.findOne({ _id: req.params.id });

      if (!getCategory) {
        return _RS.api(res, false, "Category not found", {}, startTime);
      }

      getCategory.is_delete = true;
      await getCategory.save();

      return _RS.api(res, true, "Category deleted successfully", getCategory, startTime);
    } catch (err) {
      next(err);
    }
  }
}
