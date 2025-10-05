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
import {saveExpensesFromReceipt} from "./handlers/SaveExpenses";
import { FIXED_CATEGORIES,ExpenseCategory } from "./config/fixedCategories";

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

    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      throw new Error("Invalid or missing parsed receipt.");
    }

    try {
      const { store, date, total, items } = parsed;

      const itemList = (items as ParsedLineItem[])
        .map((item) => `- ${item.name}: $${item.price.toFixed(2)}`)
        .join("\n");

      logger.info("🧾 Receipt:", { store, date, total });
      logger.info("📦 Items:\n" + itemList);

      const openai = new OpenAI({ apiKey: openaiApiKey.value() });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        tool_choice: "auto",
        tools: [
          {
            type: "function",
            function: {
              name: "enrich_receipt",
              description: "Enriches a parsed receipt with quantity and categories",
              parameters: {
                type: "object",
                properties: {
                  store: { type: "string" },
                  date: { type: "string" },
                  total: { type: "number" },
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                        quantity: { type: "number" },
                        category: {
                          type: "string",
                          enum: FIXED_CATEGORIES, // ✅ restrict to allowed values
                        },
                      },
                      required: ["name", "price", "quantity", "category"]
                    }
                  }
                },
                required: ["store", "date", "total", "items"]
              }
            }
          }
        ],
        messages: [
          {
            role: "user",
            content: `
Here is a receipt:

- Store: ${store}
- Date: ${date}
- Total: ${total}
- Items:\n${itemList}

Please enrich each item with quantity and a category chosen strictly from this list:
${FIXED_CATEGORIES.join(", ")}
            `.trim(),
          },
        ],
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];

      if (!toolCall || toolCall.function.name !== "enrich_receipt") {
        throw new Error("No structured output returned by GPT.");
      }

      const enrichedReceipt: EnrichedReceipt = JSON.parse(toolCall.function.arguments);

      enrichedReceipt.items = enrichedReceipt.items.map((item) => {
        if (!FIXED_CATEGORIES.includes(item.category as ExpenseCategory)) {
          logger.warn(`⚠️ Invalid category "${item.category}" → defaulting to "Other"`);
          return { ...item, category: "Other" };
        }
        return item;
      });

      logger.info("✅ Enriched receipt:", enrichedReceipt);
      await saveExpensesFromReceipt(user.uid, enrichedReceipt);
      return enrichedReceipt;
    } catch (err: unknown) {
      logger.error("❌ GPT enrichment error:", err);

      if (err instanceof Error) {
        throw new Error(err.message);
      }

      throw new Error("Failed to enrich parsed receipt.");
    }
  }
);

export { deleteReceipt } from "./triggers/receipts";

export { exportExpenses } from "./https/exports/exportExpenses"
