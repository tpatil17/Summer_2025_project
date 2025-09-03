import Topbar from "../layouts/Topbar";
import Sidebar from "../layouts/Sidebar";
import PageHeader from "../layouts/PageHeader";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import {db, auth} from "../../firebase"
import { getSpendingSummary } from "../FireBaseFunctions/GetSpendingSummary";
import type { Expense } from "../types";

const AnalyticsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSummary("User not authenticated.");
        setLoading(false);
        return;
      }

      try {
        // 🔄 Fetch expenses from Firestore
        const q = query(collection(db, "expenses"), where("userId", "==", user.uid));
        const snapshot = await getDocs(q);
        const expenses: Expense[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            amount: data.amount,
            category: data.category,
            ...data,
          };
        });
        

        // 🎯 Use centralized API call
        const summaryText = await getSpendingSummary(expenses);
        setSummary(summaryText);
      } catch (error) {
        console.error("Error generating summary:", error);
        setSummary("Error generating summary.");
      } finally {
        setLoading(false);
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
          <PageHeader
            title="Analytics"
            description="AI overview and expenditure analysis"
          />

          <div className="mt-6 bg-white p-6 rounded shadow-md">
            <h2 className="text-lg font-semibold mb-2">Monthly Summary</h2>
            {loading ? (
              <p className="text-gray-500">Loading summary...</p>
            ) : (
              <p className="whitespace-pre-line text-gray-700">{summary}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
