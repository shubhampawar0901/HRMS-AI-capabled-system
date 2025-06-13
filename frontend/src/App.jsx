import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { ThemeProvider } from './shared/contexts/ThemeContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import Layout from './shared/components/Layout';
import './index.css';

// Import placeholder components (will be implemented by module agents)
import LoginPage from './modules/auth/pages/LoginPage';
import AdminDashboard from './modules/dashboard/pages/AdminDashboard';
import ManagerDashboard from './modules/dashboard/pages/ManagerDashboard';
import EmployeeDashboard from './modules/dashboard/pages/EmployeeDashboard';

// Placeholder components for other modules
const EmployeeList = () => <div className="p-6">Employee List - To be implemented by Employee Module Agent</div>;
const AttendanceHub = () => <div className="p-6">Attendance Hub - To be implemented by Attendance Module Agent</div>;
const LeaveHub = () => <div className="p-6">Leave Hub - To be implemented by Leave Module Agent</div>;
const PayrollHub = () => <div className="p-6">Payroll Hub - To be implemented by Payroll Module Agent</div>;
const PerformanceHub = () => <div className="p-6">Performance Hub - To be implemented by Performance Module Agent</div>;
const AIHub = () => <div className="p-6">AI Hub - To be implemented by AI Features Module Agent</div>;

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Dashboard Routes - Role-based */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardRouter />} />
                
                {/* Feature Routes */}
                <Route path="employees" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <EmployeeList />
                  </ProtectedRoute>
                } />
                
                <Route path="attendance" element={<AttendanceHub />} />
                <Route path="leave" element={<LeaveHub />} />
                
                <Route path="payroll" element={
                  <ProtectedRoute requiredRoles={['admin', 'employee']}>
                    <PayrollHub />
                  </ProtectedRoute>
                } />
                
                <Route path="performance" element={<PerformanceHub />} />
                <Route path="ai-features" element={<AIHub />} />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Dashboard Router Component - Routes to appropriate dashboard based on user role
const DashboardRouter = () => {
  // This will be implemented properly by the Auth Module Agent
  // For now, we'll use a placeholder
  const userRole = 'admin'; // This should come from auth context
  
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;
