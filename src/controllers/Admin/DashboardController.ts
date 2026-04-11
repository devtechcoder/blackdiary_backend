import * as mongoose from "mongoose";
import * as moment from "moment";
import _RS from "../../helpers/ResponseHelper";
import User, { UserTypes } from "../../models/User";
import Category from "../../models/Category";
import SubCategory from "../../models/SubCategory";
import KeywordEmotion from "../../models/KeywordEmotion";
import Diary from "../../models/Diary";
import Post from "../../models/Post";
import LoginActivity from "../../models/LoginActivity";

const DEFAULT_RANGE = 30;

const normalizeRange = (value: any) => {
  const parsed = parseInt(String(value ?? DEFAULT_RANGE), 10);
  return parsed === 7 || parsed === 30 ? parsed : DEFAULT_RANGE;
};

const buildDateBuckets = (range: number) => {
  const start = moment().subtract(range - 1, "days").startOf("day");

  return Array.from({ length: range }).map((_, index) => {
    const current = moment(start).add(index, "days");

    return {
      key: current.format("YYYY-MM-DD"),
      label: current.format("DD MMM"),
    };
  });
};

const mergeDailyCounts = (buckets: Array<{ key: string; label: string }>, ...groups: any[][]) => {
  const countMap = new Map<string, number>();

  groups.flat().forEach((item) => {
    const key = String(item?._id || item?.day || item?.date || "");
    if (!key) return;

    countMap.set(key, (countMap.get(key) || 0) + Number(item?.count || 0));
  });

  return buckets.map((bucket) => ({
    date: bucket.key,
    label: bucket.label,
    count: countMap.get(bucket.key) || 0,
  }));
};

const normalizeCategoryLabel = (value: any) => {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "shayri" || normalized === "shayari") {
    return "Shayari";
  }

  if (normalized === "sher") {
    return "Sher";
  }

  return "Others";
};

const buildSnippet = (value: any, fallback: string) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;

  return text.length > 96 ? `${text.slice(0, 96)}...` : text;
};

const aggregateDailyCounts = async (Model: any, matchQuery: any) => {
  return Model.aggregate([
    {
      $match: matchQuery,
    },
    {
      $project: {
        day: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$created_at",
          },
        },
      },
    },
    {
      $group: {
        _id: "$day",
        count: { $sum: 1 },
      },
    },
  ]);
};

const aggregateCategoryCounts = async (Model: any, matchQuery: any) => {
  return Model.aggregate([
    {
      $match: matchQuery,
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);
};

const aggregateKeywordUsage = async (Model: any, keywordField: string) => {
  return Model.aggregate([
    {
      $match: {
        is_delete: false,
      },
    },
    {
      $unwind: {
        path: `$${keywordField}`,
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $group: {
        _id: `$${keywordField}`,
        usageCount: { $sum: 1 },
        lastUsedAt: { $max: "$created_at" },
      },
    },
  ]);
};

const aggregateTrendingPosts = async (Model: any, likeField: "diary_id" | "post_id", sourceType: string) => {
  return Model.aggregate([
    {
      $match: {
        is_delete: false,
      },
    },
    {
      $lookup: {
        from: "likes",
        let: { recordId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [`$${likeField}`, "$$recordId"],
              },
            },
          },
        ],
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        sourceType,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        likesCount: -1,
        created_at: -1,
      },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        likes: 0,
      },
    },
  ]);
};

const buildRecordCard = (item: any, fallbackType: string) => {
  const categoryLabel = normalizeCategoryLabel(item?.category);
  const summary = buildSnippet(
    item?.content || item?.hi_content || item?.title || item?.hi_title,
    item?.image ? "Image post" : "Post"
  );

  return {
    ...item,
    categoryLabel,
    typeLabel: categoryLabel !== "Others" ? categoryLabel : fallbackType,
    title: summary,
    summary,
  };
};

