import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import ResumeUpload from './ResumeUpload';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  X,
  ChevronDown
} from 'lucide-react';

const EmployeeForm = ({ employeeId, onSuccess, onCancel }) => {
  const {
    formData,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    departments,
    availableManagers,
    apiError,
    apiSuccess,
    handleChange,
    handleSubmit,
    resetForm,
    isEditing,
    handleResumeParseSuccess,
    resumeParseSuccess,
    resumeParseMessage
  } = useEmployeeForm(employeeId);

  const handleFormSubmit = async (e) => {
    const result = await handleSubmit(e);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        if (onCancel) onCancel();
      }
    } else {
      if (onCancel) onCancel();
    }
  };

  const renderField = (field, label, type = 'text', options = {}) => {
    const { placeholder, required = false, icon: Icon, disabled = false } = options;
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          )}
          {type === 'textarea' ? (
            <Textarea
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`${Icon ? 'pl-10' : ''} ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              rows={3}
            />
          ) : type === 'select' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between ${Icon ? 'pl-10' : ''} ${errors[field] ? 'border-red-300' : ''}`}
                  disabled={disabled}
                >
                  {formData[field] ? (
                    options.options?.find(opt => opt.value === formData[field])?.label || formData[field]
                  ) : (
                    <span className="text-gray-500">{placeholder}</span>
                  )}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {options.options?.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleChange(field, option.value)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Input
              type={type}
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`${Icon ? 'pl-10' : ''} ${errors[field] ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
          )}
        </div>
        {errors[field] && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors[field]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update employee information' : 'Fill in the details to add a new employee'}
          </p>
        </div>
      </div>

      {/* Error/Success Messages */}
      {apiError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <div className="ml-2">
            <p className="text-red-800">{apiError}</p>
          </div>
        </Alert>
      )}

      {apiSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <div className="ml-2">
            <p className="text-green-800">{apiSuccess}</p>
          </div>
        </Alert>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Resume Parse Success Notification */}
        {resumeParseMessage && (
          <Alert className={`${resumeParseSuccess ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
            {resumeParseSuccess ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-blue-600" />
            )}
            <div className="ml-2">
              <p className={`font-medium ${resumeParseSuccess ? 'text-green-800' : 'text-blue-800'}`}>
                {resumeParseMessage}
              </p>
            </div>
          </Alert>
        )}

        {/* Personal Information */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('firstName', 'First Name', 'text', {
              placeholder: 'Enter first name',
              required: true,
              icon: User
            })}
            
            {renderField('lastName', 'Last Name', 'text', {
              placeholder: 'Enter last name',
              required: true,
              icon: User
            })}
            
            {renderField('email', 'Email Address', 'email', {
              placeholder: 'Enter email address',
              required: true,
              icon: Mail
            })}
            
            {renderField('phone', 'Phone Number', 'tel', {
              placeholder: 'Enter phone number',
              icon: Phone
            })}
            
            {renderField('dateOfBirth', 'Date of Birth', 'date', {
              icon: Calendar
            })}
            
            {renderField('gender', 'Gender', 'select', {
              placeholder: 'Select gender',
              options: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' }
              ]
            })}
            
            <div className="md:col-span-2">
              {renderField('address', 'Address', 'textarea', {
                placeholder: 'Enter full address',
                icon: MapPin
              })}
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload Section - Only show for new employees */}
        {!isEditing && (
          <ResumeUpload
            onParseSuccess={handleResumeParseSuccess}
            onError={(error) => console.error('Resume parse error:', error)}
          />
        )}

        {/* Employment Information */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-green-600" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('departmentId', 'Department', 'select', {
              placeholder: 'Select department',
              required: true,
              icon: Building2,
              options: departments.map(dept => ({
                value: dept.id.toString(),
                label: dept.name
              }))
            })}
            
            {renderField('position', 'Position', 'text', {
              placeholder: 'Enter job position',
              required: true,
              icon: User
            })}
            
            {renderField('hireDate', 'Hire Date', 'date', {
              required: true,
              icon: Calendar
            })}
            
            {renderField('basicSalary', 'Basic Salary', 'number', {
              placeholder: 'Enter basic salary',
              icon: DollarSign
            })}
            
            {renderField('managerId', 'Manager', 'select', {
              placeholder: 'Select manager (optional)',
              icon: Users,
              options: availableManagers.map(manager => ({
                value: manager.id.toString(),
                label: `${manager.name} (${manager.department})`
              }))
            })}
            
            {renderField('status', 'Status', 'select', {
              placeholder: 'Select status',
              required: true,
              options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'terminated', label: 'Terminated' }
              ]
            })}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-red-600" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField('emergencyContact', 'Emergency Contact Name', 'text', {
              placeholder: 'Enter emergency contact name',
              icon: User
            })}
            
            {renderField('emergencyPhone', 'Emergency Contact Phone', 'tel', {
              placeholder: 'Enter emergency contact phone',
              icon: Phone
            })}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Employee' : 'Create Employee'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
