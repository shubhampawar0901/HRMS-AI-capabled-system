import React from 'react';
import { Button } from '../ui/button';

/**
 * HRMS UI Component Examples
 * This file demonstrates how to use the HRMS Design System components
 * Use these examples as reference when implementing modules
 */

const ComponentExamples = () => {
  return (
    <div className="p-8 space-y-12 bg-background">
      {/* Typography Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Typography System</h2>
        <div className="space-y-2">
          <h1 className="text-heading-xl">Heading XL - Main Page Titles</h1>
          <h2 className="text-heading-lg">Heading LG - Section Titles</h2>
          <h3 className="text-heading-md">Heading MD - Subsection Titles</h3>
          <h4 className="text-heading-sm">Heading SM - Card Titles</h4>
          <p className="text-body-lg">Body LG - Important content</p>
          <p className="text-body-md">Body MD - Regular content</p>
          <p className="text-body-sm">Body SM - Secondary content</p>
          <p className="text-body-xs">Body XS - Captions and metadata</p>
          <label className="text-label">Label - Form labels</label>
          <p className="text-caption text-muted-foreground">Caption - Helper text</p>
        </div>
      </section>

      {/* Button Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Button System</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default Button</Button>
          <Button variant="admin">Admin Action</Button>
          <Button variant="manager">Manager Action</Button>
          <Button variant="employee">Employee Action</Button>
          <Button variant="ai">AI Feature</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="destructive">Destructive Action</Button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Button size="sm">Small Button</Button>
          <Button size="default">Default Size</Button>
          <Button size="lg">Large Button</Button>
          <Button size="icon">🔍</Button>
        </div>
      </section>

      {/* Card Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Card System</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="hrms-card">
            <h3 className="text-heading-sm mb-2">Basic Card</h3>
            <p className="text-body-sm text-muted-foreground">
              Standard card with subtle shadow and border.
            </p>
          </div>
          
          <div className="hrms-card-interactive">
            <h3 className="text-heading-sm mb-2">Interactive Card</h3>
            <p className="text-body-sm text-muted-foreground">
              Hover me! This card has smooth hover effects.
            </p>
          </div>
          
          <div className="hrms-card hrms-gradient-primary text-primary-foreground">
            <h3 className="text-heading-sm mb-2">Gradient Card</h3>
            <p className="text-body-sm opacity-90">
              Card with subtle gradient background.
            </p>
          </div>
        </div>
      </section>

      {/* Status Badge Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Status & Role Badges</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="hrms-status-active">Active</span>
            <span className="hrms-status-inactive">Inactive</span>
            <span className="hrms-status-pending">Pending</span>
            <span className="hrms-status-info">Info</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <span className="hrms-role-admin">Admin</span>
            <span className="hrms-role-manager">Manager</span>
            <span className="hrms-role-employee">Employee</span>
          </div>
        </div>
      </section>

      {/* Form Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Form System</h2>
        <div className="hrms-form-container max-w-md">
          <div className="space-y-2">
            <label className="text-label">Employee Name</label>
            <input 
              type="text" 
              className="hrms-input focus-ring" 
              placeholder="Enter employee name"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-label">Department</label>
            <select className="hrms-input focus-ring">
              <option>Select department</option>
              <option>Engineering</option>
              <option>HR</option>
              <option>Sales</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="employee" className="flex-1">Save</Button>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </section>

      {/* Table Example */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Table System</h2>
        <div className="hrms-table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs text-primary-foreground font-medium">JD</span>
                    </div>
                    <span className="text-body-sm font-medium">John Doe</span>
                  </div>
                </td>
                <td><span className="hrms-role-admin">Admin</span></td>
                <td><span className="hrms-status-active">Active</span></td>
                <td>
                  <Button size="sm" variant="ghost">Edit</Button>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-hrms-manager rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">JS</span>
                    </div>
                    <span className="text-body-sm font-medium">Jane Smith</span>
                  </div>
                </td>
                <td><span className="hrms-role-manager">Manager</span></td>
                <td><span className="hrms-status-active">Active</span></td>
                <td>
                  <Button size="sm" variant="ghost">Edit</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Loading States</h2>
        <div className="space-y-4">
          <div className="hrms-card">
            <div className="space-y-3">
              <div className="hrms-skeleton h-4 w-3/4"></div>
              <div className="hrms-skeleton h-4 w-1/2"></div>
              <div className="hrms-skeleton h-8 w-24"></div>
            </div>
          </div>
          
          <div className="hrms-card hrms-shimmer">
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </div>
      </section>

      {/* Animation Examples */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Animation Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="hrms-card animate-fade-in-up">
            <p className="text-body-sm">Fade In Up</p>
          </div>
          <div className="hrms-card animate-slide-in-right">
            <p className="text-body-sm">Slide In Right</p>
          </div>
          <div className="hrms-card animate-bounce-in">
            <p className="text-body-sm">Bounce In</p>
          </div>
          <div className="hrms-card animate-scale-in">
            <p className="text-body-sm">Scale In</p>
          </div>
        </div>
      </section>

      {/* Scale Effects */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Hover Effects</h2>
        <div className="flex gap-4">
          <div className="hrms-card scale-hover-sm">
            <p className="text-body-sm">Hover for small scale</p>
          </div>
          <div className="hrms-card scale-hover-md">
            <p className="text-body-sm">Hover for medium scale</p>
          </div>
          <div className="hrms-card scale-hover-lg">
            <p className="text-body-sm">Hover for large scale</p>
          </div>
        </div>
      </section>

      {/* Dashboard Grid Example */}
      <section className="space-y-4">
        <h2 className="text-heading-lg">Dashboard Grid</h2>
        <div className="hrms-dashboard-grid">
          <div className="hrms-card text-center">
            <h3 className="text-heading-sm text-primary">150</h3>
            <p className="text-body-sm text-muted-foreground">Total Employees</p>
          </div>
          <div className="hrms-card text-center">
            <h3 className="text-heading-sm text-hrms-manager">12</h3>
            <p className="text-body-sm text-muted-foreground">Active Projects</p>
          </div>
          <div className="hrms-card text-center">
            <h3 className="text-heading-sm text-hrms-ai">8</h3>
            <p className="text-body-sm text-muted-foreground">AI Insights</p>
          </div>
          <div className="hrms-card text-center">
            <h3 className="text-heading-sm text-hrms-employee">98%</h3>
            <p className="text-body-sm text-muted-foreground">System Health</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ComponentExamples;
