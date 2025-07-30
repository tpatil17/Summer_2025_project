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
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as logger from "firebase-functions/logger";
import cors from "cors";
import { OpenAI } from "openai";
import { Request, Response } from "express";

// Use Firebase secret, NOT dotenv for deployed environments
const openaiApiKey = defineSecret("OPENAI_API_KEY");

// CORS handler
const corsHandler = cors({ origin: true });

export const summarizeSpending = onRequest({ secrets: [openaiApiKey] }, async (req: Request, res: Response) => {
  corsHandler(req, res, async () => {
    try {
      const expenses = req.body.expenses;

      if (!Array.isArray(expenses)) {
        res.status(400).send("Invalid expenses array");
        return;
      }

      const prompt = `
You are a financial assistant. Summarize the user's spending for this month.
Highlight total spent, top categories, and any anomalies.

Expenses:
${JSON.stringify(expenses, null, 2)}
`;

      const openai = new OpenAI({
        apiKey: openaiApiKey.value(), // ✅ Firebase secret usage
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      });

      const summary = response.choices[0]?.message?.content;
      res.status(200).json({ summary });
    } catch (err) {
      logger.error("OpenAI Error", err);
      res.status(500).send("Failed to generate summary.");
    }
  });
});
