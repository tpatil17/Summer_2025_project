import { db } from "../firebase";



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


export async function saveReceiptSummary(
userId: string,
receiptId: string,
receipt: EnrichedReceipt,
source: "receipt" | "manual",
parsedBy: string = "gpt-4o"
): Promise<void> {
const totalAmount = receipt.items.reduce(
(sum, item) => sum + item.price * item.quantity,
0
);


const receiptRef = db.collection("receipts").doc(receiptId); // ✅ Admin-style

await receiptRef.set({
  receiptId,
  userId,
  merchant: receipt.store,
  total: parseFloat(totalAmount.toFixed(2)),
  date: receipt.date,
  timestamp: isNaN(Date.parse(receipt.date))
    ? new Date()
    : new Date(receipt.date),
  numItems: receipt.items.length,
  source,
  parsedBy,
  createdAt: new Date(),
  updatedAt: new Date(),
});
}
