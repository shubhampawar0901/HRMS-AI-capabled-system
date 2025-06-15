import { useState, useEffect, useCallback } from 'react';
import { useEmployee, useEmployeeMutations, useDepartments } from './useEmployees';

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
  const [isDirty, setIsDirty] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [aiPopulatedFields, setAiPopulatedFields] = useState(new Set());
  const [resumeParseSuccess, setResumeParseSuccess] = useState(false);
  const [resumeParseMessage, setResumeParseMessage] = useState('');

  const { employee: currentEmployee, isLoading: loadingEmployee } = useEmployee(employeeId);
  const { departments } = useDepartments();
  const {
    isLoading: isSubmitting,
    error: apiError,
    success: apiSuccess,
    addEmployee,
    updateEmployee,
    clearMessages
  } = useEmployeeMutations();

  // Load available managers
  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      // For now, we'll use departments to get managers
      // In a real app, you might have a separate endpoint for managers
      const managersFromDepts = departments.filter(dept => dept.managerId).map(dept => ({
        id: dept.managerId,
        name: dept.managerName || `Manager ${dept.managerId}`,
        department: dept.name
      }));
      setAvailableManagers(managersFromDepts);
    } catch (error) {
      console.error('Failed to load managers:', error);
    }
  };

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
        departmentId: currentEmployee.departmentId?.toString() || '',
        position: currentEmployee.position || '',
        hireDate: currentEmployee.hireDate ? currentEmployee.hireDate.split('T')[0] : '',
        basicSalary: currentEmployee.basicSalary?.toString() || '',
        managerId: currentEmployee.managerId?.toString() || '',
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

    clearMessages();

    try {
      const submitData = {
        ...formData,
        basicSalary: formData.basicSalary ? parseFloat(formData.basicSalary) : null,
        departmentId: parseInt(formData.departmentId),
        managerId: formData.managerId ? parseInt(formData.managerId) : null
      };

      let result;
      if (employeeId) {
        result = await updateEmployee(employeeId, submitData);
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
    }
  }, [formData, validateForm, employeeId, addEmployee, updateEmployee, errors, clearMessages]);

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

  // Handle resume parse success
  const handleResumeParseSuccess = useCallback((parsedData, confidence) => {
    const fieldsToUpdate = {};
    const updatedFields = new Set();

    // Only populate fields that have actual data (not null/empty)
    if (parsedData.firstName && parsedData.firstName.trim()) {
      fieldsToUpdate.firstName = parsedData.firstName.trim();
      updatedFields.add('firstName');
    }

    if (parsedData.lastName && parsedData.lastName.trim()) {
      fieldsToUpdate.lastName = parsedData.lastName.trim();
      updatedFields.add('lastName');
    }

    if (parsedData.email && parsedData.email.trim()) {
      fieldsToUpdate.email = parsedData.email.trim();
      updatedFields.add('email');
    }

    if (parsedData.phone && parsedData.phone.trim()) {
      fieldsToUpdate.phone = parsedData.phone.trim();
      updatedFields.add('phone');
    }

    if (parsedData.address && parsedData.address.trim()) {
      fieldsToUpdate.address = parsedData.address.trim();
      updatedFields.add('address');
    }

    if (parsedData.position && parsedData.position.trim()) {
      fieldsToUpdate.position = parsedData.position.trim();
      updatedFields.add('position');
    }

    if (parsedData.emergencyContact && parsedData.emergencyContact.trim()) {
      fieldsToUpdate.emergencyContact = parsedData.emergencyContact.trim();
      updatedFields.add('emergencyContact');
    }

    if (parsedData.emergencyPhone && parsedData.emergencyPhone.trim()) {
      fieldsToUpdate.emergencyPhone = parsedData.emergencyPhone.trim();
      updatedFields.add('emergencyPhone');
    }

    // Update form data with extracted fields
    if (Object.keys(fieldsToUpdate).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...fieldsToUpdate
      }));

      setAiPopulatedFields(updatedFields);
      setIsDirty(true);

      // Show success notification
      setResumeParseSuccess(true);
      setResumeParseMessage(`AI resume parsed successfully! ${Object.keys(fieldsToUpdate).length} fields have been auto-populated.`);

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setResumeParseSuccess(false);
        setResumeParseMessage('');
      }, 5000);

      console.log('Resume parsed successfully:', {
        fieldsUpdated: Array.from(updatedFields),
        confidence: confidence,
        extractedData: fieldsToUpdate
      });
    } else {
      // Show info message if no fields were populated
      setResumeParseSuccess(false);
      setResumeParseMessage('No extractable information found in the resume. Please fill the form manually.');

      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setResumeParseMessage('');
      }, 3000);
    }
  }, []);

  // Update available managers when departments change
  useEffect(() => {
    loadManagers();
  }, [departments]);

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
    availableManagers,
    
    // API states
    apiError,
    apiSuccess,
    
    // Actions
    handleChange,
    handleSubmit,
    validateForm,
    resetForm,
    handleResumeParseSuccess,

    // Utilities
    isEditing: !!employeeId,
    aiPopulatedFields,

    // Resume parse notifications
    resumeParseSuccess,
    resumeParseMessage
  };
};

export default useEmployeeForm;
