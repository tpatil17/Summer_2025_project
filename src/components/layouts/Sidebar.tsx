import React from "react";
import { User, Settings, DollarSignIcon, TriangleAlert, ChartNoAxesCombined, LogOut, Bell, LayoutDashboard } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <div className="w-64 bg-gray-800 text-white p-4 h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onClose} className="text-white text-xl">✕</button>
      </div>

      <nav className="flex flex-col gap-4">
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <User size={20} /> Profile
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2" onClick={()=> navigate('/dashboard')}>
          <LayoutDashboard size={20} /> Dashboard
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2" onClick={()=> navigate('/analytics')}>
          <ChartNoAxesCombined size={20} /> Analytics
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2" onClick={()=> navigate('/expenses')}>
          <DollarSignIcon size={20} /> Expenses

        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2" onClick={() => navigate('/subscriptions')}>
          <Bell size={20} /> Subscriptions
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <TriangleAlert size={20} /> Alerts
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2">
          <Settings size={20} /> Settings
        </a>
        <a href="#" className="hover:bg-gray-700 p-2 rounded flex items-center gap-2" onClick={()=> navigate('/login')}>
          <LogOut size={20} /> Logout
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
