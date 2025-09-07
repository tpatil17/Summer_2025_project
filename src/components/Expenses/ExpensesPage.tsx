
import { useState } from 'react';
import { PlusCircle, DollarSign, Filter } from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import Topbar from '../layouts/Topbar';
import Sidebar from '../layouts/Sidebar';
import ExpenseList from '../layouts/ExpenseCard';
import ImageCaptureModal from '../OCR/ImageCaptureModal';
import type { ReceiptData } from '../OCR/ImageCaptureModal';
import AddTransactionModal from './AddExpenseModal'; // ✅ renamed correctly
import { auth } from '../../firebase'; // ✅ make sure you have access to currentUser

const ExpensesPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showExpModal, setShowExpModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const user = auth.currentUser;

  // 🧾 When receipt is parsed, optionally pre-fill something later
  const handleReceiptExtract = (data: ReceiptData) => {
    // You could later pass parsed items to a receipt review modal
    setShowReceiptModal(false);
    // Could trigger a second modal if needed
  };

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
            title="Expenses"
            icon={DollarSign}
            description="Track and manage all your financial transactions."
          />

          {/* Buttons */}
          <div className="flex gap-4 mt-4 mb-6">
            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
              onClick={() => setShowExpModal(true)}
            >
              <PlusCircle size={20} /> Add Transaction
            </button>

            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded"
              onClick={() => setShowReceiptModal(true)}
            >
              <PlusCircle size={20} /> Upload Receipt
            </button>
          </div>

          {/* Add Transaction Modal */}
          <AddTransactionModal
            isOpen={showExpModal}
            onClose={() => setShowExpModal(false)}
            userId={user?.uid || ''}
          />

          {/* Upload Receipt Modal */}
          {showReceiptModal && (
            <ImageCaptureModal
              onClose={() => setShowReceiptModal(false)}
              onExtract={handleReceiptExtract}
            />
          )}

          {/* Transactions Header + Filter */}
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="mt-4 text-xl font-semibold font-headline">
              Transaction History
            </h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-2 sm:mt-0">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </button>
          </div>

          {/* Expense List or Dashboard Component */}

        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
