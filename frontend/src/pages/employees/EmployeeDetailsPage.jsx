import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeProfile from '@/components/employees/EmployeeProfile';
import { useEmployee } from '@/hooks/useEmployees';

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee, isLoading, error } = useEmployee(id);

  const handleEdit = () => {
    navigate(`/employees/${id}/edit`);
  };

  return (
    <div className="p-6">
      <EmployeeProfile
        employee={employee}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EmployeeDetailsPage;
