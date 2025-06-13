import React from 'react';
import { Button } from '../../../shared/ui/button';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <Button variant="admin">Admin Actions</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-2">Total Employees</h3>
          <p className="text-3xl font-bold text-primary">150</p>
          <p className="text-sm text-muted-foreground">+5 this month</p>
        </div>
        
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
          <p className="text-3xl font-bold text-hrms-manager">12</p>
          <p className="text-sm text-muted-foreground">3 new this week</p>
        </div>
        
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-2">Pending Approvals</h3>
          <p className="text-3xl font-bold text-hrms-ai">8</p>
          <p className="text-sm text-muted-foreground">Requires attention</p>
        </div>
        
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-2">System Health</h3>
          <p className="text-3xl font-bold text-hrms-employee">98%</p>
          <p className="text-sm text-muted-foreground">All systems operational</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">New employee onboarded</span>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Leave request approved</span>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Performance review completed</span>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
        
        <div className="hrms-card">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          <div className="space-y-3">
            <div className="p-3 bg-hrms-ai/10 rounded-md">
              <p className="text-sm font-medium">Attrition Risk Alert</p>
              <p className="text-xs text-muted-foreground">3 employees at high risk</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-md">
              <p className="text-sm font-medium">Performance Trend</p>
              <p className="text-xs text-muted-foreground">Overall performance up 12%</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-muted-foreground">
        <p>This is a placeholder Admin Dashboard.</p>
        <p>Will be implemented by the Dashboard Module Agent.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
