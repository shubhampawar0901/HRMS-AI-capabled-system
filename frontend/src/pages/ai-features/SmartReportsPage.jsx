/**
 * Smart Reports Page - AI-powered reporting system
 * Role-based access: Admin and Manager only
 * 
 * This component provides intelligent reporting capabilities with AI insights
 * and role-based data access control.
 */

import React from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Filter,
  Brain,
  Sparkles
} from 'lucide-react';

const SmartReportsPage = () => {
  const { user } = useAuthContext();

  // Double-check role-based access (additional security layer)
  if (!user || !['admin', 'manager'].includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Smart Reports
              </h1>
              <p className="text-gray-600 mt-1">
                AI-powered insights and intelligent reporting for {user.role === 'admin' ? 'organization-wide' : 'team'} data
              </p>
            </div>
          </div>
          
          {/* Role Badge */}
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {user.role === 'admin' ? 'Admin Access' : 'Manager Access'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="ai-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Reports</h3>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">24</div>
            <p className="text-xs text-gray-500 mt-1">Available reports</p>
          </div>

          <div className="ai-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Generated Today</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <p className="text-xs text-gray-500 mt-1">Reports generated</p>
          </div>

          <div className="ai-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Data Sources</h3>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">6</div>
            <p className="text-xs text-gray-500 mt-1">Connected systems</p>
          </div>

          <div className="ai-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">AI Insights</h3>
              <Brain className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">12</div>
            <p className="text-xs text-gray-500 mt-1">Active insights</p>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Attendance Reports */}
          <div className="ai-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Attendance Reports</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Daily Attendance Summary</h4>
                  <p className="text-sm text-gray-600">Real-time attendance tracking</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Monthly Trends</h4>
                  <p className="text-sm text-gray-600">Attendance patterns and insights</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Anomaly Detection Report</h4>
                  <p className="text-sm text-gray-600">AI-detected attendance issues</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Performance Reports */}
          <div className="ai-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Performance Reports</h2>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Team Performance</h4>
                  <p className="text-sm text-gray-600">Comprehensive team analytics</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Goal Achievement</h4>
                  <p className="text-sm text-gray-600">Progress tracking and insights</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-900">Productivity Analysis</h4>
                  <p className="text-sm text-gray-600">AI-powered productivity metrics</p>
                </div>
                <Download className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Section */}
        <div className="ai-card p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Attendance Trend</h4>
              <p className="text-sm text-blue-800">
                Overall attendance has improved by 12% this month. Peak attendance occurs on Tuesdays and Wednesdays.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Performance Insight</h4>
              <p className="text-sm text-green-800">
                Teams with flexible schedules show 18% higher productivity scores compared to fixed schedule teams.
              </p>
            </div>
          </div>
        </div>

        {/* Custom Report Builder */}
        <div className="ai-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Filter className="w-5 h-5 text-cyan-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Custom Report Builder</h2>
            </div>
            <button className="ai-button px-4 py-2">
              Create Report
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">
            Build custom reports with AI-powered insights tailored to your specific needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">Quick Templates</h4>
              <p className="text-sm text-gray-600">Pre-built report templates</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
              <p className="text-sm text-gray-600">Select data to include</p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Enable intelligent insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartReportsPage;
