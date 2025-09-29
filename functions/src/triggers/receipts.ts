import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

export const deleteReceipt = onCall(
  async (request): Promise<{ success: boolean; message: string }> => {
    const user = request.auth;
    if (!user) {
      throw new Error("User must be authenticated.");
    }

    const receiptId = request.data?.receiptId;
    if (!receiptId) {
      throw new Error("Missing receiptId.");
    }

    try {
      logger.info("🗑️ Deleting receipt", { receiptId, userId: user.uid });

      const batch = db.batch();

      // Check & delete receipt
      const receiptRef = db.collection("receipts").doc(receiptId);
      const receiptSnap = await receiptRef.get();

      if (!receiptSnap.exists || receiptSnap.data()?.userId !== user.uid) {
        throw new Error("Receipt not found or not authorized.");
      }

      batch.delete(receiptRef);

      // Delete related expenses
      const expensesRef = db.collection("expenses");
      const snapshot = await expensesRef.where("receiptId", "==", receiptId).get();
      snapshot.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();

      logger.info("✅ Deleted receipt and related expenses", {
        receiptId,
        count: snapshot.size,
      });

      return {
        success: true,
        message: `Deleted receipt ${receiptId} and ${snapshot.size} related expenses.`,
      };
    } catch (err: unknown) {
      logger.error("❌ Delete error", err);

      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("Failed to delete receipt.");
    }
  }
);
