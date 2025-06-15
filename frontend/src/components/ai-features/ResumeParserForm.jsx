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
import { useResumeParser } from '@/hooks/useResumeParser';
import ResumeUpload from '@/components/employees/ResumeUpload';
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
  ChevronDown,
  FileText,
  UserPlus,
  Sparkles
} from 'lucide-react';

const ResumeParserForm = ({ onCancel }) => {
  const {
    formData,
    errors,
    isDirty,
    isValid,
    isCreatingEmployee,
    departments,
    availableManagers,
    apiError,
    apiSuccess,
    handleChange,
    validateForm,
    resetForm,
    handleResumeParseSuccess,
    createEmployee,
    resumeParseSuccess,
    resumeParseMessage,
    employeeCreationSuccess,
    createdEmployeeDetails
  } = useResumeParser();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await createEmployee();
    // Success handling is now done internally in the hook
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

    // Consistent focus styling for all input types
    const baseFocusClasses = "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:shadow-sm";
    const baseClasses = "border-gray-300 hover:border-gray-400 transition-all duration-200 ring-0";
    const errorClasses = errors[field] ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "";

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
          )}
          {type === 'textarea' ? (
            <Textarea
              value={formData[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={`${Icon ? 'pl-10' : ''} ${baseClasses} ${baseFocusClasses} ${errorClasses}`}
              style={{
                boxShadow: 'none',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 1px rgb(59 130 246)';
                e.target.style.borderColor = 'rgb(59 130 246)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = errors[field] ? 'rgb(252 165 165)' : 'rgb(209 213 219)';
              }}
              rows={3}
            />
          ) : type === 'select' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-between ${Icon ? 'pl-10' : ''} ${baseClasses} ${baseFocusClasses} ${errorClasses} bg-white`}
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
                    className="hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-200"
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
              className={`${Icon ? 'pl-10' : ''} ${baseClasses} ${baseFocusClasses} ${errorClasses}`}
              style={{
                boxShadow: 'none',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = '0 0 0 1px rgb(59 130 246)';
                e.target.style.borderColor = 'rgb(59 130 246)';
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = errors[field] ? 'rgb(252 165 165)' : 'rgb(209 213 219)';
              }}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 text-blue-500" />
            AI Resume Parser
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a resume and let AI extract employee information for you
          </p>
        </div>

        {/* Error/Success Messages */}
        {apiError && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="ml-2">
              <p className="text-red-800">{apiError}</p>
            </div>
          </Alert>
        )}

        {apiSuccess && (
          <Alert className="border-green-200 bg-green-50 mb-6">
            <div className="ml-2">
              <p className="text-green-800">{apiSuccess}</p>
            </div>
          </Alert>
        )}

        {/* Employee Creation Success Notification */}
        {employeeCreationSuccess && createdEmployeeDetails && (
          <Alert className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 mb-6 shadow-lg animate-in slide-in-from-top-2 duration-500">
            <CheckCircle className="h-6 w-6 text-green-600 animate-pulse" />
            <div className="ml-3">
              <h4 className="text-green-800 font-bold text-xl mb-3 flex items-center">
                🎉 Employee Created Successfully!
                <Sparkles className="h-5 w-5 ml-2 text-green-600 animate-bounce" />
              </h4>
              <div className="text-green-700 space-y-2 bg-white/50 p-3 rounded-lg border border-green-200">
                <p className="flex items-center"><strong className="w-32">Name:</strong> {createdEmployeeDetails.firstName} {createdEmployeeDetails.lastName}</p>
                <p className="flex items-center"><strong className="w-32">Employee Code:</strong> <span className="font-mono bg-green-100 px-2 py-1 rounded text-green-800">{createdEmployeeDetails.employeeCode}</span></p>
                <p className="flex items-center"><strong className="w-32">Department:</strong> {departments.find(d => d.id.toString() === createdEmployeeDetails.departmentId)?.name || 'N/A'}</p>
                <p className="flex items-center"><strong className="w-32">Position:</strong> {createdEmployeeDetails.position}</p>
              </div>
              <p className="text-green-600 text-sm mt-3 italic flex items-center justify-center bg-green-100 p-2 rounded-lg">
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Form will be reset automatically for the next employee in 3 seconds...
              </p>
            </div>
          </Alert>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
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

              {/* Resume Upload Section */}
              <ResumeUpload
                onParseSuccess={handleResumeParseSuccess}
                onError={(error) => console.error('Resume parse error:', error)}
              />

              {/* Personal Information */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-medium text-gray-800">
                    <User className="h-5 w-5 mr-2 text-blue-500" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    required: true,
                    icon: Calendar
                  })}
                  
                  {renderField('gender', 'Gender', 'select', {
                    placeholder: 'Select gender',
                    required: true,
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

              {/* Employment Information */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-medium text-gray-800">
                    <Building2 className="h-5 w-5 mr-2 text-green-500" />
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center text-lg font-medium text-gray-800">
                    <Phone className="h-5 w-5 mr-2 text-red-500" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={isCreatingEmployee}
                  className="hover:bg-gray-50 transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  disabled={isCreatingEmployee || !isDirty}
                  className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>

                <Button
                  type="submit"
                  disabled={!isValid || isCreatingEmployee}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  {isCreatingEmployee ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Employee...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Employee
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Right Column - Employee Summary Cart */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl font-bold">
                    <User className="h-6 w-6 mr-2" />
                    Employee Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Personal Info Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-800">
                          {formData.firstName || formData.lastName
                            ? `${formData.firstName || ''} ${formData.lastName || ''}`.trim()
                            : 'Not provided'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-800">{formData.email || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-800">{formData.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-800 capitalize">{formData.gender || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Employment Info Summary */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Employment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium text-gray-800">
                          {departments.find(d => d.id.toString() === formData.departmentId)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium text-gray-800">{formData.position || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hire Date:</span>
                        <span className="font-medium text-gray-800">{formData.hireDate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Salary:</span>
                        <span className="font-medium text-gray-800">
                          {formData.basicSalary ? `$${Number(formData.basicSalary).toLocaleString()}` : 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium capitalize px-2 py-1 rounded-full text-xs ${
                          formData.status === 'active' ? 'bg-green-100 text-green-800' :
                          formData.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          formData.status === 'terminated' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formData.status || 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Summary */}
                  {(formData.emergencyContact || formData.emergencyPhone) && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Emergency Contact</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-800">{formData.emergencyContact || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-gray-800">{formData.emergencyPhone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Status */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Form Status:</span>
                      <div className="flex items-center">
                        {isValid ? (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Ready to Submit</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Incomplete</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Debug Info - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Valid: {isValid ? 'Yes' : 'No'}</div>
                        <div>Errors: {Object.keys(errors).length}</div>
                        <div>Required fields filled: {
                          [
                            formData.firstName?.trim() ? 'firstName' : null,
                            formData.lastName?.trim() ? 'lastName' : null,
                            formData.email?.trim() ? 'email' : null,
                            formData.departmentId ? 'department' : null,
                            formData.position?.trim() ? 'position' : null,
                            formData.hireDate ? 'hireDate' : null
                          ].filter(Boolean).join(', ') || 'None'
                        }</div>
                        {Object.keys(errors).length > 0 && (
                          <div>Current errors: {Object.keys(errors).join(', ')}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI Enhancement Badge */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">AI-Enhanced Resume Parser</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeParserForm;
