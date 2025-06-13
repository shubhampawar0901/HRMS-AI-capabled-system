import React from 'react';
import { Button } from '../../../shared/ui/button';

const EmployeeDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Employee Dashboard</h1>
        <Button variant="employee">Employee Actions</Button>
      </div>
      
      <div className="text-center text-muted-foreground">
        <p>Employee Dashboard placeholder</p>
        <p>To be implemented by Dashboard Module Agent</p>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
