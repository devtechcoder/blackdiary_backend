import _RS from "../../helpers/ResponseHelper";
import { getCurrentTime } from "../../helpers/function";
import Seo from "../../models/Seo";

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const sort: any = { created_at: -1 };
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
          { page_key: { $regex: search, $options: "i" } },
          { section: { $regex: search, $options: "i" } },
          { "primary.title": { $regex: search, $options: "i" } },
          { "openGraph.title": { $regex: search, $options: "i" } },
          { "twitter.title": { $regex: search, $options: "i" } },
        ];
      }

      const query: any = [{ $match: filteredQuery }, { $sort: sort }];
      const myAggregate = Seo.aggregate(query);
      const list = await Seo.aggregatePaginate(myAggregate, options);

      return _RS.api(res, true, "SEO list fetched successfully", list, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const { section = "page", page_key, primary = {}, openGraph = {}, twitter = {}, common = {} } = req.body;

      const existing = await Seo.findOne({ page_key: page_key?.trim() });
      if (existing) {
        return _RS.api(res, false, "SEO page key already exists", {}, startTime);
      }

      await new Seo({
        section,
        page_key: page_key?.trim(),
        primary,
        openGraph,
        twitter,
        common,
      }).save();

      return _RS.api(res, true, "SEO has been added successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const id = req.params.id;
      const { section = "page", page_key, primary = {}, openGraph = {}, twitter = {}, common = {} } = req.body;

      const getData = await Seo.findById(id);
      if (!getData) {
        return _RS.api(res, false, "SEO not found!", {}, startTime);
      }

      if (page_key && page_key.trim() !== getData.page_key) {
        const existing = await Seo.findOne({ page_key: page_key.trim(), _id: { $ne: id } });
        if (existing) {
          return _RS.api(res, false, "SEO page key already exists", {}, startTime);
        }
      }

      getData.section = section || getData.section;
      getData.page_key = page_key?.trim() || getData.page_key;
      getData.primary = primary || getData.primary;
      getData.openGraph = openGraph || getData.openGraph;
      getData.twitter = twitter || getData.twitter;
      getData.common = common || getData.common;
      await getData.save();

      return _RS.api(res, true, "SEO has been updated successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const getData = await Seo.findById(req.params.id);

      if (!getData) {
        return _RS.api(res, false, "SEO not found!", {}, startTime);
      }

      await getData.remove();
      return _RS.api(res, true, "SEO deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
