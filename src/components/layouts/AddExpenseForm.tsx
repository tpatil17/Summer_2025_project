import React, { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import {db, auth} from '../../firebase';
import CategorySelect from '../Styles/SelectDropdown';


interface Props {
  onClose: () => void;
  defaultAmount?: string;
  defaultDate?: string;
  defaultNote?: string;
}
const AddExpenseForm: React.FC<Props> = ({
  onClose,
  defaultAmount = '',
  defaultDate = '',
  defaultNote = '',
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [date, setDate] = useState(defaultDate);
  const [note, setNote] = useState(defaultNote);

  useEffect(() => {
    setAmount(defaultAmount);
    setDate(defaultDate);
    setNote(defaultNote);
  }, [defaultAmount, defaultDate, defaultNote]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const [category, setCategory] = useState<{ value: string; label: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      await addDoc(collection(db, 'expenses'), {
        userId,
        amount: parseFloat(amount),
        category: category?.value,
        date,
        note,
        createdAt: new Date().toISOString(),
      });
      setAmount('');
      setDate('');
      setNote('');
      onClose(); // Close form after successful submit

    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded flex flex-col space-y-4 mt-2">

      {error && <p className="text-red-500">{error}</p>}

      <input
        type="number"
        placeholder="Amount"
        className="w-full border p-2 rounded mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <CategorySelect value={category} onChange={setCategory} />
      
      <input
        type="date"
        className="w-full border p-2 rounded mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <textarea
        placeholder="Note (optional)"
        className="w-full border p-2 rounded mb-3"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="text-gray-500 hover:underline">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default AddExpenseForm;
