import * as mongoose from "mongoose";
import _RS from "../../helpers/ResponseHelper";
import KeywordEmotion from "../../models/KeywordEmotion";
import SubCategory from "../../models/SubCategory";
import { CATEGORY_TYPE } from "../../constants/constants";

const MAX_PAGE_SIZE = 100;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSlug = (value: any) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeStringArray = (value: any) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" && item !== null ? item?._id || item?.id || item?.value || item?.name : item))
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeStringArray(parsed);
      }
    } catch (error) {
      // ignore and fallback below
    }

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
};

const normalizeCategoryArray = (value: any) => {
  const allowedValues = Object.values(CATEGORY_TYPE);
  return Array.from(new Set(normalizeStringArray(value).filter((item) => allowedValues.includes(item))));
};

const normalizeObjectIds = (value: any) => {
  return Array.from(new Set(normalizeStringArray(value)))
    .filter((item) => mongoose.Types.ObjectId.isValid(item))
    .map((item) => new mongoose.Types.ObjectId(item));
};

const validateSubCategoryCategoryMatch = async (categories: string[], subCategoryIds: mongoose.Types.ObjectId[]) => {
  if (!subCategoryIds.length) {
    return { valid: true, message: "" };
  }

  const subCategories = await SubCategory.find({ _id: { $in: subCategoryIds }, is_delete: false }).lean();
  if (subCategories.length !== subCategoryIds.length) {
    return { valid: false, message: "One or more sub categories are invalid." };
  }

  const hasMismatch = subCategories.some((subCategory: any) => {
    const subCategoryCategories = Array.isArray(subCategory?.category) ? subCategory.category : [];
    return !subCategoryCategories.some((item) => categories.includes(item));
  });

  if (hasMismatch) {
    return { valid: false, message: "Selected sub categories must belong to the selected categories." };
  }

  return { valid: true, message: "" };
};

const validateSlug = async (slug: string, excludeId?: string) => {
  if (!slug) {
    return { valid: false, message: "Slug is required." };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return { valid: false, message: "Slug must be lowercase and can contain only letters, numbers, and hyphens." };
  }

  const query: any = { slug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await KeywordEmotion.findOne(query).lean();
  if (existing) {
    return { valid: false, message: "Slug already exists." };
  }

  return { valid: true, message: "" };
};

class KeywordEmotionController {
  static async list(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const page = Math.max(1, Number(req.query.page || 1));
      const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(req.query.pageSize || 10)));
      const categoryId = String(req.query.categoryId || "").trim();
      const subCategoryIds = Array.from(
        new Set(
          String(req.query.subCategoryIds || req.query.subCategoryId || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      ).filter((item) => mongoose.Types.ObjectId.isValid(item));
      const search = String(req.query.search || "").trim();

      const filter: any = {};

      if (categoryId) {
        filter.categories = { $in: [categoryId] };
      }

      if (subCategoryIds.length) {
        filter.sub_category_ids = { $in: subCategoryIds.map((item) => new mongoose.Types.ObjectId(item)) };
      }

      if (search) {
        const regex = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ name: { $regex: regex } }, { slug: { $regex: regex } }, { note: { $regex: regex } }];
      }

      const [docs, totalDocs] = await Promise.all([
        KeywordEmotion.find(filter)
          .sort({ created_at: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .populate({ path: "sub_category_ids", select: "_id name category is_active" })
          .lean(),
        KeywordEmotion.countDocuments(filter),
      ]);

      return res.status(200).json({
        status: 200,
        message: "Keyword Emotion List fetched successfully",
        data: {
          docs,
          totalDocs,
          page,
          limit: pageSize,
          totalPages: Math.ceil(totalDocs / pageSize) || 1,
        },
        exeTime: new Date().getTime() - startTime,
      });
    } catch (error) {
      next(error);
    }
  }

  static async add(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const name = String(req.body?.name || "").trim();
      const slug = normalizeSlug(req.body?.slug);
      const categories = normalizeCategoryArray(req.body?.categories);
      const subCategoryIds = normalizeObjectIds(req.body?.sub_category_ids);
      const is_active = req.body?.is_active === false || req.body?.is_active === "false" ? false : true;
      const note = String(req.body?.note || "").trim();

      const slugCheck = await validateSlug(slug);
      if (!slugCheck.valid) {
        return res.status(400).json({ status: 400, message: slugCheck.message });
      }

      const match = await validateSubCategoryCategoryMatch(categories, subCategoryIds);
      if (!match.valid) {
        return res.status(400).json({ status: 400, message: match.message });
      }

      const record = await KeywordEmotion.create({
        name,
        slug,
        categories,
        sub_category_ids: subCategoryIds,
        is_active,
        note,
      });

      return res.status(200).json({
        status: 200,
        message: "Keyword Emotion has been added successfully",
        data: record,
        exeTime: new Date().getTime() - startTime,
      });
    } catch (error) {
      next(error);
    }
  }

  static async edit(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const id = req.params.id;
      const record = await KeywordEmotion.findById(id);

      if (!record) {
        return res.status(404).json({ status: 404, message: "Keyword Emotion not found" });
      }

      const name = String(req.body?.name || record.name || "").trim();
      const hasSlugInput = req.body?.slug !== undefined;
      const incomingSlug = hasSlugInput ? normalizeSlug(req.body?.slug) : undefined;
      const slug = hasSlugInput ? incomingSlug : record.slug;
      const categories = req.body?.categories !== undefined ? normalizeCategoryArray(req.body?.categories) : record.categories;
      const subCategoryIds = req.body?.sub_category_ids !== undefined ? normalizeObjectIds(req.body?.sub_category_ids) : record.sub_category_ids || [];
      const note = req.body?.note !== undefined ? String(req.body?.note || "").trim() : record.note;
      const is_active = req.body?.is_active !== undefined ? !(req.body?.is_active === false || req.body?.is_active === "false") : record.is_active;

      if (hasSlugInput && !incomingSlug) {
        return res.status(400).json({ status: 400, message: "Slug is required." });
      }

      if (incomingSlug !== undefined) {
        const slugCheck = await validateSlug(slug, id);
        if (!slugCheck.valid) {
          return res.status(400).json({ status: 400, message: slugCheck.message });
        }
      }

      const match = await validateSubCategoryCategoryMatch(categories, subCategoryIds);
      if (!match.valid) {
        return res.status(400).json({ status: 400, message: match.message });
      }

      record.name = name;
      if (slug !== undefined && slug !== null) {
        record.slug = slug;
      }
      record.categories = categories;
      record.sub_category_ids = subCategoryIds;
      record.note = note;
      record.is_active = is_active;
      await record.save();

      return res.status(200).json({
        status: 200,
        message: "Keyword Emotion has been updated successfully",
        data: record,
        exeTime: new Date().getTime() - startTime,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const record = await KeywordEmotion.findById(req.params.id);

      if (!record) {
        return res.status(404).json({ status: 404, message: "Keyword Emotion not found" });
      }

      await KeywordEmotion.deleteOne({ _id: req.params.id });

      return res.status(200).json({
        status: 200,
        message: "Keyword Emotion has been deleted successfully",
        data: record,
        exeTime: new Date().getTime() - startTime,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default KeywordEmotionController;
