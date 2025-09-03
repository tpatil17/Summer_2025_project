


import { Routes, Route } from 'react-router-dom';
import LoginPage from "./components/layouts/LoginPage";
import SignUpPage from "./components/layouts/SignUpPage";

import PrivateRoute from './components/PrivateRoute';
import ExpensesPage from "./components/Expenses/ExpensesPage";
import SubscriptionsPage from "./components/Subscriptions/SubscriptionsPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import AnalyticsPage from './components/Analytics/AnalyticsPage';




// src/App.tsx

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<SignUpPage />} />
      <Route path="/dashboard" element={
      <PrivateRoute>
        <DashboardPage />
      </PrivateRoute>
      } />  
      <Route path="/expenses" element={<ExpensesPage/>}/>
      <Route path="/subscriptions" element={<SubscriptionsPage/>}/>
      <Route path="/analytics" element={<AnalyticsPage/>}/>
      <Route path="*" element={<h2>404 Not Found</h2>} />
    </Routes>
  );
};
export default App;
