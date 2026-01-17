import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/User";
import Comment from "../../models/Comment";
import Content from "../../models/Content";

export default class CommentController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      let sort: any = { created_at: -1 };
      const { type } = req.query;
      const feedId = req.params.id;
      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 100,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = {};
      let lookupField = "";
      if (type === "post") {
        filteredQuery.post_id = mongoose.Types.ObjectId(feedId);
        lookupField = "post_id";
      } else if (type === "shayari") {
        filteredQuery.diary_id = mongoose.Types.ObjectId(feedId);
        lookupField = "diary_id";
      } else {
        return _RS.api(res, false, "Invalid type parameter", {}, startTime);
      }

      let query: any = [
        {
          $match: filteredQuery,
        },
        {
          $lookup: {
            from: "users",
            localField: "comment_by",
            foreignField: "_id",
            as: "commenter",
          },
        },
        {
          $unwind: { path: "$commenter", preserveNullAndEmptyArrays: true },
        },
        {
          $sort: sort,
        },
        {
          $project: {
            text: 1,
            created_at: 1,
            "commenter.name": 1,
            "commenter.user_name": 1,
            "commenter.image": 1,
            "commenter._id": 1,
          },
        },
      ];

      let myAggregate = Comment.aggregate(query);
      let list = await Comment.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Comment List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async addComment(req, res, next) {
    const startTime = new Date().getTime();
    const { post_id, text, diary_id } = req.body;
    const user_id = req.user._id;

    try {
      const createComment = new Comment({
        text: text,
        comment_by: user_id,
        diary_id: diary_id || null,
        post_id: post_id || null,
      });

      await createComment.save();

      return _RS.api(res, true, "Comment added!", createComment, startTime);
    } catch (err) {
      next(err);
    }
  }
}
