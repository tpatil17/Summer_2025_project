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
