import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import EmployeeCard from './EmployeeCard';
import EmployeeSearch from './EmployeeSearch';
import { useEmployees, useEmployeeMutations, useDepartments } from '@/hooks/useEmployees';
import {
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';

const EmployeeList = () => {
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Use hooks for employee management
  const {
    employees,
    pagination,
    filters,
    isLoading,
    error: listError,
    fetchEmployees,
    updateFilters,
    searchEmployees,
    goToPage,
    nextPage,
    prevPage,
    clearError: clearListError
  } = useEmployees();

  const {
    isLoading: isDeleting,
    error: deleteError,
    success: deleteSuccess,
    deleteEmployee,
    clearMessages
  } = useEmployeeMutations();

  const { departments } = useDepartments();

  // Note: fetchEmployees is now called automatically by the useEmployees hook

  const handleSearch = (searchTerm) => {
    searchEmployees(searchTerm);
  };

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleAddEmployee = () => {
    navigate('/employees/add');
  };

  const handleViewEmployee = (id) => {
    navigate(`/employees/${id}`);
  };

  const handleEditEmployee = (id) => {
    navigate(`/employees/${id}/edit`);
  };

  const handleDeleteEmployee = (id) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      const result = await deleteEmployee(deleteConfirm);
      if (result.success) {
        setDeleteConfirm(null);
        // Refresh the employee list
        fetchEmployees();
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === pagination.page ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} employees
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={pagination.page === 1}
            className="hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          {pages}
          
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={pagination.page === pagination.pages}
            className="hover:bg-gray-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-600">Manage your organization's employees</p>
          </div>
        </div>
        <Button 
          onClick={handleAddEmployee}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Success/Error Messages */}
      {(listError || deleteError) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="text-red-800">{listError || deleteError}</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                clearListError();
                clearMessages();
              }}
              className="text-red-600 p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {deleteSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <div className="ml-2">
            <p className="text-green-800">{deleteSuccess}</p>
            <Button
              variant="link"
              size="sm"
              onClick={clearMessages}
              className="text-green-600 p-0 h-auto"
            >
              Dismiss
            </Button>
          </div>
        </Alert>
      )}

      {/* Search and Filters */}
      <EmployeeSearch
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        departments={departments}
        filters={filters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading employees...</span>
        </div>
      )}

      {/* Employee Grid */}
      {!isLoading && (
        <>
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.departmentId || filters.status !== 'active'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Get started by adding your first employee.'}
              </p>
              <Button onClick={handleAddEmployee} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={handleViewEmployee}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Employee</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this employee? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={cancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
