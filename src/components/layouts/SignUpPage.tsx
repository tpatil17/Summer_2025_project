// src/pages/SignUpPage.tsx
import React from 'react';
import SignUpForm from './SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Your Account</h2>
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUpPage;
