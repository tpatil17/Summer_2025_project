import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../firebase"; // adjust path if needed

function getStartOfPreviousMonth(): Date {
  const now = new Date();
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  return new Date(year, month, 1);
}

export async function getAggregatedExpenses() {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const q = query(collection(db, "expenses"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const prevMonthDate = getStartOfPreviousMonth();
  const pastMonth = prevMonthDate.getMonth();
  const pastYear = prevMonthDate.getFullYear();

  const totalsByCategory: Record<string, number> = {};
  const lastMonthTotals: Record<string, number> = {};
  const totalsByMerchant: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const exp = doc.data();
    const amount = exp.amount || 0;
    const category = exp.category || "Uncategorized";
    const merchant = exp.merchant || "Unknown";

    const createdAt = exp.createdAt?.toDate
      ? exp.createdAt.toDate()
      : new Date(exp.createdAt);

    // 🔹 This month
    if (createdAt.getFullYear() === thisYear && createdAt.getMonth() === thisMonth) {
      if (!totalsByCategory[category]) totalsByCategory[category] = 0;
      totalsByCategory[category] += amount;

      if (!totalsByMerchant[merchant]) totalsByMerchant[merchant] = 0;
      totalsByMerchant[merchant] += amount;
    }

    // 🔹 Last month
    if (createdAt.getFullYear() === pastYear && createdAt.getMonth() === pastMonth) {
      if (!lastMonthTotals[category]) lastMonthTotals[category] = 0;
      lastMonthTotals[category] += amount;
    }
  });

  // Sort top merchants
  const topMerchants = Object.entries(totalsByMerchant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([merchant, total]) => ({ merchant, total }));

  // 🔹 Month-over-month comparison
  const monthComparison: Record<string, string> = {};
  for (const category of Object.keys(totalsByCategory)) {
    const current = totalsByCategory[category] || 0;
    const last = lastMonthTotals[category] || 0;

    if (last === 0) {
      monthComparison[category] = current > 0 ? "+100%" : "0%";
    } else {
      const diff = ((current - last) / last) * 100;
      monthComparison[category] = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
    }
  }

  return {
    totalsByCategory,
    topMerchants,
    monthComparison,
  };
}
