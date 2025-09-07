// src/components/expenses/AddExpenseModal.tsx

import React from "react";
import AddExpenseForm from "../layouts/AddExpenseForm";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/10">

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full animate-fade-in">
        <AddExpenseForm onClose={onClose} userId={userId} />
      </div>
    </div>
  );
};

export default AddExpenseModal;
