// src/api/summarize.ts
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../firebase"; // Adjust path if needed

// Define your expense type (expand if needed)
export type Expense = {
  amount: number;
  category: string;
  [key: string]: any;
};

// Define the response structure from Firebase
type SummaryResponse = {
  summary: string;
};

export async function getSpendingSummary(expenses: Expense[]): Promise<string> {
  const functions = getFunctions(app);
  const summarizeSpending = httpsCallable<{ expenses: Expense[] }, SummaryResponse>(
    functions,
    "AIsummarizeSpending"
  );

  try {
    const result = await summarizeSpending({ expenses });
    return result.data.summary;
  } catch (error) {
    console.error("Callable function error:", error);
    throw new Error("Failed to fetch summary");
  }
}
