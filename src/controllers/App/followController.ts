import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/User";
import Follow from "../../models/Follow";

export default class FollowController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      let sort: any = { created_at: -1 };
      const { type } = req.query;
      const user_id = req.params.id;
      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 100,
        collation: {
          locale: "en",
        },
      };

      let filteredQuery: any = {};
      let lookupField = "";

      if (type === "follower") {
        filteredQuery.following = mongoose.Types.ObjectId(user_id);
        lookupField = "follower";
      } else if (type === "following") {
        filteredQuery.follower = mongoose.Types.ObjectId(user_id);
        lookupField = "following";
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
            localField: lookupField,
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $replaceRoot: { newRoot: "$user" },
        },
      ];

      if (req.query.search && req.query.search.trim()) {
        const searchRegex = new RegExp(req.query.search, "i");
        query.push({
          $match: {
            $or: [{ name: searchRegex }, { user_name: searchRegex }],
          },
        });
      }

      query.push({
        $project: {
          name: 1,
          image: 1,
          user_name: 1,
          profile_image: 1,
        },
      });

      query.push({
        $sort: sort,
      });

      let myAggregate = Follow.aggregate(query);
      let list = await Follow.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Follow List fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async toggleFollow(req, res, next) {
    const startTime = new Date().getTime();
    const { following_id } = req.body;
    const user_id = req.user?._id;

    try {
      const getUser = await User.findOne({ _id: mongoose.Types.ObjectId(following_id) });
      if (!getUser) {
        return _RS.api(res, false, "User to follow not found", {}, startTime);
      }
      if (following_id.toString() === user_id.toString()) {
        return _RS.api(res, false, "You can't follow yourself", {}, startTime);
      }
      const existingFollower = await Follow.findOne({ follower: user_id, following: mongoose.Types.ObjectId(following_id) });
      if (existingFollower) {
        // Un-Follow it
        await existingFollower.deleteOne();

        return _RS.api(res, true, "Unfollowed", {}, startTime);
      } else {
        // Follow it
        const create = await Follow.create({ follower: user_id, following: following_id });
        return _RS.api(res, true, "Followed", {}, startTime);
      }
    } catch (err) {
      next(err);
    }
  }
}
