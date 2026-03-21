import _RS from "../helpers/ResponseHelper";
import { getCurrentTime } from "../helpers/function";
import Seo from "../models/Seo";

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
      const data = await Seo.find({}).sort({ updatedAt: -1 });
      return _RS.api(res, true, "SEO list fetched successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async getBySlug(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const slug = normalizeSlug(req.params.slug);
      const data = await Seo.findOne({ slug });

      if (!data) {
        return _RS.api(res, false, "SEO not found!", null, startTime);
      }

      return _RS.api(res, true, "SEO fetched successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
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

  static async update(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const payload = getSeoPayload(req.body);
      const id = req.params.id;
      const existingSeo = await Seo.findById(id);

      if (!existingSeo) {
        return _RS.api(res, false, "SEO not found!", {}, startTime);
      }

      if (existingSeo.slug !== payload.slug) {
        const duplicateSeo = await Seo.findOne({ slug: payload.slug, _id: { $ne: id } });
        if (duplicateSeo) {
          return _RS.api(res, false, "SEO slug already exists", {}, startTime);
        }
      }

      existingSeo.slug = payload.slug;
      existingSeo.primary = payload.primary;
      existingSeo.openGraph = payload.openGraph;
      existingSeo.twitter = payload.twitter;
      existingSeo.common = payload.common;
      await existingSeo.save();

      return _RS.api(res, true, "SEO has been updated successfully!", existingSeo, startTime);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = getCurrentTime();
      const existingSeo = await Seo.findById(req.params.id);

      if (!existingSeo) {
        return _RS.api(res, false, "SEO not found!", {}, startTime);
      }

      await existingSeo.remove();
      return _RS.api(res, true, "SEO deleted successfully!", {}, startTime);
    } catch (err) {
      next(err);
    }
  }
}
