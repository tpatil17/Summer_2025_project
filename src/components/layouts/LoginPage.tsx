import React from 'react';
import LoginForm from './LoginFrom';

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">Login to Your Account</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
