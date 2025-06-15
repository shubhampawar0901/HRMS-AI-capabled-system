import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  Calendar,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  UserPlus,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Brain,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickActions = ({ actions = [], userRole = 'employee' }) => {
  const navigate = useNavigate();

  // Icon mapping for string-based icon names
  const getIconComponent = (iconName) => {
    const iconMap = {
      'UserPlus': UserPlus,
      'TrendingDown': TrendingDown,
      'DollarSign': DollarSign,
      'Calendar': Calendar,
      'BarChart3': BarChart3,
      'CheckCircle': CheckCircle,
      'FileText': FileText,
      'Brain': Brain,
      'Clock': Clock,
      'User': User,
      'Users': Users,
      'MessageSquare': MessageSquare,
      'Settings': Settings,
      'Plus': Plus
    };
    return iconMap[iconName] || Plus;
  };

  // Memoize default actions based on user role
  const getDefaultActions = useMemo(() => {
    const baseActions = [
      {
        id: 'check-in',
        title: 'Check In/Out',
        description: 'Mark your attendance',
        icon: Clock,
        color: 'blue',
        path: '/attendance'
      },
      {
        id: 'apply-leave',
        title: 'Apply Leave',
        description: 'Request time off',
        icon: Calendar,
        color: 'green',
        path: '/leave/apply'
      },
      {
        id: 'view-payslip',
        title: 'View Payslip',
        description: 'Check your salary details',
        icon: FileText,
        color: 'purple',
        path: '/payroll'
      }
    ];

    if (userRole === 'admin' || userRole === 'manager') {
      baseActions.push(
        {
          id: 'manage-employees',
          title: 'Manage Employees',
          description: 'Add or edit employee data',
          icon: Users,
          color: 'orange',
          path: '/employees'
        },
        {
          id: 'view-reports',
          title: 'View Reports',
          description: 'Generate and view reports',
          icon: BarChart3,
          color: 'indigo',
          path: '/reports'
        }
      );
    }

    if (userRole === 'admin') {
      baseActions.push(
        {
          id: 'ai-features',
          title: 'AI Features',
          description: 'Access AI-powered tools',
          icon: MessageSquare,
          color: 'red',
          path: '/ai-features'
        },
        {
          id: 'settings',
          title: 'Settings',
          description: 'System configuration',
          icon: Settings,
          color: 'gray',
          path: '/settings'
        }
      );
    }

    return baseActions;
  }, [userRole]);

  // Memoize actions list
  const actionsList = useMemo(() =>
    actions.length > 0 ? actions : getDefaultActions,
    [actions, getDefaultActions]
  );

  // Memoize color classes function
  const getColorClasses = useCallback((color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      indigo: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      gray: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
    };
    return colors[color] || colors.blue;
  }, []);

  // Memoize action click handler
  const handleActionClick = useCallback((action) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.path) {
      navigate(action.path);
    }
  }, [navigate]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Plus className="w-5 h-5 mr-2 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionsList.map((action) => {
            const IconComponent = typeof action.icon === 'string'
              ? getIconComponent(action.icon)
              : action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`
                  h-auto p-4 flex flex-col items-center space-y-2
                  bg-gradient-to-r ${getColorClasses(action.color)}
                  text-white border-0 shadow-md hover:shadow-lg
                  transition-all duration-300 transform hover:scale-105
                `}
                onClick={() => handleActionClick(action)}
              >
                <IconComponent className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-90 mt-1">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(QuickActions);
