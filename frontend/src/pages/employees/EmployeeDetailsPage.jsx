import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import EmployeeProfile from '@/components/employees/EmployeeProfile';
import { useEmployees } from '@/hooks/useEmployees';

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentEmployee, isLoading, error, loadEmployee } = useEmployees();

  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id, loadEmployee]);

  const handleEdit = () => {
    navigate(`/employees/${id}/edit`);
  };

  return (
    <div className="p-6">
      <EmployeeProfile 
        employee={currentEmployee}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EmployeeDetailsPage;
