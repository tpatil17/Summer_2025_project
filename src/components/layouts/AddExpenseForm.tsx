import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import CategorySelect from '../Styles/SelectDropdown';
import type { CategoryOption } from "../Styles/SelectDropdown";


interface AddExpenseFormProps {
  onClose: () => void;
  userId: string;
}

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onClose, userId }) => {
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:mm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName || !amount || !category || !date) {
      alert("Please fill all required fields");
      return;
    }

    const timestamp = new Date(`${date}T${time || "12:00"}`);

    const expense = {
      userId,
      receiptId: uuidv4(),
      itemName,
      amount,
      quantity,
      total: amount * quantity,
      category,
      merchant: merchant || null,
      aiCategory: null,
      categoryConfidence: null,
      parsedBy: null,
      ocrRawText: null,
      source: "manual",
      timestamp,
      date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "expenses"), expense);
      await addDoc(collection(db, 'receipts'), expense);
      alert("Expense added successfully");
      onClose(); // close the form
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense.");
    }

  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md w-full">
      <h2 className="text-lg font-semibold mb-4">Add Manual Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          required
        />
        <input
          className="w-full border p-2 rounded"
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <CategorySelect value={category} onChange={setCategory} ></CategorySelect>
        <input
          className="w-full border p-2 rounded"
          type="text"
          placeholder="Merchant (optional)"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />
        <div className="flex space-x-2">
          <input
            className="w-1/2 border p-2 rounded"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            className="w-1/2 border p-2 rounded"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;
