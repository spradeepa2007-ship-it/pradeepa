import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BillingPage from './pages/BillingPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [billingData, setBillingData] = useState<any>(null);

  const handleNavigation = (page: string, data?: any) => {
    setCurrentPage(page);
    if (data) {
      setBillingData(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'register') {
      return <RegisterPage onNavigate={handleNavigation} />;
    }
    return <LoginPage onNavigate={handleNavigation} />;
  }

  if (currentPage === 'billing' && billingData) {
    return <BillingPage orderData={billingData} onNavigate={handleNavigation} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user.role === 'staff') {
    return <StaffDashboard onNavigate={handleNavigation} />;
  }

  return <StudentDashboard onNavigate={handleNavigation} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
