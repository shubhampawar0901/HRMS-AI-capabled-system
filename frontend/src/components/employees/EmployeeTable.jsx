import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatUtils';

const EmployeeTable = ({
  employees = [],
  pagination = {},
  isLoading = false,
  onEdit,
  onDelete,
  onView,
  onPageChange,
  showActions = true
}) => {
  const navigate = useNavigate();





  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
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

  const handleRowClick = (employee) => {
    if (onView) {
      onView(employee.id);
    } else {
      navigate(`/employees/${employee.id}`);
    }
  };

  const handleEdit = (e, employeeId) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(employeeId);
    } else {
      navigate(`/employees/${employeeId}/edit`);
    }
  };

  const handleDelete = (e, employeeId) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(employeeId);
    }
  };

  const handleView = (e, employeeId) => {
    e.stopPropagation();
    if (onView) {
      onView(employeeId);
    } else {
      navigate(`/employees/${employeeId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
        <p className="text-gray-600">No employees match your current search criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <div className="min-w-[1150px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                  <TableHead className="font-semibold text-gray-900 w-[250px]">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[120px]">Employee ID</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[150px]">Position</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[150px]">Department</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[180px]">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[120px]">Hire Date</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[120px]">Salary</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[100px]">Status</TableHead>
                  {showActions && (
                    <TableHead className="font-semibold text-gray-900 text-center w-[120px]">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-b border-gray-100"
                  onClick={() => handleRowClick(employee)}
                >
                  {/* Employee Info */}
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Employee ID */}
                  <TableCell className="py-4">
                    <div className="font-medium text-gray-900">
                      {employee.employeeCode || employee.id}
                    </div>
                  </TableCell>

                  {/* Position */}
                  <TableCell className="py-4">
                    <div className="font-medium text-gray-900">
                      {employee.position || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Department */}
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-900 font-medium">
                        {employee.departmentName || 'N/A'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Contact */}
                  <TableCell className="py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3 text-blue-500" />
                        <span className="truncate max-w-[150px]">{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3 text-green-500" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Hire Date */}
                  <TableCell className="py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3 text-orange-500" />
                      <span>{formatDate(employee.hireDate)}</span>
                    </div>
                  </TableCell>

                  {/* Salary */}
                  <TableCell className="py-4">
                    <div className="font-medium text-gray-900">
                      {employee.basicSalary ? formatCurrency(employee.basicSalary) : 'N/A'}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4">
                    <Badge className={`${getStatusColor(employee.status)} capitalize`}>
                      {employee.status || 'active'}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  {showActions && (
                    <TableCell className="py-4">
                      <div className="flex items-center justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => handleView(e, employee.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleEdit(e, employee.id)}
                              className="cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => handleDelete(e, employee.id)}
                              className="cursor-pointer text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} employees
            </div>

            {pagination.pages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <span className="text-sm font-medium text-gray-700 px-3">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <Button
                  onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
