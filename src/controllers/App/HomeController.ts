import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Diary from "../../models/Diary";
import User from "../../models/User";
import Occasion from "../../models/Occasion";
import SubCategory from "../../models/SubCategory";
import Likes from "../../models/Likes";

export class HomeController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const userId = req.user.id || null;
      let filteredQuery: any = { is_delete: false };

      if (req.query.search && req.query.search.trim()) {
        filteredQuery.$or = [
          { title: { $regex: new RegExp(req.query.search), $options: "i" } },
          { content: { $regex: new RegExp(req.query.search), $options: "i" } },
          { hi_content: { $regex: new RegExp(req.query.search), $options: "i" } },
        ];
      }

      if (req.query.status) {
        var arrayValues = req.query.status.split(",");
        var booleanValues = arrayValues.map((value) => value.toLowerCase() === "true");
        filteredQuery.is_active = { $in: booleanValues };
      }

      // --- Now Promise.all to fetch all in parallel
      const [trendingDiary, recentlyViewDiary, occasions, topPoets, topDiary, likedDiary, subCategories] = await Promise.all([
        Diary.find({ ...filteredQuery })
          .sort({ created_at: -1 })
          .limit(20),
        Diary.find({ ...filteredQuery })
          .sort({ created_at: -1 })
          .limit(20),
        Occasion.find({ ...filteredQuery })
          .sort({ created_at: -1 })
          .limit(20),
        User.find({ is_delete: false, is_active: true }).sort({ created_at: -1 }).limit(20),

        Diary.find({ ...filteredQuery })
          .sort({ rating: -1 })
          .limit(20),
        userId
          ? Likes.find({ user_id: userId })
              .distinct("diary_id")
              .then((likedIds) =>
                Diary.find({ ...filteredQuery, _id: { $in: likedIds } })
                  .sort({ created_at: -1 })
                  .limit(20)
              )
          : Promise.resolve([]),
        SubCategory.find({ ...filteredQuery })
          .sort({ created_at: -1 })
          .limit(20),
      ]);

      const result = {
        trendingDiary,
        recentlyViewDiary,
        occasions,
        topPoets,
        topDiary,
        likedDiary,
        subCategories,
      };

      return _RS.api(res, true, "Diary Data fetched successfully", result, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async topDiary(req, res, next) {
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
            hi_name: {
              $regex: new RegExp(req.query.search),
              $options: "i",
            },
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

      let myAggregate = Diary.aggregate(query);
      let list = await Diary.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Top Diary List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }
}
