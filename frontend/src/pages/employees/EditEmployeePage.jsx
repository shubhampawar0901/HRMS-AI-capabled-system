import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeForm from '@/components/employees/EmployeeForm';

const EditEmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/employees/${id}`);
  };

  const handleCancel = () => {
    navigate(`/employees/${id}`);
  };

  return (
    <div className="p-6">
      <EmployeeForm 
        employeeId={id}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default EditEmployeePage;
