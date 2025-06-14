import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuthContext();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Good day, {user?.name || 'Manager'}! 🎯
        </h1>
        <p className="text-green-100 text-lg">
          Welcome to your manager dashboard. Here's your profile information.
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-3 text-green-600" />
          Manager Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Full Name</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.name || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
              <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 text-blue-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Email Address</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.email || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-indigo-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Role</span>
              </div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {user?.role || 'Manager'}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
              <div className="flex items-center mb-2">
                <Phone className="w-5 h-5 text-orange-600 mr-3" />
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
                {user?.department || 'Not Available'}
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-100">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-yellow-600 mr-3" />
                <span className="text-sm font-medium text-gray-600">Manager ID</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.id || 'Not Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Manager Responsibilities Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            Management Responsibilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Team Management</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Leave Approvals</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Performance Reviews</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Team Reports</span>
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

export default ManagerDashboard;
