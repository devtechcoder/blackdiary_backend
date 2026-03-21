import _RS from "../../helpers/ResponseHelper";
import { getCurrentTime } from "../../helpers/function";
import Seo from "../../models/Seo";

const normalizeSlug = (value?: string) => {
  const rawValue = (value || "/").trim();
  if (!rawValue || rawValue === "/") {
    return "/";
  }

  const sanitized = rawValue.replace(/\/+/g, "/").replace(/^\/?/, "/").replace(/\/$/, "");
  return sanitized || "/";
};

const getSeoPayload = (body: any = {}) => ({
  slug: normalizeSlug(body.slug),
  primary: body.primary || {},
  openGraph: body.openGraph || {},
  twitter: body.twitter || {},
  common: body.common || {},
});

export class Controller {
  static async list(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const sort: any = { updatedAt: -1 };
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
          { slug: { $regex: search, $options: "i" } },
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
      const payload = getSeoPayload(req.body);

      const existing = await Seo.findOne({ slug: payload.slug });
      if (existing) {
        return _RS.api(res, false, "SEO slug already exists", {}, startTime);
      }

      const createdSeo = await new Seo(payload).save();

      return _RS.api(res, true, "SEO has been added successfully!", createdSeo, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const id = req.params.id;
      const payload = getSeoPayload(req.body);

      const getData = await Seo.findById(id);
      if (!getData) {
        return _RS.api(res, false, "SEO not found!", {}, startTime);
      }

      if (payload.slug !== getData.slug) {
        const existing = await Seo.findOne({ slug: payload.slug, _id: { $ne: id } });
        if (existing) {
          return _RS.api(res, false, "SEO slug already exists", {}, startTime);
        }
      }

      getData.slug = payload.slug;
      getData.primary = payload.primary;
      getData.openGraph = payload.openGraph;
      getData.twitter = payload.twitter;
      getData.common = payload.common;
      await getData.save();

      return _RS.api(res, true, "SEO has been updated successfully!", getData, startTime);
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
