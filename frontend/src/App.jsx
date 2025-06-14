import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LeaveProvider } from '@/contexts/LeaveContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import AppRoutes from '@/routes/AppRoutes';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LeaveProvider>
          <ReportsProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
              </div>
            </Router>
          </ReportsProvider>
        </LeaveProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
