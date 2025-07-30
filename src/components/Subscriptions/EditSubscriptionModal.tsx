import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CategorySelect from '../Styles/SelectDropdown';
import BillingSelect from '../Styles/BillingDropdown';

interface Props {
  subscription: any;
  onClose: () => void;
}

const EditSubscriptionModal: React.FC<Props> = ({ subscription, onClose }) => {
  const [name, setName] = useState(subscription.name)
  const [amount, setAmount] = useState(subscription.amount);
  const [category, setCategory] = useState(subscription.category);
  const [Frequency, setFrequency] = useState(subscription.Frequency);
  const [date, setDate] = useState(subscription.date);
  const [note, setNote] = useState(subscription.note || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'subscriptions', subscription.id), {
        name,
        amount: parseFloat(amount),
        Frequency,
        category,
        date,
        note,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update subscription:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Edit Expense</h3>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
            type="string"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subscription Name"
            className="w-full border p-2 rounded mb-3"
            required
          />         
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="w-full border p-2 rounded mb-3"
            required
          />
          <CategorySelect value={category} onChange={setCategory} ></CategorySelect>
          <BillingSelect value={Frequency} onChange={setFrequency} ></BillingSelect>
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

export default EditSubscriptionModal;