export class DashboardController {
  static async dashboardData(req, res, next) {
    try {
      const startTime = new Date().getTime();
      const range = normalizeRange(req.query?.range);
      const startDate = moment().subtract(range - 1, "days").startOf("day").toDate();
      const todayStart = moment().startOf("day").toDate();
      const todayEnd = moment().endOf("day").toDate();
      const dateBuckets = buildDateBuckets(range);

      const userMatch = {
        is_delete: false,
        type: UserTypes.CUSTOMER,
      };

      const contentMatch = {
        is_delete: false,
      };

      const [
        totalUsers,
        activeUsers,
        totalCategories,
        totalSubCategories,
        totalKeywords,
        diaryTotal,
        postTotal,
        diaryPostsToday,
        postPostsToday,
        diaryGrowth,
        postGrowth,
        userGrowth,
        diaryCategoryCounts,
        postCategoryCounts,
        diaryKeywordUsage,
        postKeywordUsage,
        trendingDiaryPosts,
        trendingSherPosts,
        recentDiaryPosts,
        recentSherPosts,
        recentUsers,
        recentLoginActivities,
      ] = await Promise.all([
        User.countDocuments(userMatch),
        User.countDocuments({ ...userMatch, is_active: true }),
        Category.countDocuments({ is_delete: false }),
        SubCategory.countDocuments({ is_delete: false }),
        KeywordEmotion.countDocuments({}),
        Diary.countDocuments(contentMatch),
        Post.countDocuments(contentMatch),
        Diary.countDocuments({ ...contentMatch, created_at: { $gte: todayStart, $lte: todayEnd } }),
        Post.countDocuments({ ...contentMatch, created_at: { $gte: todayStart, $lte: todayEnd } }),
        aggregateDailyCounts(Diary, { ...contentMatch, created_at: { $gte: startDate } }),
        aggregateDailyCounts(Post, { ...contentMatch, created_at: { $gte: startDate } }),
        aggregateDailyCounts(User, { ...userMatch, created_at: { $gte: startDate } }),
        aggregateCategoryCounts(Diary, contentMatch),
        aggregateCategoryCounts(Post, contentMatch),
        aggregateKeywordUsage(Diary, "keywords"),
        aggregateKeywordUsage(Post, "keywords"),
        aggregateTrendingPosts(Diary, "diary_id", "Shayari"),
        aggregateTrendingPosts(Post, "post_id", "Sher"),
        Diary.find(contentMatch).sort({ created_at: -1 }).limit(5).populate("author", "_id name user_name image").lean(),
        Post.find(contentMatch).sort({ created_at: -1 }).limit(5).populate("author", "_id name user_name image").lean(),
        User.find(userMatch).sort({ created_at: -1 }).limit(5).lean(),
        LoginActivity.find({})
          .sort({ loginAt: -1, created_at: -1 })
          .limit(5)
          .populate("userId", "_id name user_name email image")
          .lean(),
      ]);

      const postGrowthSeries = mergeDailyCounts(dateBuckets, diaryGrowth, postGrowth);
      const userGrowthSeries = mergeDailyCounts(dateBuckets, userGrowth);

      const categoryTotals = {
        Shayari: 0,
        Sher: 0,
        Others: 0,
      };

      [...diaryCategoryCounts, ...postCategoryCounts].forEach((item: any) => {
        const bucket = normalizeCategoryLabel(item?._id);
        categoryTotals[bucket] += Number(item?.count || 0);
      });

      const keywordUsageMap = new Map<string, { usageCount: number; lastUsedAt: string | Date | null }>();

      [...(diaryKeywordUsage || []), ...(postKeywordUsage || [])].forEach((item: any) => {
        const keywordId = String(item?._id || "");
        if (!keywordId) return;

        const existing = keywordUsageMap.get(keywordId) || { usageCount: 0, lastUsedAt: null };
        const incomingLastUsedAt = item?.lastUsedAt ? new Date(item.lastUsedAt) : null;
        const currentLastUsedAt = existing.lastUsedAt ? new Date(existing.lastUsedAt) : null;
        const lastUsedAt =
          incomingLastUsedAt && currentLastUsedAt
            ? incomingLastUsedAt > currentLastUsedAt
              ? incomingLastUsedAt
              : currentLastUsedAt
            : incomingLastUsedAt || currentLastUsedAt;

        keywordUsageMap.set(keywordId, {
          usageCount: existing.usageCount + Number(item?.usageCount || 0),
          lastUsedAt,
        });
      });

      const usedKeywordIds = Array.from(keywordUsageMap.keys()).filter((id) => mongoose.Types.ObjectId.isValid(id));
      const keywordDocs = usedKeywordIds.length
        ? await KeywordEmotion.find({ _id: { $in: usedKeywordIds } })
            .select("_id name slug categories is_active created_at")
            .lean()
        : [];

      const allKeywords = keywordDocs.map((doc: any) => {
        const usage = keywordUsageMap.get(String(doc._id)) || { usageCount: 0, lastUsedAt: null };

        return {
          ...doc,
          usageCount: usage.usageCount,
          lastUsedAt: usage.lastUsedAt,
        };
      });

      const keywordDocsMap = new Map<string, any>();
      keywordDocs.forEach((doc: any) => keywordDocsMap.set(String(doc._id), doc));

      const unusedKeywords = (await KeywordEmotion.find({}).select("_id name slug categories is_active created_at").lean())
        .filter((doc: any) => !keywordDocsMap.has(String(doc._id)))
        .map((doc: any) => ({
          ...doc,
          usageCount: 0,
          lastUsedAt: null,
        }))
        .sort((a: any, b: any) => {
          const aTime = new Date(a?.created_at || 0).getTime();
          const bTime = new Date(b?.created_at || 0).getTime();
          return bTime - aTime;
        });

      const trendingKeywords = [...allKeywords]
        .sort((a: any, b: any) => {
          if ((b.usageCount || 0) !== (a.usageCount || 0)) return (b.usageCount || 0) - (a.usageCount || 0);
          return new Date(b.lastUsedAt || 0).getTime() - new Date(a.lastUsedAt || 0).getTime();
        })
        .slice(0, 10);

      const recentlyUsedKeywords = [...allKeywords]
        .sort((a: any, b: any) => new Date(b.lastUsedAt || 0).getTime() - new Date(a.lastUsedAt || 0).getTime())
        .slice(0, 10);

      const combinedTrendingPosts = [...trendingDiaryPosts, ...trendingSherPosts]
        .map((item: any) => buildRecordCard(item, item?.sourceType || item?.recordType || "Post"))
        .sort((a: any, b: any) => {
          if ((b.likesCount || 0) !== (a.likesCount || 0)) return (b.likesCount || 0) - (a.likesCount || 0);
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        })
        .slice(0, 10);

      const combinedRecentPosts = [...recentDiaryPosts, ...recentSherPosts]
        .map((item: any) => buildRecordCard(item, item?.sourceType || item?.recordType || "Post"))
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 5);

      const recentUsersFormatted = (recentUsers || []).map((item: any) => ({
        ...item,
        displayName: item?.name || item?.user_name || "User",
      }));

      const recentLoginActivitiesFormatted = (recentLoginActivities || []).map((item: any) => ({
        ...item,
        displayName: item?.userId?.name || item?.userId?.user_name || "User",
        user_name: item?.userId?.user_name || "",
        email: item?.userId?.email || "",
        statusLabel: item?.logoutAt ? "Logged Out" : "Active Now",
      }));

      const data = {
        range,
        stats: {
          totalPosts: diaryTotal + postTotal,
          totalUsers,
          totalCategories,
          totalKeywords,
          totalSubcategories: totalSubCategories,
          postsToday: diaryPostsToday + postPostsToday,
          activeUsers,
        },
        charts: {
          postGrowth: postGrowthSeries,
          userGrowth: userGrowthSeries,
          categoryDistribution: [
            { label: "Shayari", value: categoryTotals.Shayari, color: "#d8a54d" },
            { label: "Sher", value: categoryTotals.Sher, color: "#0f2f67" },
            { label: "Others", value: categoryTotals.Others, color: "#8f97a8" },
          ],
        },
        trendingKeywords,
        trendingPosts: combinedTrendingPosts,
        keywordInsights: {
          mostUsed: trendingKeywords,
          unused: unusedKeywords.slice(0, 10),
          recentlyUsed: recentlyUsedKeywords,
        },
        recentActivity: {
          posts: combinedRecentPosts,
          users: recentUsersFormatted,
          loginActivities: recentLoginActivitiesFormatted,
        },
        // legacy compatibility fields
        totalCustomer: totalUsers,
        activeCustomer: activeUsers,
        totalServiceProvider: diaryTotal + postTotal,
        totalEventType: totalKeywords,
        totalServices: totalSubCategories,
        totalCategories,
        totalSales: diaryPostsToday + postPostsToday,
        banner: combinedRecentPosts,
        topProvider: trendingKeywords,
        reportedProvider: combinedRecentPosts,
        viewProvider: recentUsersFormatted,
        topCategory: categoryTotals,
        viewServices: combinedTrendingPosts,
      };

      return _RS.ok(res, "SUCCESS", "Dashboard data has been fetched successfully", data, startTime);
    } catch (err) {
      next(err);
    }
  }
}
