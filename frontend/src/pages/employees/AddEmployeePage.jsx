import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeForm from '@/components/employees/EmployeeForm';

const AddEmployeePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/employees');
  };

  const handleCancel = () => {
    navigate('/employees');
  };

  return (
    <div className="p-6">
      <EmployeeForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddEmployeePage;
