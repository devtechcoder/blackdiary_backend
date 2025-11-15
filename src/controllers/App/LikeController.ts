import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/User";
import Like from "../../models/Likes";
import Diary from "../../models/Diary";
import Post from "../../models/Post";

export class LikeController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      let sort: any = { created_at: -1 };
      const { diary_id } = req.query;
      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 100,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = {};

      if (diary_id) filteredQuery.diary_id = mongoose.Types.ObjectId(diary_id);

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

      let myAggregate = Like.aggregate(query);
      let list = await Like.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Like List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async toggleLike(req, res, next) {
    const startTime = new Date().getTime();
    const { diary_id } = req.body;
    const user_id = req.user?._id;
    const type = req.query.type || "shayari";
    try {
      let fieldName = type === "shayari" ? "diary_id" : "post_id";
      let modalName: any = type === "shayari" ? Diary : Post;
      const diary = await modalName.findById({ _id: diary_id });
      if (!diary) {
        return _RS.notFound(res, "NOTFOUND", "Diary not found!", null, startTime);
      }

      const existingLike = await Like.findOne({ [fieldName]: diary_id, liked_by: user_id });

      if (existingLike) {
        // Unlike it
        await existingLike.deleteOne();
        diary.total_likes = Math.max(0, diary.total_likes - 1);
        await diary.save();

        return _RS.api(res, true, "unliked", { liked: false }, startTime);
      } else {
        // Like it
        await Like.create({ [fieldName]: diary_id, liked_by: user_id });
        diary.total_likes += 1;
        await diary.save();

        return _RS.api(res, true, "liked", { liked: true }, startTime);
      }
    } catch (err) {
      next(err);
    }
  }
}
