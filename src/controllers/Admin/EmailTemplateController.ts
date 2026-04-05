import _RS from "../../helpers/ResponseHelper";
import { getCurrentTime } from "../../helpers/function";
import Model from "../../models/EmailTemplate";

const normalizeValue = (value: any) => (typeof value === "string" ? value.trim() : value);

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();

      const options = {
        page: req.query.page || 1,
        limit: req.query.pageSize || 20,
        collation: {
          locale: "en",
        },
      };

      const filteredQuery: any = {};

      if (req.query.search && req.query.search.trim()) {
        const search = req.query.search.trim();

        filteredQuery.$or = [
          {
            name: { $regex: search, $options: "i" },
          },
          {
            slug: { $regex: search, $options: "i" },
          },
          {
            subject: { $regex: search, $options: "i" },
          },
        ];
      }

      const query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: {
            created_at: -1,
          },
        },
      ];

      const aggregate = Model.aggregate(query);
      const list = await Model.aggregatePaginate(aggregate, options);

      return _RS.api(res, true, "Email template list fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async view(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const data = await Model.findById(req.params.id);

      if (!data) {
        return _RS.api(res, false, "Email template not found", {}, startTime);
      }

      return _RS.api(res, true, "Email template fetch successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const name = normalizeValue(req.body.name);
      const slug = normalizeValue(req.body.slug);
      const subject = normalizeValue(req.body.subject);
      const description = req.body.description;

      const existing = await Model.findOne({ slug });
      if (existing) {
        return _RS.api(res, false, "Email template slug already exists", {}, startTime);
      }

      await new Model({
        name,
        slug,
        subject,
        description,
      }).save();

      return _RS.api(res, true, "Email template has been added successfully!", {}, startTime);
    } catch (err) {
      if (err?.code === 11000) {
        return _RS.api(res, false, "Email template slug already exists", {}, getCurrentTime());
      }
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const id = req.params.id;
      const name = normalizeValue(req.body.name);
      const slug = normalizeValue(req.body.slug);
      const subject = normalizeValue(req.body.subject);
      const description = req.body.description;

      const data = await Model.findById(id);

      if (!data) {
        return _RS.api(res, false, "Email template not found", {}, startTime);
      }

      const existing = await Model.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return _RS.api(res, false, "Email template slug already exists", {}, startTime);
      }

      data.name = name || data.name;
      data.slug = slug || data.slug;
      data.subject = subject || data.subject;
      data.description = description ? description : data.description;

      await data.save();

      return _RS.api(res, true, "Email template has been update successfully!", {}, startTime);
    } catch (err) {
      if (err?.code === 11000) {
        return _RS.api(res, false, "Email template slug already exists", {}, getCurrentTime());
      }
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const data = await Model.findById(req.params.id);

      if (!data) {
        return _RS.api(res, false, "Email template not found", {}, startTime);
      }

      await data.remove();

      return _RS.api(res, true, "Email template deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
