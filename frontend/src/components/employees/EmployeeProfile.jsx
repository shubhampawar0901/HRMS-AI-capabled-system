import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Alert } from '@/components/ui/alert';
import DocumentUpload from './DocumentUpload';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2,
  DollarSign,
  Users,
  Edit,
  ArrowLeft,
  FileText,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  UserMinus
} from 'lucide-react';

const EmployeeProfile = ({ employee, isLoading, error, onEdit }) => {
  const navigate = useNavigate();
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading employee details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <div className="ml-2">
          <p className="text-red-800">{error}</p>
        </div>
      </Alert>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Employee not found</h3>
        <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/employees')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <UserCheck className="h-4 w-4" />;
      case 'inactive':
        return <UserMinus className="h-4 w-4" />;
      case 'terminated':
        return <UserX className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    } else {
      navigate(`/employees/${employee.id}/edit`);
    }
  };

  const handleBack = () => {
    navigate('/employees');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBack} className="hover:bg-gray-50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-600">View and manage employee information</p>
          </div>
        </div>
        <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="h-4 w-4 mr-2" />
          Edit Employee
        </Button>
      </div>

      {/* Profile Overview */}
      <Card className="hrms-card">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
              {getInitials(employee.firstName, employee.lastName)}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                </h2>
                <Badge className={`${getStatusColor(employee.status)} flex items-center space-x-1`}>
                  {getStatusIcon(employee.status)}
                  <span className="capitalize">{employee.status}</span>
                </Badge>
              </div>
              <p className="text-lg text-gray-600 mb-2">{employee.position}</p>
              <p className="text-sm text-gray-500 mb-4">
                Employee ID: {employee.employeeCode || employee.id}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{employee.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  <span>{employee.departmentName || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-gray-900">{employee.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Name</label>
                <p className="text-gray-900">{employee.lastName}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{employee.email}</p>
            </div>
            
            {employee.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
            )}
            
            {employee.dateOfBirth && (
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{formatDate(employee.dateOfBirth)}</p>
              </div>
            )}
            
            {employee.gender && (
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="text-gray-900 capitalize">{employee.gender}</p>
              </div>
            )}
            
            {employee.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-gray-900">{employee.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-green-600" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Department</label>
              <p className="text-gray-900">{employee.departmentName || 'N/A'}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Position</label>
              <p className="text-gray-900">{employee.position}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Hire Date</label>
              <p className="text-gray-900">{formatDate(employee.hireDate)}</p>
            </div>
            
            {employee.basicSalary && (
              <div>
                <label className="text-sm font-medium text-gray-500">Basic Salary</label>
                <p className="text-gray-900 font-semibold text-green-600">
                  ₹{employee.basicSalary.toLocaleString()}
                </p>
              </div>
            )}
            
            {employee.managerName && (
              <div>
                <label className="text-sm font-medium text-gray-500">Manager</label>
                <p className="text-gray-900">{employee.managerName}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge className={`${getStatusColor(employee.status)} mt-1`}>
                {getStatusIcon(employee.status)}
                <span className="ml-1 capitalize">{employee.status}</span>
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        {(employee.emergencyContact || employee.emergencyPhone) && (
          <Card className="hrms-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-red-600" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {employee.emergencyContact && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Name</label>
                  <p className="text-gray-900">{employee.emergencyContact}</p>
                </div>
              )}
              
              {employee.emergencyPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                  <p className="text-gray-900">{employee.emergencyPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        <Card className="hrms-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-600" />
                Documents
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocumentUpload(true)}
                className="hover:bg-orange-50"
              >
                Upload Document
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.documents && employee.documents.length > 0 ? (
              <div className="space-y-2">
                {employee.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <Badge variant="secondary">{doc.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No documents uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document Upload Modal */}
      {showDocumentUpload && (
        <DocumentUpload
          employeeId={employee.id}
          onClose={() => setShowDocumentUpload(false)}
          onSuccess={() => {
            setShowDocumentUpload(false);
            // Refresh employee data
          }}
        />
      )}
    </div>
  );
};

export default EmployeeProfile;
