/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
import { onCall } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import { OpenAI } from "openai";


// Use Firebase secret, NOT dotenv
const openaiApiKey = defineSecret("OPENAI_API_KEY");

export const AIsummarizeSpending = onCall(
  { secrets: [openaiApiKey] },
  async (request) => {
    const { expenses } = request.data;
    const user = request.auth;

    if (!user) {
      throw new Error("User must be authenticated.");
    }

    if (!Array.isArray(expenses)) {
      throw new Error("Invalid or missing 'expenses' array.");
    }

    try {
      const prompt = `
You are a financial assistant. Summarize the user's spending for this month.
Highlight total spent, top categories, and any anomalies.

Expenses:
${JSON.stringify(expenses, null, 2)}
`;

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(), // Use Firebase secret
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });

      const summary = response.choices[0]?.message?.content;

      return { summary };
    } catch (err) {
      logger.error("OpenAI API Error:", err);
      throw new Error("Failed to generate spending summary.");
    }
  }
);

// ✅ Move types to the top (or import from a types.ts file if available)
interface ParsedLineItem {
  name: string;
  price: number;
}

interface EnrichedLineItem extends ParsedLineItem {
  quantity: number;
  category: string;
}

interface EnrichedReceipt {
  store: string;
  date: string;
  total: number;
  items: EnrichedLineItem[];
}

export const enrichParsedReceipt = onCall(
  { secrets: [openaiApiKey] },
  async (request): Promise<EnrichedReceipt> => {
    const parsed = request.data?.parsed;
    const user = request.auth;

    if (!user) {
      throw new Error("User must be authenticated.");
    }

    if (
      !parsed ||
      !Array.isArray(parsed.items) ||
      parsed.items.length === 0
    ) {
      throw new Error("Invalid or missing parsed receipt.");
    }

    try {
      const { store, date, total, items } = parsed;

      const itemList = (items as ParsedLineItem[])
        .map((item) => `- ${item.name}: $${item.price.toFixed(2)}`)
        .join("\n");

      const prompt = `
You're a smart financial assistant. A user uploaded a receipt from "${store}" dated "${date}" with a total of $${total}.

Here are the line items:

${itemList}

For each item, return:
- Cleaned item name
- Quantity (if possible to infer, otherwise default to 1)
- Price (per unit)
- Category (e.g., "Groceries", "Personal Care", "Dining")

Respond **only** with raw, valid JSON. Do not include any text, markdown, or explanations. No comments. No code blocks.
Output should start with { and end with }.

Use the following format:

{
  "store": "${store}",
  "date": "${date}",
  "total": ${total},
  "items": [
    {
      "name": "...",
      "price": 0.00,
      "quantity": 1,
      "category": "..."
    }
  ]
}
`;

      const openai = new OpenAI({ apiKey: openaiApiKey.value() });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1000,
      });

      const messageContent = response.choices[0]?.message?.content;

      if (!messageContent) {
        throw new Error("No response from GPT.");
      }

      try {
        // 🔐 Sanitize common GPT formatting issues (e.g., code block wrappers)
        const cleaned = messageContent
          .trim()
          .replace(/^```json/, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .replace(/,$/gm, ""); // remove trailing commas
        
        logger.info("📦 GPT raw response:", messageContent);

        const enriched: EnrichedReceipt = JSON.parse(cleaned);
        return enriched;
      } catch (err: unknown) {
        logger.error("❌ GPT Failed to parse JSON:", {
          rawResponse: messageContent,
          error: err,
        });

        throw new Error("Invalid GPT response format.");
      }
    } catch (err: unknown) {
      logger.error("GPT enrichment error:", err);

      if (err instanceof Error) {
        throw new Error(err.message);
      }

      throw new Error("Failed to enrich parsed receipt.");
    }
  }
);