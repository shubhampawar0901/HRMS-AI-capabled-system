import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'Admin'}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Welcome to your admin dashboard. Here's your profile information.
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-blue-600" />
          Administrator Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Full Name</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.name || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 text-purple-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Email Address</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.email || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Role</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {user?.role || 'Administrator'}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Phone Number</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.phone || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-100">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 text-teal-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Department</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.department || 'Administration'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Admin ID</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.id || 'Not Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Privileges Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 text-blue-600 mr-2" />
            Administrator Privileges
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Full System Access</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Employee Management</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Payroll Management</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">AI Features Access</span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Last login: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
