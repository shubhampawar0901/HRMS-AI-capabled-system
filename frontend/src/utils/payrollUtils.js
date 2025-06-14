/**
 * Utility functions for payroll operations
 */

// Format currency values
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0.00';
  
  const numAmount = parseFloat(amount) || 0;
  
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

// Format payroll period
export const formatPayrollPeriod = (month, year) => {
  if (!month || !year) return 'Unknown Period';

  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

// Get month name
export const getMonthName = (month) => {
  if (!month || month < 1 || month > 12) return 'Unknown';

  const date = new Date(2024, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
};

// Get payroll status badge color
export const getPayrollStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'processed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'paid':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Get payroll status display text
export const getPayrollStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'draft':
      return 'Draft';
    case 'processed':
      return 'Processed';
    case 'paid':
      return 'Paid';
    default:
      return 'Unknown';
  }
};

// Calculate salary breakdown percentages
export const calculateSalaryBreakdown = (salaryData) => {
  if (!salaryData) return [];
  
  const {
    basicSalary = 0,
    hra = 0,
    transportAllowance = 0,
    overtimePay = 0,
    grossSalary = 0
  } = salaryData;
  
  const total = grossSalary || (basicSalary + hra + transportAllowance + overtimePay);
  
  if (total === 0) return [];
  
  return [
    {
      label: 'Basic Salary',
      amount: basicSalary,
      percentage: ((basicSalary / total) * 100).toFixed(1),
      color: '#3B82F6'
    },
    {
      label: 'HRA',
      amount: hra,
      percentage: ((hra / total) * 100).toFixed(1),
      color: '#10B981'
    },
    {
      label: 'Transport Allowance',
      amount: transportAllowance,
      percentage: ((transportAllowance / total) * 100).toFixed(1),
      color: '#F59E0B'
    },
    {
      label: 'Overtime Pay',
      amount: overtimePay,
      percentage: ((overtimePay / total) * 100).toFixed(1),
      color: '#8B5CF6'
    }
  ].filter(item => item.amount > 0);
};

// Calculate deduction breakdown
export const calculateDeductionBreakdown = (salaryData) => {
  if (!salaryData) return [];
  
  const {
    pfDeduction = 0,
    taxDeduction = 0,
    totalDeductions = 0
  } = salaryData;
  
  const total = totalDeductions || (pfDeduction + taxDeduction);
  
  if (total === 0) return [];
  
  return [
    {
      label: 'PF Deduction',
      amount: pfDeduction,
      percentage: ((pfDeduction / total) * 100).toFixed(1),
      color: '#EF4444'
    },
    {
      label: 'Tax Deduction',
      amount: taxDeduction,
      percentage: ((taxDeduction / total) * 100).toFixed(1),
      color: '#F97316'
    }
  ].filter(item => item.amount > 0);
};

// Generate month options for filters
export const getMonthOptions = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));
};

// Generate year options for filters
export const getYearOptions = (startYear = 2020) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    years.push({
      value: year,
      label: year.toString()
    });
  }
  
  return years;
};

// Validate payroll data
export const validatePayrollData = (data) => {
  const errors = [];
  
  if (!data.employeeId) {
    errors.push('Employee ID is required');
  }
  
  if (!data.month || data.month < 1 || data.month > 12) {
    errors.push('Valid month is required');
  }
  
  if (!data.year || data.year < 2020) {
    errors.push('Valid year is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Calculate net salary
export const calculateNetSalary = (grossSalary, totalDeductions) => {
  const gross = parseFloat(grossSalary) || 0;
  const deductions = parseFloat(totalDeductions) || 0;
  return Math.max(0, gross - deductions);
};

// Calculate gross salary
export const calculateGrossSalary = (basicSalary, allowances = {}) => {
  const basic = parseFloat(basicSalary) || 0;
  const totalAllowances = Object.values(allowances).reduce((sum, allowance) => {
    return sum + (parseFloat(allowance) || 0);
  }, 0);
  
  return basic + totalAllowances;
};

// Format employee name
export const formatEmployeeName = (employee) => {
  if (!employee) return 'Unknown Employee';
  
  const { firstName, lastName, employeeName } = employee;
  
  if (employeeName) return employeeName;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  
  return 'Unknown Employee';
};

// Get current financial year
export const getCurrentFinancialYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based month
  
  // Financial year starts from April (month 4)
  if (currentMonth >= 4) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
};

// Check if payroll can be processed
export const canProcessPayroll = (payroll, userRole) => {
  if (userRole !== 'admin') return false;
  if (!payroll) return false;
  
  return payroll.status === 'draft';
};

// Check if payroll can be marked as paid
export const canMarkAsPaid = (payroll, userRole) => {
  if (userRole !== 'admin') return false;
  if (!payroll) return false;
  
  return payroll.status === 'processed';
};

// Generate payslip filename
export const generatePayslipFilename = (payroll, employee) => {
  if (!payroll) return 'payslip.pdf';
  
  const employeeName = formatEmployeeName(employee);
  const period = formatPayrollPeriod(payroll.month, payroll.year);
  
  return `${employeeName.replace(/\s+/g, '_')}_Payslip_${period.replace(/\s+/g, '_')}.pdf`;
};

// Sort payroll records
export const sortPayrollRecords = (records, sortBy = 'createdAt', sortOrder = 'desc') => {
  if (!Array.isArray(records)) return [];
  
  return [...records].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'createdAt' || sortBy === 'processedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle numeric sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Handle date sorting
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
};

export default {
  formatCurrency,
  formatPayrollPeriod,
  getMonthName,
  getPayrollStatusColor,
  getPayrollStatusText,
  calculateSalaryBreakdown,
  calculateDeductionBreakdown,
  getMonthOptions,
  getYearOptions,
  validatePayrollData,
  calculateNetSalary,
  calculateGrossSalary,
  formatEmployeeName,
  getCurrentFinancialYear,
  canProcessPayroll,
  canMarkAsPaid,
  generatePayslipFilename,
  sortPayrollRecords
};
