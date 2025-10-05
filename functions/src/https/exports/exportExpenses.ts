import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
import { Storage } from "@google-cloud/storage";
import * as fastcsv from "fast-csv";
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream } from "fs";
import { Expense, Receipt, ExportRow } from "../../config/exportCategories";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const storage = new Storage();
const bucketName = "expensetracker-cf63d.firebasestorage.app"; // e.g., expensetracker-prod-data

export const exportExpenses = onCall(async (request) => {
  const user = request.auth;
  if (!user) throw new Error("User must be authenticated.");

  try {
    logger.info(`📤 Exporting expenses for user: ${user.uid}`);

    // Fetch expenses for this user
    const expensesSnap = await db
      .collection("expenses")
      .where("userId", "==", user.uid)
      .get();

    if (expensesSnap.empty) {
      throw new Error("No expenses found for this user.");
    }

    const rows: ExportRow[] = [];

    for (const expDoc of expensesSnap.docs) {
      const exp = expDoc.data() as Expense;
      let receipt: Receipt = {};
    
      if (exp.receiptId) {
        const recSnap = await db.collection("receipts").doc(exp.receiptId).get();
        if (recSnap.exists) receipt = recSnap.data() as Receipt;
      }
    
      rows.push({
        expenseId: expDoc.id,
        amount: exp.amount,
        category: exp.category || "Unknown",
        aiCategory: exp.aiCategory || "",
        categoryConfidence: exp.categoryConfidence ?? "",
        itemName: exp.itemName || "",
        merchant: exp.merchant || receipt.merchant || "Unknown",
        parsedBy: exp.parsedBy || "",
        quantity: exp.quantity ?? "",
        createdAt:
          exp.createdAt instanceof admin.firestore.Timestamp
            ? exp.createdAt.toDate().toISOString()
            : typeof exp.createdAt === "string"
            ? exp.createdAt
            : new Date().toISOString(),
        date: exp.date || "",
        receiptId: exp.receiptId || "",
        receiptTotal: receipt.total ?? "",
        numItems: receipt.numItems ?? (receipt.items ? receipt.items.length : ""),
        store: receipt.store || "",
        source: exp.source || receipt.source || "",
        riskScore: exp.risk?.score ?? "",
        riskFlagged: exp.risk?.flagged ?? false,
        riskVersion: exp.risk?.version ?? "",
      });
    }

    // Create CSV in temp dir
    const fileName = `user_${user.uid}_expenses_${Date.now()}.csv`;
    const filePath = join(tmpdir(), fileName);
    const ws = createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      fastcsv
        .write(rows, { headers: true })
        .on("finish", resolve)
        .on("error", reject)
        .pipe(ws);
    });

    const bucket = storage.bucket(bucketName);
    const destination = `exports/${fileName}`;
    await bucket.upload(filePath, {
      destination,
      contentType: "text/csv",
    });

    // Create a temporary signed URL (10 min)
    const [signedUrl] = await bucket
      .file(destination)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 10 * 60 * 1000,
      });

    logger.info(`✅ Export ready: ${destination}`);

    return {
      success: true,
      count: rows.length,
      downloadUrl: signedUrl,
    };
  } catch (err) {
    logger.error("❌ Export failed:", err);
    throw new Error(err instanceof Error ? err.message : "Export failed.");
  }
});
