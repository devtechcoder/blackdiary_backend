import _RS from "../../helpers/ResponseHelper";
import Faq from "../../models/Faq";

export class FaqController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const sort: any = { priority: 1, created_at: -1 };
      const page = Number(req.query.page || 1);
      const pageSize = Number(req.query.pageSize || 100);
      const options = {
        page,
        limit: pageSize,
        collation: {
          locale: "en",
        },
      };

      const filteredQuery: any = {
        is_active: true,
      };

      if (req.query.search && req.query.search.trim()) {
        const search = req.query.search.trim();
        filteredQuery.question = {
          $regex: new RegExp(search, "i"),
        };
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
}
