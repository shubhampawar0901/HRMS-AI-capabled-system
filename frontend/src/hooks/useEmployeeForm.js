import { useState, useEffect, useCallback } from 'react';
import { useEmployees } from './useEmployees';

const initialFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  departmentId: '',
  position: '',
  hireDate: '',
  basicSalary: '',
  managerId: '',
  emergencyContact: '',
  emergencyPhone: '',
  status: 'active'
};

export const useEmployeeForm = (employeeId = null) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const {
    currentEmployee,
    departments,
    addEmployee,
    editEmployee,
    loadEmployee,
    clearEmployee,
    error: apiError,
    success: apiSuccess
  } = useEmployees();

  // Load employee data if editing
  useEffect(() => {
    if (employeeId) {
      loadEmployee(employeeId);
    } else {
      clearEmployee();
    }
  }, [employeeId, loadEmployee, clearEmployee]);

  // Populate form when employee data is loaded
  useEffect(() => {
    if (currentEmployee && employeeId) {
      setFormData({
        firstName: currentEmployee.firstName || '',
        lastName: currentEmployee.lastName || '',
        email: currentEmployee.email || '',
        phone: currentEmployee.phone || '',
        dateOfBirth: currentEmployee.dateOfBirth ? currentEmployee.dateOfBirth.split('T')[0] : '',
        gender: currentEmployee.gender || '',
        address: currentEmployee.address || '',
        departmentId: currentEmployee.departmentId || '',
        position: currentEmployee.position || '',
        hireDate: currentEmployee.hireDate ? currentEmployee.hireDate.split('T')[0] : '',
        basicSalary: currentEmployee.basicSalary || '',
        managerId: currentEmployee.managerId || '',
        emergencyContact: currentEmployee.emergencyContact || '',
        emergencyPhone: currentEmployee.emergencyPhone || '',
        status: currentEmployee.status || 'active'
      });
      setIsDirty(false);
    }
  }, [currentEmployee, employeeId]);

  // Handle form field changes
  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department is required';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.hireDate) {
      newErrors.hireDate = 'Hire date is required';
    }

    // Optional field validations
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (formData.emergencyPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'Emergency phone number is invalid';
    }
    if (formData.basicSalary && (isNaN(formData.basicSalary) || parseFloat(formData.basicSalary) < 0)) {
      newErrors.basicSalary = 'Basic salary must be a positive number';
    }
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      newErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    if (formData.hireDate && new Date(formData.hireDate) > new Date()) {
      newErrors.hireDate = 'Hire date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      return { success: false, errors };
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : null,
        departmentId: parseInt(formData.departmentId),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      let result;
      if (employeeId) {
        result = await editEmployee(employeeId, submitData);
      } else {
        result = await addEmployee(submitData);
      }

      if (result.success) {
        setIsDirty(false);
        if (!employeeId) {
          resetForm();
        }
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, employeeId, addEmployee, editEmployee, errors]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsDirty(false);
  }, []);

  // Check if form is valid
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0 && 
           formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.departmentId && 
           formData.position && 
           formData.hireDate;
  }, [errors, formData]);

  // Get available managers (employees who can be managers)
  const getAvailableManagers = useCallback(() => {
    return departments.reduce((managers, dept) => {
      if (dept.managerId && dept.managerId !== parseInt(employeeId)) {
        managers.push({
          id: dept.managerId,
          name: dept.managerName || `Manager ${dept.managerId}`,
          department: dept.name
        });
      }
      return managers;
    }, []);
  }, [departments, employeeId]);

  return {
    // Form data
    formData,
    errors,
    
    // States
    isSubmitting,
    isDirty,
    isValid: isValid(),
    
    // Employee data
    currentEmployee,
    departments,
    availableManagers: getAvailableManagers(),
    
    // API states
    apiError,
    apiSuccess,
    
    // Actions
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
    
    // Utilities
    isEditing: !!employeeId
  };
};

export default useEmployeeForm;
