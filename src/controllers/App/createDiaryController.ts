import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import User from "../../models/User";
import Diary from "../../models/Diary";
import Post from "../../models/Post";
import { ADDED_BY_TYPES } from "../../constants/constants";

class CreateDiaryController {
  static async publish(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { type, image, occasion_ids, category, sub_category_id, author, content, is_active } = req.body;

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

      return _RS.api(res, true, "Published successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}

export default CreateDiaryController;
