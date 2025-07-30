import React from 'react';
import AddExpenseForm from '../layouts/AddExpenseForm';

interface Props {
  onClose: () => void;
  defaultAmount?: string;
  defaultDate?: string;
  defaultNote?: string;
}

const AddTransactionModal: React.FC<Props> = ({
  onClose,
  defaultAmount,
  defaultDate,
  defaultNote,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Add New Transaction</h2>
        <AddExpenseForm
          onClose={onClose}
          defaultAmount={defaultAmount}
          defaultDate={defaultDate}
          defaultNote={defaultNote}
        />
      </div>
    </div>
  );
};

export default AddTransactionModal;
