
import { useState } from 'react';
import { PlusCircle, Filter } from 'lucide-react';
import PageHeader from '../layouts/PageHeader';
import Topbar from '../layouts/Topbar';
import Sidebar from '../layouts/Sidebar';
import AddSubscriptionForm from './AddSubscriptionForm';
import SubscriptionsList from './SubscriptionCard';


const SubscriptionsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Topbar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white shadow z-50">
        <Topbar onBrandClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white shadow z-40">
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <div
        className="pt-16"
        style={{
          marginLeft: isSidebarOpen ? '16rem' : '0',
        }}
      >
        <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
          <PageHeader
            title="Subscriptions and Recuring Payments"
            description="Subscriptions and upcoming renewals"
          />

          <button
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-4 mb-6"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            <PlusCircle size={20} /> Add Subscription
          </button>

          {isFormOpen && <AddSubscriptionForm onClose={() => setIsFormOpen(false)} />}

          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="mt-4 text-xl font-semibold font-headline">Active Subscriptions</h2>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded mt-2 sm:mt-0">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </button>
          </div>
        <SubscriptionsList />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;