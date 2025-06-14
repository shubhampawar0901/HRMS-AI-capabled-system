import { lazy } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Lazy load Smart Reports pages for better performance
const AdminSmartReports = lazy(() => import('@/pages/admin/SmartReports'));
const ManagerSmartReports = lazy(() => import('@/pages/manager/SmartReports'));
const EmployeeSmartReports = lazy(() => import('@/pages/employee/SmartReports'));

/**
 * Smart Reports Routes Configuration
 * Defines all routes related to Smart Reports functionality with role-based access
 */
export const smartReportsRoutes = [
  // Admin Smart Reports Route
  {
    path: '/admin/smart-reports',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminSmartReports />
      </ProtectedRoute>
    ),
    roles: ['admin'],
    title: 'Smart Reports - Admin',
    description: 'AI-powered performance reports with full administrative access'
  },

  // Manager Smart Reports Route
  {
    path: '/manager/smart-reports',
    element: (
      <ProtectedRoute allowedRoles={['manager']}>
        <ManagerSmartReports />
      </ProtectedRoute>
    ),
    roles: ['manager'],
    title: 'Team Smart Reports - Manager',
    description: 'AI-powered performance reports for team management'
  },

  // Employee Smart Reports Route
  {
    path: '/employee/smart-reports',
    element: (
      <ProtectedRoute allowedRoles={['employee']}>
        <EmployeeSmartReports />
      </ProtectedRoute>
    ),
    roles: ['employee'],
    title: 'My Performance Reports - Employee',
    description: 'View AI-generated performance insights and recommendations'
  }
];

/**
 * Get Smart Reports route for specific user role
 * @param {string} role - User role ('admin', 'manager', 'employee')
 * @returns {string|null} Route path for the user's role
 */
export const getSmartReportsRouteForRole = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/smart-reports';
    case 'manager':
      return '/manager/smart-reports';
    case 'employee':
      return '/employee/smart-reports';
    default:
      return null;
  }
};

/**
 * Check if user has access to Smart Reports
 * @param {string} role - User role
 * @returns {boolean} Whether user can access Smart Reports
 */
export const hasSmartReportsAccess = (role) => {
  return ['admin', 'manager', 'employee'].includes(role);
};

/**
 * Get Smart Reports navigation item for sidebar
 * @param {string} role - User role
 * @returns {Object|null} Navigation item configuration
 */
export const getSmartReportsNavItem = (role) => {
  if (!hasSmartReportsAccess(role)) {
    return null;
  }

  const route = getSmartReportsRouteForRole(role);
  
  return {
    name: 'Smart Reports',
    href: route,
    icon: 'SparklesIcon', // Heroicons icon name
    roles: [role],
    badge: role === 'admin' ? 'AI' : null,
    description: role === 'admin' 
      ? 'AI-powered performance analytics'
      : role === 'manager'
      ? 'Team performance insights'
      : 'My performance reports'
  };
};

/**
 * Smart Reports breadcrumb configuration
 */
export const smartReportsBreadcrumbs = {
  '/admin/smart-reports': [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Smart Reports', href: '/admin/smart-reports' }
  ],
  '/manager/smart-reports': [
    { name: 'Dashboard', href: '/manager/dashboard' },
    { name: 'Team Smart Reports', href: '/manager/smart-reports' }
  ],
  '/employee/smart-reports': [
    { name: 'Dashboard', href: '/employee/dashboard' },
    { name: 'My Reports', href: '/employee/smart-reports' }
  ]
};

/**
 * Smart Reports feature flags and permissions
 */
export const smartReportsConfig = {
  // Feature flags
  features: {
    reportGeneration: {
      admin: true,
      manager: true,
      employee: false
    },
    reportViewing: {
      admin: true,
      manager: true,
      employee: true
    },
    reportSharing: {
      admin: true,
      manager: true,
      employee: false
    },
    reportExport: {
      admin: true,
      manager: true,
      employee: true
    },
    dataSnapshot: {
      admin: true,
      manager: true,
      employee: true
    }
  },

  // Access levels
  access: {
    admin: {
      canViewAll: true,
      canGenerateForAny: true,
      canDeleteAny: true,
      canManageSettings: true
    },
    manager: {
      canViewAll: false,
      canGenerateForTeam: true,
      canDeleteOwn: true,
      canManageSettings: false
    },
    employee: {
      canViewAll: false,
      canGenerateForTeam: false,
      canDeleteOwn: false,
      canManageSettings: false
    }
  },

  // Report types available to each role
  reportTypes: {
    admin: ['employee', 'team', 'department'],
    manager: ['employee', 'team'],
    employee: []
  }
};

/**
 * Get available features for user role
 * @param {string} role - User role
 * @returns {Object} Available features for the role
 */
export const getSmartReportsFeatures = (role) => {
  const features = {};
  
  Object.keys(smartReportsConfig.features).forEach(feature => {
    features[feature] = smartReportsConfig.features[feature][role] || false;
  });
  
  return features;
};

/**
 * Get access permissions for user role
 * @param {string} role - User role
 * @returns {Object} Access permissions for the role
 */
export const getSmartReportsAccess = (role) => {
  return smartReportsConfig.access[role] || {};
};

/**
 * Get available report types for user role
 * @param {string} role - User role
 * @returns {Array} Available report types
 */
export const getAvailableReportTypes = (role) => {
  return smartReportsConfig.reportTypes[role] || [];
};

export default smartReportsRoutes;
