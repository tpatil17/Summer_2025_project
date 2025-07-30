
import { useState } from 'react';
import { PlusCircle,DollarSign, Filter } from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import Topbar from '../layouts/Topbar';
import Sidebar from '../layouts/Sidebar';
import ExpenseList from '../layouts/ExpenseCard';
import ImageCaptureModal from '../OCR/ImageCaptureModal';
import type { ReceiptData } from '../OCR/ImageCaptureModal';
import AddTransactionModal from './AddExpenseModal';


const ExpensesPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showExpModal, setShowExpModal] = useState(false);


  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  const handleReceiptExtract = (data: ReceiptData) => {
    if (data.extracted.total) setAmount(data.extracted.total.toString());
    if (data.extracted.date) setDate(data.extracted.date);
    setNote(data.extracted.store);

    setShowModal(false);
    setShowExpModal(true);
  };
 


  const handleCloseTransactionModal = () => {
    setShowExpModal(false);
    setAmount('');
    setDate('');
    setNote('');
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
          <div className="flex gap-4 mt-4 mb-6">
            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-4 mb-6"
              onClick={() => setShowExpModal(true)}
            >
              <PlusCircle size={20} /> Add Transaction
            </button>
              {showExpModal && (
                <AddTransactionModal
                  onClose={handleCloseTransactionModal}
                  defaultAmount={amount}
                  defaultDate={date}
                  defaultNote={note}
                />
              )}
  
            <button
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-4 mb-6"
              onClick={() => setShowModal(true)}
            >
              <PlusCircle size={20} /> Upload Receipt
            </button>

          {showModal && (
            <ImageCaptureModal
              onClose={() => setShowModal(false)}
              onExtract={handleReceiptExtract}
            />
          )}

          </div>


          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="mt-4 text-xl font-semibold font-headline">Transaction History</h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-2 sm:mt-0">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </button>
          </div>

          <ExpenseList />
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;