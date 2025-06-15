import { useState, useEffect, useCallback } from 'react';
import { useDepartments, useEmployeeMutations } from './useEmployees';

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

export const useResumeParser = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [availableManagers, setAvailableManagers] = useState([]);
  const [aiPopulatedFields, setAiPopulatedFields] = useState(new Set());
  const [resumeParseSuccess, setResumeParseSuccess] = useState(false);
  const [resumeParseMessage, setResumeParseMessage] = useState('');
  const [employeeCreationSuccess, setEmployeeCreationSuccess] = useState(false);
  const [createdEmployeeDetails, setCreatedEmployeeDetails] = useState(null);
  const { departments } = useDepartments();
  const {
    isLoading: isCreatingEmployee,
    error: apiError,
    success: apiSuccess,
    addEmployee,
    clearMessages
  } = useEmployeeMutations();

  // Load available managers
  const loadManagers = useCallback(async () => {
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
      setAvailableManagers([]);
    }
  }, [departments]);

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
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
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
    // Remove hire date future validation - hire dates can be in the future

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

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

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setIsDirty(false);
    setAiPopulatedFields(new Set());
    setResumeParseSuccess(false);
    setResumeParseMessage('');
    setEmployeeCreationSuccess(false);
    setCreatedEmployeeDetails(null);
    clearMessages();
  }, [clearMessages]);

  // Check if form is valid
  const isValid = useCallback(() => {
    // First validate the form to get current errors
    const currentErrors = {};

    // Required fields validation
    if (!formData.firstName?.trim()) {
      currentErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      currentErrors.lastName = 'Last name is required';
    }
    if (!formData.email?.trim()) {
      currentErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      currentErrors.email = 'Email is invalid';
    }
    if (!formData.dateOfBirth) {
      currentErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.gender) {
      currentErrors.gender = 'Gender is required';
    }
    if (!formData.departmentId) {
      currentErrors.departmentId = 'Department is required';
    }
    if (!formData.position?.trim()) {
      currentErrors.position = 'Position is required';
    }
    if (!formData.hireDate) {
      currentErrors.hireDate = 'Hire date is required';
    }

    // Optional field validations
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      currentErrors.phone = 'Phone number is invalid';
    }
    if (formData.emergencyPhone && !/^\+?[\d\s\-\(\)]+$/.test(formData.emergencyPhone)) {
      currentErrors.emergencyPhone = 'Emergency phone number is invalid';
    }
    if (formData.basicSalary && (isNaN(formData.basicSalary) || parseFloat(formData.basicSalary) < 0)) {
      currentErrors.basicSalary = 'Basic salary must be a positive number';
    }
    if (formData.dateOfBirth && new Date(formData.dateOfBirth) > new Date()) {
      currentErrors.dateOfBirth = 'Date of birth cannot be in the future';
    }

    return Object.keys(currentErrors).length === 0 &&
           formData.firstName?.trim() &&
           formData.lastName?.trim() &&
           formData.email?.trim() &&
           formData.dateOfBirth &&
           formData.gender &&
           formData.departmentId &&
           formData.position?.trim() &&
           formData.hireDate;
  }, [formData]);

  // Create employee from parsed data
  const createEmployee = useCallback(async () => {
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

      const result = await addEmployee(submitData);

      if (result.success) {
        setIsDirty(false);

        // Show success notification with employee details
        setCreatedEmployeeDetails({
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeCode: result.data?.employeeCode || 'N/A',
          departmentId: formData.departmentId,
          position: formData.position
        });
        setEmployeeCreationSuccess(true);

        // Reset form after showing success message for 3 seconds
        setTimeout(() => {
          setEmployeeCreationSuccess(false);
          setCreatedEmployeeDetails(null);
          resetForm();
        }, 3000);

        return { success: true, data: result.data };
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [formData, validateForm, errors, resetForm, addEmployee, clearMessages]);

  // Update available managers when departments change
  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  // Validate form when data changes
  useEffect(() => {
    if (isDirty) {
      validateForm();
    }
  }, [formData, isDirty, validateForm]);

  return {
    // Form data
    formData,
    errors,

    // States
    isDirty,
    isValid: isValid(),
    isCreatingEmployee,

    // Data
    departments,
    availableManagers,

    // API states
    apiError,
    apiSuccess,

    // Actions
    handleChange,
    validateForm,
    resetForm,
    handleResumeParseSuccess,
    createEmployee,

    // Utilities
    aiPopulatedFields,

    // Resume parse notifications
    resumeParseSuccess,
    resumeParseMessage,

    // Employee creation success
    employeeCreationSuccess,
    createdEmployeeDetails
  };
};

export default useResumeParser;
