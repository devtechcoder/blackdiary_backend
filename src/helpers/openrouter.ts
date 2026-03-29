const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || "http://localhost:3000";
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || "Black Diary Chatbot";

// 🔥 Multiple models (fallback system)
const MODELS = ["meta-llama/llama-3.3-70b-instruct:free", "deepseek/deepseek-chat:free", "nousresearch/nous-capybara-7b:free", "openrouter/auto"];

const SYSTEM_PROMPT = `
You are a Hinglish shayari assistant.

STRICT RULES:
- Always reply in Hinglish (Hindi written in English letters)
- Do NOT use Hindi script (Devanagari)
- Do NOT use Urdu or Arabic script
- Keep language simple and natural
- Tone should be emotional and friendly

Examples:
User: hello
Bot: Main theek hoon 😊 tum kaise ho?

User: sad shayari do
Bot: Dil toot gaya hai... par yaadein abhi bhi zinda hain 💔
`;

function extractResponseText(responseJson: any) {
  return responseJson?.choices?.[0]?.message?.content?.trim() || "";
}

// 🔥 delay helper (retry ke liye)
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔥 MAIN AI FUNCTION (with fallback)
async function callOpenRouterChat(message: string) {
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": OPENROUTER_REFERER,
          "X-Title": OPENROUTER_TITLE,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        console.log(`❌ Model failed: ${model}`);
        continue; // next model try karo
      }

      const data = await response.json();
      const text = extractResponseText(data);

      if (text) {
        console.log(`✅ Success with model: ${model}`);
        return text;
      }
    } catch (err) {
      console.log(`⚠️ Error with model: ${model}`);
    }

    // thoda wait karo next model try se pehle
    await sleep(800);
  }

  // 🔥 FINAL fallback (user ko empty na mile)
  return "😅 AI abhi busy hai... par ye suno ❤️\n\nDil tootne ki awaaz nahi aati, par dard gehra hota hai 💔";
}

export async function callAI(message: string) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    throw new Error("Message is required.");
  }

  if (!OPENROUTER_API_KEY) {
    throw new Error("Missing OPENROUTER_API_KEY.");
  }

  return callOpenRouterChat(trimmedMessage);
}
