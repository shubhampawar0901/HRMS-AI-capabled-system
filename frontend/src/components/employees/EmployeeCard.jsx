import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const EmployeeCard = ({ employee, onEdit, onDelete, onView, showActions = true }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onView) {
      onView(employee.id);
    } else {
      navigate(`/employees/${employee.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(employee.id);
    } else {
      navigate(`/employees/${employee.id}/edit`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(employee.id);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <Card 
      className="hrms-card hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] border border-gray-200"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(employee.firstName, employee.lastName)}
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-600">{employee.position}</p>
              <p className="text-xs text-gray-500">ID: {employee.employeeCode || employee.id}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(employee.status)} font-medium`}>
            {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="h-4 w-4 text-blue-500" />
            <span className="truncate">{employee.email}</span>
          </div>
          
          {employee.phone && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Phone className="h-4 w-4 text-green-500" />
              <span>{employee.phone}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span>{employee.departmentName || 'N/A'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span>Joined: {formatDate(employee.hireDate)}</span>
          </div>

          {employee.address && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4 text-red-500" />
              <span className="truncate">{employee.address}</span>
            </div>
          )}
        </div>

        {employee.basicSalary && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Basic Salary</span>
              <span className="font-semibold text-green-600">
                ₹{employee.basicSalary.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {showActions && (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCardClick}
                className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="hover:bg-green-50 hover:border-green-300 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
