import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { formatDate, getRelativeTime } from '@/utils/dateUtils';

const RecentActivity = ({ activities = [], isLoading = false }) => {
  const getActivityIcon = (type) => {
    const icons = {
      attendance: Clock,
      leave: Calendar,
      payroll: FileText,
      performance: CheckCircle,
      employee: User,
      system: AlertCircle
    };
    return icons[type] || Activity;
  };

  const getActivityColor = (type, status) => {
    if (status === 'approved') return 'green';
    if (status === 'rejected') return 'red';
    if (status === 'pending') return 'yellow';
    
    const colors = {
      attendance: 'blue',
      leave: 'purple',
      payroll: 'green',
      performance: 'indigo',
      employee: 'orange',
      system: 'gray'
    };
    return colors[type] || 'blue';
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'success':
        return 'default';
      case 'rejected':
      case 'failed':
        return 'destructive';
      case 'pending':
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const defaultActivities = [
    {
      id: 1,
      type: 'attendance',
      title: 'Checked in for today',
      description: 'Attendance marked at 9:15 AM',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      user: 'You'
    },
    {
      id: 2,
      type: 'leave',
      title: 'Leave request submitted',
      description: 'Annual leave for 3 days requested',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'pending',
      user: 'You'
    },
    {
      id: 3,
      type: 'payroll',
      title: 'Payslip generated',
      description: 'Monthly payslip for December 2024',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: 'completed',
      user: 'System'
    }
  ];

  const activityList = activities.length > 0 ? activities : defaultActivities;

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activityList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityList.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type, activity.status);
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className={`
                    p-2 rounded-full bg-gradient-to-r 
                    ${color === 'blue' ? 'from-blue-100 to-blue-200' : ''}
                    ${color === 'green' ? 'from-green-100 to-green-200' : ''}
                    ${color === 'purple' ? 'from-purple-100 to-purple-200' : ''}
                    ${color === 'orange' ? 'from-orange-100 to-orange-200' : ''}
                    ${color === 'red' ? 'from-red-100 to-red-200' : ''}
                    ${color === 'yellow' ? 'from-yellow-100 to-yellow-200' : ''}
                    ${color === 'gray' ? 'from-gray-100 to-gray-200' : ''}
                  `}>
                    <IconComponent className={`
                      w-4 h-4 
                      ${color === 'blue' ? 'text-blue-600' : ''}
                      ${color === 'green' ? 'text-green-600' : ''}
                      ${color === 'purple' ? 'text-purple-600' : ''}
                      ${color === 'orange' ? 'text-orange-600' : ''}
                      ${color === 'red' ? 'text-red-600' : ''}
                      ${color === 'yellow' ? 'text-yellow-600' : ''}
                      ${color === 'gray' ? 'text-gray-600' : ''}
                    `} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {activity.status && (
                        <Badge 
                          variant={getBadgeVariant(activity.status)}
                          className="ml-2 text-xs"
                        >
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        by {activity.user || 'System'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activityList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
