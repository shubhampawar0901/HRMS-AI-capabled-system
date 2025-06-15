import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            HRMS
          </h1>
          <p className="text-gray-600">Human Resource Management System</p>
        </div>
        
        {children}
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 HRMS. All rights reserved.</p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400/30 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-32 left-32 w-2 h-2 bg-pink-400/30 rounded-full animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-20 w-5 h-5 bg-blue-300/30 rounded-full animate-pulse delay-500"></div>
    </div>
  );
};

export default AuthLayout;
