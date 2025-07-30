import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import {db, auth} from '../../firebase';
import CategorySelect from '../Styles/SelectDropdown';
import BillingSelect from '../Styles/BillingDropdown';

interface Props {
    onClose: () => void;
}

const AddSubscriptionForm: React.FC<Props> = ({ onClose }) => {
  const [Name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const [category, setCategory] = useState<{ value: string; label: string } | null>(null);
  const [Frequency, setFrequency] = useState<{value: string; label: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      await addDoc(collection(db, 'subscriptions'), {
        userId,
        name: Name,
        amount: parseFloat(amount),
        category: category?.value,
        Frequency: Frequency?.value,
        date,
        note,
        createdAt: new Date().toISOString(),
      });

      onClose(); // Close form after successful submit
    } catch (err: any) {
      setError(err.message || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded flex flex-col space-y-4 mt-2">
      <h3 className="text-lg font-semibold">Add Subscription</h3>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="Text"
        placeholder="Subscription Name (e.g Netflix Premium)"
        className="w-full border p-2 rounded mb-3"
        value={Name}
        onChange={(e) => setName(e.target.value)}
        required
      />


      <input
        type="number"
        placeholder="Amount"
        className="w-full border p-2 rounded mb-3"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <CategorySelect value={category} onChange={setCategory} />
      <BillingSelect value={Frequency} onChange={setFrequency}/>

      
      <input
        type="date"
        placeholder='Renewal Date'
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

export default AddSubscriptionForm;
