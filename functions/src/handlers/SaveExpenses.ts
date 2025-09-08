import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid";
import { saveReceiptSummary } from "./SaveReceipts";


interface EnrichedLineItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface EnrichedReceipt {
  store: string;
  date: string;
  total: number;
  items: EnrichedLineItem[];
}

export async function saveExpensesFromReceipt(
  userId: string,
  receipt: EnrichedReceipt
): Promise<void> {
  const receiptId = uuidv4();

  await Promise.all(
    receipt.items.map((item) =>
      db.collection("expenses").add({
        userId,
        receiptId,
        itemName: item.name,
        amount: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        category: item.category,
        aiCategory: item.category,
        categoryConfidence: null,
        source: "receipt",
        parsedBy: "gpt-4o",
        merchant: receipt.store,
        date: receipt.date,
        timestamp: isNaN(Date.parse(receipt.date)) ? new Date() : new Date(receipt.date),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    )
  );
  await saveReceiptSummary(userId, receiptId, receipt, "receipt");
}
