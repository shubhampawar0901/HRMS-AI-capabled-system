import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRoutes from '@/routes/AppRoutes';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <AppRoutes />
            </div>
          </Router>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
