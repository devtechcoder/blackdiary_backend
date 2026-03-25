import _RS from "../../helpers/ResponseHelper";
import Faq from "../../models/Faq";

export class FaqController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const sort: any = { priority: 1, created_at: -1 };
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
        filteredQuery.question = {
          $regex: new RegExp(search, "i"),
        };
      }

      if (req.query.status) {
        const arrayValues = req.query.status.split(",");
        const booleanValues = arrayValues.map((value) => value.toLowerCase() === "true");
        filteredQuery.is_active = { $in: booleanValues };
      }

      const query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: sort,
        },
      ];

      const aggregate = Faq.aggregate(query);
      const list = await Faq.aggregatePaginate(aggregate, options);

      return _RS.api(res, true, "FAQ list fetch successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async details(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const faq = await Faq.findById(req.params.id);

      if (!faq) {
        return _RS.api(res, false, "FAQ not found", {}, startTime);
      }

      return _RS.api(res, true, "FAQ details fetch successfully", faq, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { question, answer, is_active, priority } = req.body;

      if (!priority) {
        return _RS.api(res, false, "Priority is required", {}, startTime);
      }

      const data = await new Faq({
        question: question?.trim(),
        answer,
        priority: Number(priority),
        is_active,
      }).save();

      return _RS.api(res, true, "FAQ has been added successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const { question, answer, is_active, priority } = req.body;
      const faq = await Faq.findById(req.params.id);

      if (!faq) {
        return _RS.api(res, false, "FAQ not found", {}, startTime);
      }

      if (!priority) {
        return _RS.api(res, false, "Priority is required", {}, startTime);
      }

      faq.question = question?.trim() ? question.trim() : faq.question;
      faq.answer = answer ? answer : faq.answer;
      faq.priority = Number(priority);
      faq.is_active = typeof is_active === "boolean" ? is_active : faq.is_active;
      await faq.save();

      return _RS.api(res, true, "FAQ has been update successfully", faq, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async statusChange(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const faq = await Faq.findById(req.params.id);

      if (!faq) {
        return _RS.api(res, false, "FAQ not found", {}, startTime);
      }

      faq.is_active = !faq.is_active;
      await faq.save();

      return _RS.api(res, true, "FAQ status changed successfully", faq, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const faq = await Faq.findById(req.params.id);

      if (!faq) {
        return _RS.api(res, false, "FAQ not found", {}, startTime);
      }

      await Faq.deleteOne({ _id: faq._id });

      return _RS.api(res, true, "FAQ deleted successfully", faq, startTime);
    } catch (err) {
      next(err);
    }
  }
}
