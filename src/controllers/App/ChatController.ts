import ChatShayari from "../../models/ChatShayari";
import ChatUsage from "../../models/ChatUsage";
import { callAI } from "../../helpers/openrouter";

const MAX_FREE_MESSAGES = 10;
const LIMIT_MESSAGE = "\u26A0\uFE0F Free limit khatam ho gayi. Kal fir try karo \uD83D\uDE4F";
const SERVER_BUSY_MESSAGE = "\u26A0\uFE0F Server busy hai, thodi der baad try karo";

const DEFAULT_SHAYARI = [
  { category: "sad", text: "Dil ke kamre mein ab bhi tere naam ki khushboo rehti hai, bas aankhon ne bolna band kar diya hai." },
  { category: "sad", text: "Woh pal yaad aate hain jab dard bhi apna sa lagta tha, aaj khamoshi bhi mehmaan jaisi hai." },
  { category: "sad", text: "Jo toot kar bhi muskura de, uska dard aksar sabse gehra hota hai." },
  { category: "sad", text: "Raat lambi nahi thi, bas teri yaad ne samay ko thoda aur thama diya." },
  { category: "sad", text: "Kuch zakhm lafzon se nahi bharte, unhe bas waqt ki naram roshni chahiye hoti hai." },
  { category: "maa", text: "Maa ki dua mein jo sukoon hai, woh duniya ke kisi khazane mein nahi milta." },
  { category: "maa", text: "Maa ke haath ki roti aur uski daant, dono hi zindagi ka sabse pyara pyaar hain." },
  { category: "maa", text: "Jahan thak kar bhi dil halka ho jaye, samajh lo wahan maa ki yaad maujood hai." },
  { category: "maa", text: "Maa ke chehre ki muskurahat, ghar ki sabse roshan diya hoti hai." },
  { category: "maa", text: "Maa ko dekh kar lagta hai, jaise dua bhi insaan ka roop le kar chal rahi ho." },
  { category: "love", text: "Mohabbat woh nahi jo lafzon se kahi jaye, mohabbat woh hai jo aankhon mein ghar kar jaye." },
  { category: "love", text: "Tere saath ka khayal hi kaafi hai, warna is dil ko roz naye bahane chahiye hote hain." },
  { category: "love", text: "Pyaar ka matlab sirf milna nahi hota, kabhi-kabhi khamoshi bhi saath nibha leti hai." },
  { category: "love", text: "Tu paas ho ya door, dil ke har kone mein tera hi thehraav rehta hai." },
  { category: "love", text: "Ishq ki sabse khoobsurat baat ye hai, woh waqt ke saath aur gehra ho jata hai." },
];

function getTodayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

function detectKeywordCategory(message: string) {
  const normalized = String(message || "").toLowerCase();

  if (normalized.includes("sad")) return "sad";
  if (normalized.includes("maa")) return "maa";
  if (normalized.includes("love")) return "love";

  return null;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

async function ensureSeededShayari() {
  const count = await ChatShayari.countDocuments();

  if (count === 0) {
    await ChatShayari.insertMany(DEFAULT_SHAYARI);
  }
}

async function getShayariByCategory(category: string, limit = 5) {
  await ensureSeededShayari();
  const docs = await ChatShayari.find({ category, is_active: true }).lean();
  return shuffle(docs).slice(0, Math.min(limit, docs.length));
}

export default class ChatController {
  static async chat(req, res, next) {
    try {
      const message = String(req.body?.message || "").trim();
      const userId = String(req.body?.userId || "").trim();

      if (!userId) {
        return res.status(400).json({ status: 400, message: "Missing userId." });
      }

      if (!message) {
        return res.status(400).json({ status: 400, message: "Message is required." });
      }

      const today = getTodayKey();
      const category = detectKeywordCategory(message);
      const usageRecord = await ChatUsage.findOne({ userId, date: today }).lean();

      if (category) {
        const shayari = await getShayariByCategory(category, 5);
        const reply = shayari.map((item: any) => item.text).join("\n\n");

        return res.status(200).json({
          status: 200,
          message: "Free shayari fetched successfully",
          reply: reply || "Abhi is feeling ke liye shayari available nahi hai.",
          source: "keyword",
          category,
          remainingQuota: Math.max(0, MAX_FREE_MESSAGES - (usageRecord?.count || 0)),
        });
      }

      if ((usageRecord?.count || 0) >= MAX_FREE_MESSAGES) {
        return res.status(429).json({
          status: 429,
          message: LIMIT_MESSAGE,
          reply: LIMIT_MESSAGE,
          source: "limit",
          remainingQuota: 0,
        });
      }

      const quotaFilter: any = {
        userId,
        date: today,
        $or: [{ count: { $lt: MAX_FREE_MESSAGES } }, { count: { $exists: false } }],
      };

      let reserved = null;

      try {
        reserved = await ChatUsage.findOneAndUpdate(
          quotaFilter,
          {
            $inc: { count: 1 },
            $setOnInsert: { userId, date: today },
          },
          {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          },
        );
      } catch (reservationError: any) {
        if (reservationError?.code === 11000) {
          return res.status(429).json({
            status: 429,
            message: LIMIT_MESSAGE,
            reply: LIMIT_MESSAGE,
            source: "limit",
            remainingQuota: 0,
          });
        }

        throw reservationError;
      }

      if (!reserved) {
        return res.status(429).json({
          status: 429,
          message: LIMIT_MESSAGE,
          reply: LIMIT_MESSAGE,
          source: "limit",
          remainingQuota: 0,
        });
      }

      try {
        const reply = await callAI(message);

        return res.status(200).json({
          status: 200,
          message: "AI response fetched successfully",
          reply,
          source: "ai",
          remainingQuota: Math.max(0, MAX_FREE_MESSAGES - (reserved.count || 0)),
        });
      } catch (error) {
        await ChatUsage.updateOne({ userId, date: today }, { $inc: { count: -1 } });
        throw error;
      }
    } catch (error) {
      console.error("[black-diary/chat] backend error:", error);
      return res.status(500).json({
        status: 500,
        message: SERVER_BUSY_MESSAGE,
        reply: SERVER_BUSY_MESSAGE,
        source: "error",
        remainingQuota: 0,
      });
    }
  }
}
