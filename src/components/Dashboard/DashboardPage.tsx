
import { useState, useEffect } from "react";
import { DollarSign, DownloadCloud } from "lucide-react";
import PageHeader from "../layouts/PageHeader";
import Topbar from "../layouts/Topbar";
import Sidebar from "../layouts/Sidebar";
import DashboardCard from "./DashboardCard";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../../firebase";

interface CategoryTotals {
  category: string;
  total: number;
}

interface Expense {
  amount: number;
  category?: string;
  createdAt: any; // Firestore Timestamp or Date string
  [key: string]: any;
}

const functions = getFunctions(app);
// Export the expenses data to a csv file for training the AI/ML engine


export const downloadUserExport = async () => {
  try {
    const exportFn = httpsCallable(functions, "exportExpenses");
    const result = await exportFn();
    const { downloadUrl, count } = result.data as any;
    console.log(`Exported ${count} expenses`);
    window.open(downloadUrl, "_blank"); // triggers download
  } catch (err) {
    console.error("Export failed:", err);
  }
};

const DashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [ExRate, setRate] = useState<number>(0);
  const [filteredThisMonthData, setFilteredThisMonthData] = useState<
    CategoryTotals[]
  >([]);

  function getStartOfPreviousMonth(): Date {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return new Date(year, month, 1);
  }


  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const prevMonthStart = getStartOfPreviousMonth();
    const q = query(
      collection(db, "expenses"),
      where("userId", "==", userId),
      where("createdAt", ">=", Timestamp.fromDate(prevMonthStart)) // only last + this month
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allExpenses = snapshot.docs.map((doc) => doc.data() as Expense);
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const prevMonthDate = getStartOfPreviousMonth();
      const pastMonth = prevMonthDate.getMonth();
      const pastYear = prevMonthDate.getFullYear();

      const totals: Record<string, number> = {};
      let monthlySum = 0;
      let pastSum = 0;

      allExpenses.forEach((exp) => {
        const createdAt = exp.createdAt?.toDate
          ? exp.createdAt.toDate()
          : new Date(exp.createdAt);

        const category = exp.category || "Uncategorized";

        // This month totals
        if (createdAt.getFullYear() === thisYear && createdAt.getMonth() === thisMonth) {
          monthlySum += exp.amount || 0;
          if (!totals[category]) totals[category] = 0;
          totals[category] += exp.amount || 0;
        }

        // Last month totals
        if (createdAt.getFullYear() === pastYear && createdAt.getMonth() === pastMonth) {
          pastSum += exp.amount || 0;
        }
      });

      // Chart data sorted by spend
      const formattedChartData = Object.entries(totals)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

      setFilteredThisMonthData(formattedChartData);
      setMonthlyTotal(monthlySum);
      setLastTotal(pastSum);

      if (pastSum === 0) {
        setRate(0);
      } else {
        setRate(Math.round(((monthlySum - pastSum) / pastSum) * 100));
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow z-50">
        <Topbar onBrandClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow z-40">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <div
        className="pt-16"
        style={{
          marginLeft: isSidebarOpen ? "16rem" : "0",
        }}
      >
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Dashboard"
            icon={DollarSign}
            description="Your financial overview"
          />
          <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-2 sm:mt-0"
              onClick={() => downloadUserExport()}
            >
              <DownloadCloud size={20} /> GetExpenses 
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <DashboardCard
              title="$ Monthly Expense"
              value={"$" + String(Math.round(monthlyTotal))}
            />
            <DashboardCard title="Upcoming Renewals" value="3 services" />
            <DashboardCard title="Active Alerts" value="2 flagged" />
            <DashboardCard
              title="Expense vs Last Month"
              value={String(ExRate) + "%"}
            />
          </div>

          {/* Chart */}
          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                This Month’s Expenses by Category
              </h3>
              <p className="text-sm text-gray-600">
                Total:{" "}
                <span className="font-semibold text-indigo-600">
                  {"$" + Math.round(monthlyTotal)}
                </span>
              </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredThisMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
