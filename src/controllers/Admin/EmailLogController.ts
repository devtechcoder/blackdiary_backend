import _RS from "../../helpers/ResponseHelper";
import { getCurrentTime } from "../../helpers/function";
import EmailLog from "../../models/EmailLog";

const normalizeString = (value: any) => (typeof value === "string" ? value.trim() : "");

const parseDateRange = (startDate: any, endDate: any) => {
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return {
    $gte: start,
    $lte: end,
  };
};

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
      const search = normalizeString(req.query.search);
      const status = normalizeString(req.query.status).toUpperCase();
      const slug = normalizeString(req.query.slug);
      const email = normalizeString(req.query.email);
      const sentAtRange = parseDateRange(req.query.start_date, req.query.end_date);

      if (search) {
        filteredQuery.$or = [
          { to: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { slug: { $regex: search, $options: "i" } },
          { response: { $regex: search, $options: "i" } },
        ];
      }

      if (status && ["SUCCESS", "FAILED"].includes(status)) {
        filteredQuery.status = status;
      }

      if (slug) {
        filteredQuery.slug = { $regex: slug, $options: "i" };
      }

      if (email) {
        filteredQuery.to = { $regex: email, $options: "i" };
      }

      if (sentAtRange) {
        filteredQuery.sentAt = sentAtRange;
      }

      const query: any = [
        {
          $match: filteredQuery,
        },
        {
          $sort: {
            sentAt: -1,
          },
        },
      ];

      const aggregate = EmailLog.aggregate(query);
      const list = await EmailLog.aggregatePaginate(aggregate, options);

      return _RS.api(res, true, "Email logs fetched successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async details(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const log = await EmailLog.findById(req.params.id);

      if (!log) {
        return _RS.api(res, false, "Email log not found", {}, startTime);
      }

      return _RS.api(res, true, "Email log fetched successfully", log, startTime);
    } catch (err) {
      next(err);
    }
  }
}
