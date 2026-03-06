import _RS from "../../helpers/ResponseHelper";
import { getCurrentTime } from "../../helpers/function";
import Enquiry, { EnquiryStatuses } from "../../models/Enquiry";

export class EnquiryController {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const sort: any = { createdAt: -1 };
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
        filteredQuery.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { message: { $regex: search, $options: "i" } }];
      }

      if (req.query.status && req.query.status.trim()) {
        const statuses = req.query.status
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter((item) => Object.values(EnquiryStatuses).includes(item));

        if (statuses.length) {
          filteredQuery.status = { $in: statuses };
        }
      }

      const query: any = [{ $match: filteredQuery }, { $sort: sort }];
      const myAggregate = Enquiry.aggregate(query);
      const list = await Enquiry.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "Enquiry list fetched successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async details(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const enquiry = await Enquiry.findById(req.params.id);

      if (!enquiry) {
        return _RS.api(res, false, "Enquiry not found", {}, startTime);
      }

      return _RS.api(res, true, "Enquiry details fetched successfully", enquiry, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { status } = req.body;

      const enquiry = await Enquiry.findById(req.params.id);
      if (!enquiry) {
        return _RS.api(res, false, "Enquiry not found", {}, startTime);
      }

      enquiry.status = status;
      await enquiry.save();

      return _RS.api(res, true, "Enquiry status updated successfully", enquiry, startTime);
    } catch (err) {
      next(err);
    }
  }
}
