import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CategorySelect from '../Styles/SelectDropdown';

interface Props {
  expense: any;
  onClose: () => void;
}

const EditExpenseModal: React.FC<Props> = ({ expense, onClose }) => {
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category);
  const [date, setDate] = useState(expense.date);
  const [note, setNote] = useState(expense.note || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'expenses', expense.id), {
        amount: parseFloat(amount),
        category,
        date,
        note,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update expense:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Expense</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full border p-2 rounded mb-3"
            required
          />
          <CategorySelect value={category} onChange={setCategory} ></CategorySelect>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border p-2 rounded mb-3"
            required
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note"
            className="w-full border p-2 rounded mb-3"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="text-gray-600 hover:underline">
              Cancel
            </button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
