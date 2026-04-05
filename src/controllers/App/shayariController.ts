import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import Diary from "../../models/Diary";

class ShayariController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { category, sub_category_id, occasion_id, author } = req.query;
      let sort: any = { created_at: -1 };

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = { is_delete: false, is_active: true };

      if (category) {
        filteredQuery.category = category;
      }

      if (sub_category_id) {
        filteredQuery.sub_category_id = {
          $in: [mongoose.Types.ObjectId(sub_category_id)],
        };
      }

      if (occasion_id) {
        filteredQuery.occasion_ids = {
          $in: [mongoose.Types.ObjectId(occasion_id)],
        };
      }

      if (author) {
        filteredQuery.author = mongoose.Types.ObjectId(author);
      }

      if (req.query.search && req.query.search.trim()) {
        const value = new RegExp(req.query.search);
        filteredQuery.$or = [
          {
            title: {
              $regex: value,
              $options: "i",
            },
            hi_title: {
              $regex: value,
              $options: "i",
            },
            content: {
              $regex: value,
              $options: "i",
            },
            hi_content: {
              $regex: value,
              $options: "i",
            },
          },
        ];
      }
      const userId = req.user.id;

      let query: any = [
        {
          $match: filteredQuery,
        },
        {
          $lookup: {
            from: "likes", // Assuming 'likes' is your collection name for likes
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$diary_id", "$$postId"] }, { $eq: ["$liked_by", mongoose.Types.ObjectId(userId)] }],
                  },
                },
              },
            ],
            as: "userLike",
          },
        },
        {
          $addFields: { is_liked: { $gt: [{ $size: "$userLike" }, 0] } },
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
            from: "follows", // Assuming 'follows' is your collection name
            let: { authorId: "$author._id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$following", "$$authorId"] }, { $eq: ["$follower", mongoose.Types.ObjectId(userId)] }],
                  },
                },
              },
            ],
            as: "userFollow",
          },
        },
        {
          $addFields: { is_follow: { $gt: [{ $size: "$userFollow" }, 0] } },
        },
        {
          $addFields: {
            is_own_post: { $eq: ["$author._id", mongoose.Types.ObjectId(userId)] },
          },
        },
        {
          $sort: sort,
        },
        { $project: { userLike: 0, userFollow: 0 } }, // Clean up by removing the temporary arrays
      ];

      let myAggregate = Diary.aggregate(query);
      let list = await Diary.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Shayari List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }
}

export default ShayariController;
