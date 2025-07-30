
import { useState, useEffect } from 'react';
import {  DollarSign} from 'lucide-react';
import PageHeader from '../layouts/PageHeader';

import Topbar from '../layouts/Topbar';
import Sidebar from '../layouts/Sidebar';

import DashboardCard from './DashboardCard';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';




interface CategoryTotals {
  category: string;
  total: number;
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [lastTotal, setLastTotal] = useState<number>(0);
  const [ExRate, setRate] = useState<number>(0);
  function getStartOfPreviousMonth(): Date {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    return new Date(year, month, 1);
  }

  // Graph data
  const [filteredThisMonthData, setFilteredThisMonthData] = useState<CategoryTotals[]>([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
  
    const q = query(collection(db, 'expenses'), where('userId', '==', userId));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allExpenses = snapshot.docs.map(doc => doc.data());
      const now = new Date();
      const thisMonth = now.getMonth();
      const pastMonth = getStartOfPreviousMonth().getMonth();
      const pastYear = getStartOfPreviousMonth().getFullYear();
      const thisYear = now.getFullYear();
  
      const totals: Record<string, number> = {};
      let monthlySum = 0;
      let pastSum = 0;

      allExpenses.forEach((exp) => {
        const createdAt = new Date(exp.createdAt);
        if (
          createdAt.getFullYear() === thisYear &&
          createdAt.getMonth() === thisMonth
        ) {
          monthlySum += exp.amount || 0;
  
          if (!totals[exp.category]) {
            totals[exp.category] = 0;
          }
          totals[exp.category] += exp.amount || 0;
        }
        if ( createdAt.getMonth() === pastMonth &&
            createdAt.getFullYear() === pastYear){
              pastSum+= exp.amount || 0;
            }
      });

  
      const formattedChartData = Object.entries(totals).map(([category, total]) => ({
        category,
        total,
      }));
  
      setFilteredThisMonthData(formattedChartData);
      setMonthlyTotal(monthlySum);
      setLastTotal(lastTotal);
      if(lastTotal === 0 ){
        setRate(0);
      }
      else{
        setRate(Math.round(((monthlySum-pastSum)/pastSum)*100))
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
          marginLeft: isSidebarOpen ? '16rem' : '0',
        }}
      >
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <PageHeader
            title="Dashboard"
            icon={DollarSign}
            description="Your financial overview"
          />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DashboardCard title="$ Monthly Expense" value={"$"+String(Math.round(monthlyTotal))} />
        <DashboardCard title="Upcoming Renewals" value="3 services" />
        <DashboardCard title="Active Alerts" value="2 flagged" />
        <DashboardCard title="Expense vs Last Month" value={String(ExRate)+"%"} />
        </div>
        <div className="bg-white rounded-xl shadow p-6 mt-6">
            {/* Header with total */}
              <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">This Month’s Expenses by Category</h3>
              <p className="text-sm text-gray-600">
                Total: <span className="font-semibold text-indigo-600">{String("$"+Math.round(monthlyTotal))}</span>
              </p>
            </div>

            {/* Chart */}
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