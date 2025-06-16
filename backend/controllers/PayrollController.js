const { Payroll, Employee, Attendance } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const moment = require('moment');

// Helper functions for PDF generation
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
};

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

class PayrollController {
  // ==========================================
  // GENERATE PAYROLL
  // ==========================================
  static async generatePayroll(req, res) {
    try {
      const { role } = req.user;
      
      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { employeeId, month, year } = req.body;

      // Check if payroll already exists
      const existing = await Payroll.findByEmployeeAndPeriod(employeeId, month, year);
      if (existing) {
        return sendError(res, 'Payroll already exists for this period', 400);
      }

      // Get employee details
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // Get attendance data for the month
      const attendanceData = await Attendance.getSummary(employeeId, month, year);
      
      // Calculate payroll
      const payrollData = await PayrollController.calculatePayroll(employee, attendanceData, month, year);
      
      // Create payroll record
      const payroll = await Payroll.create({
        employeeId,
        month,
        year,
        ...payrollData,
        status: 'draft'
      });

      return sendCreated(res, payroll, 'Payroll generated successfully');
    } catch (error) {
      console.error('Generate payroll error:', error);
      return sendError(res, 'Failed to generate payroll', 500);
    }
  }

  // ==========================================
  // CALCULATE PAYROLL (HELPER)
  // ==========================================
  static async calculatePayroll(employee, attendanceData, month, year) {
    const basicSalary = parseFloat(employee.basicSalary) || 0;
    const workingDays = 22; // Standard working days per month
    const presentDays = attendanceData.present_days || 0;
    const totalHours = parseFloat(attendanceData.total_hours) || 0;
    const overtimeHours = Math.max(0, totalHours - (presentDays * 8));

    // Calculate components
    const dailySalary = basicSalary / workingDays;
    const earnedBasicSalary = dailySalary * presentDays;
    
    // Allowances (simplified)
    const hra = earnedBasicSalary * 0.4; // 40% of basic
    const transportAllowance = 2000; // Fixed amount
    const overtimePay = overtimeHours * (dailySalary / 8) * 1.5; // 1.5x rate

    const grossSalary = earnedBasicSalary + hra + transportAllowance + overtimePay;

    // Deductions (simplified)
    const pfDeduction = earnedBasicSalary * 0.12; // 12% of basic
    const taxDeduction = grossSalary > 50000 ? grossSalary * 0.1 : 0; // 10% if > 50k
    const totalDeductions = pfDeduction + taxDeduction;

    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary: earnedBasicSalary,
      hra,
      transportAllowance,
      overtimePay,
      grossSalary,
      pfDeduction,
      taxDeduction,
      totalDeductions,
      netSalary,
      workingDays,
      presentDays,
      overtimeHours
    };
  }

  // ==========================================
  // GET PAYROLL RECORDS
  // ==========================================
  static async getPayrollRecords(req, res) {
    try {
      console.log('🔍 getPayrollRecords called');
      console.log('User:', req.user);
      console.log('Query params:', req.query);

      const { role, employeeId } = req.user;
      const { month, year, status, page = 1, limit = 100 } = req.query;

      console.log(`Role: ${role}, EmployeeId: ${employeeId}`);
      console.log(`Filters - Month: ${month}, Year: ${year}, Status: ${status}, Page: ${page}, Limit: ${limit}`);

      let records;
      let total;

      if (role === 'admin') {
        // Admin can see all payroll records
        console.log('🔍 Admin access - fetching all payroll records');
        const options = {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
          status: status || null,
          page: parseInt(page),
          limit: parseInt(limit)
        };
        console.log('🔍 Admin options:', options);

        records = await Payroll.findAll(options);
        console.log('📄 Found records:', records.length);

        total = await Payroll.count(options);
        console.log('📊 Total count:', total);
      } else {
        // Employee can only see their own records
        console.log('🔍 Employee access - fetching own records');
        const options = {
          employeeId,
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
          status: status || null,
          page: parseInt(page),
          limit: parseInt(limit)
        };
        console.log('🔍 Employee options:', options);

        records = await Payroll.findByEmployee(employeeId, options);
        console.log('📄 Found records:', records.length);

        total = await Payroll.countByEmployee(employeeId, options);
        console.log('📊 Total count:', total);
      }

      const responseData = {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      console.log('✅ Sending response with', records.length, 'records');
      return sendSuccess(res, responseData, 'Payroll records retrieved');
    } catch (error) {
      console.error('❌ Get payroll records error:', error);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error message:', error.message);
      return sendError(res, `Failed to get payroll records: ${error.message}`, 500);
    }
  }

  // ==========================================
  // GET PAYSLIP
  // ==========================================
  static async getPayslip(req, res) {
    try {
      const { id } = req.params;
      const { role, employeeId } = req.user;

      const payroll = await Payroll.findById(id);
      if (!payroll) {
        return sendError(res, 'Payslip not found', 404);
      }

      // Check access permissions
      if (role !== 'admin' && payroll.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      return sendSuccess(res, payroll, 'Payslip retrieved');
    } catch (error) {
      console.error('Get payslip error:', error);
      return sendError(res, 'Failed to get payslip', 500);
    }
  }

  // ==========================================
  // DOWNLOAD PAYSLIP CSV
  // ==========================================
  static async downloadPayslipCSV(req, res) {
    try {
      const { id } = req.params;
      const { role, employeeId } = req.user;

      const payroll = await Payroll.findById(id);
      if (!payroll) {
        return sendError(res, 'Payslip not found', 404);
      }

      // Check access permissions
      if (role !== 'admin' && payroll.employeeId !== employeeId) {
        return sendError(res, 'Access denied', 403);
      }

      // Get employee details
      const employee = await Employee.findById(payroll.employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // Generate CSV
      const csvData = await PayrollController.generatePayslipCSV(payroll, employee);

      // Set response headers for CSV download
      const filename = `payslip_${employee.firstName}_${employee.lastName}_${payroll.month}_${payroll.year}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvData, 'utf8'));

      // Send CSV data
      res.send(csvData);
    } catch (error) {
      console.error('Download payslip CSV error:', error);
      return sendError(res, 'Failed to generate payslip CSV', 500);
    }
  }

  // ==========================================
  // PROCESS PAYROLL
  // ==========================================
  static async processPayroll(req, res) {
    try {
      const { role, userId } = req.user;
      const { id } = req.params;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const payroll = await Payroll.findById(id);
      if (!payroll) {
        return sendError(res, 'Payroll record not found', 404);
      }

      if (payroll.status !== 'draft') {
        return sendError(res, 'Payroll has already been processed', 400);
      }

      const updatedPayroll = await Payroll.update(id, {
        status: 'processed',
        processedBy: userId,
        processedAt: new Date()
      });

      return sendSuccess(res, updatedPayroll, 'Payroll processed successfully');
    } catch (error) {
      console.error('Process payroll error:', error);
      return sendError(res, 'Failed to process payroll', 500);
    }
  }

  // ==========================================
  // MARK AS PAID
  // ==========================================
  static async markAsPaid(req, res) {
    try {
      const { role } = req.user;
      const { id } = req.params;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const payroll = await Payroll.findById(id);
      if (!payroll) {
        return sendError(res, 'Payroll record not found', 404);
      }

      if (payroll.status !== 'processed') {
        return sendError(res, 'Payroll must be processed before marking as paid', 400);
      }

      const updatedPayroll = await Payroll.update(id, {
        status: 'paid'
      });

      return sendSuccess(res, updatedPayroll, 'Payroll marked as paid');
    } catch (error) {
      console.error('Mark as paid error:', error);
      return sendError(res, 'Failed to mark payroll as paid', 500);
    }
  }

  // ==========================================
  // BULK GENERATE PAYROLL
  // ==========================================
  static async bulkGeneratePayroll(req, res) {
    try {
      const { role } = req.user;
      
      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { month, year, departmentId } = req.body;

      // Get employees
      const employees = await Employee.findAll({ 
        departmentId, 
        status: 'active' 
      });

      const results = [];
      const errors = [];

      for (const employee of employees) {
        try {
          // Check if payroll already exists
          const existing = await Payroll.findByEmployeeAndPeriod(employee.id, month, year);
          if (existing) {
            errors.push(`Payroll already exists for ${employee.getFullName()}`);
            continue;
          }

          // Get attendance data
          const attendanceData = await Attendance.getSummary(employee.id, month, year);
          
          // Calculate payroll
          const payrollData = await PayrollController.calculatePayroll(employee, attendanceData, month, year);
          
          // Create payroll record
          const payroll = await Payroll.create({
            employeeId: employee.id,
            month,
            year,
            ...payrollData,
            status: 'draft'
          });

          results.push(payroll);
        } catch (error) {
          errors.push(`Failed to generate payroll for ${employee.getFullName()}: ${error.message}`);
        }
      }

      const responseData = {
        generated: results.length,
        errors: errors.length,
        results,
        errorMessages: errors
      };

      return sendSuccess(res, responseData, `Bulk payroll generation completed. Generated: ${results.length}, Errors: ${errors.length}`);
    } catch (error) {
      console.error('Bulk generate payroll error:', error);
      return sendError(res, 'Failed to bulk generate payroll', 500);
    }
  }

  // ==========================================
  // GET PAYROLL SUMMARY
  // ==========================================
  static async getPayrollSummary(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { month, year } = req.query;

      const summary = await Payroll.getSummary(month, year);

      return sendSuccess(res, summary, 'Payroll summary retrieved');
    } catch (error) {
      console.error('Get payroll summary error:', error);
      return sendError(res, 'Failed to get payroll summary', 500);
    }
  }

  // ==========================================
  // GET EMPLOYEE PAYSLIPS
  // ==========================================
  static async getEmployeePayslips(req, res) {
    try {
      console.log('🔍 getEmployeePayslips called');
      console.log('User:', req.user);
      console.log('Query params:', req.query);

      const { role, employeeId } = req.user;
      const { year, month, page = 1, limit = 20 } = req.query;

      console.log(`Role: ${role}, EmployeeId: ${employeeId}`);

      // Only employees can access their own payslips through this endpoint
      // Managers and admins should use the general payroll records endpoint
      if (role !== 'employee') {
        console.log('❌ Access denied - not an employee');
        return sendError(res, 'Access denied. This endpoint is for employees only.', 403);
      }

      // Validate that employeeId exists in token
      if (!employeeId) {
        console.log('❌ Employee ID not found in token');
        return sendError(res, 'Employee ID not found in token', 400);
      }

      const options = {
        year,
        month,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      console.log('🔍 Calling Payroll.findByEmployee with:', employeeId, options);
      const records = await Payroll.findByEmployee(employeeId, options);
      console.log('📄 Found records:', records.length);

      console.log('🔍 Calling Payroll.countByEmployee with:', employeeId, options);
      const total = await Payroll.countByEmployee(employeeId, options);
      console.log('📊 Total count:', total);

      const responseData = {
        payslips: records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      return sendSuccess(res, responseData, 'Employee payslips retrieved');
    } catch (error) {
      console.error('Get employee payslips error:', error);
      return sendError(res, 'Failed to get employee payslips', 500);
    }
  }

  // ==========================================
  // GET SALARY STRUCTURE
  // ==========================================
  static async getSalaryStructure(req, res) {
    console.log('🔍 getSalaryStructure called');
    console.log('User:', req.user);
    console.log('Params:', req.params);

    try {
      const { role, employeeId: currentEmployeeId } = req.user;
      const { employeeId } = req.params;

      // Check permissions
      if (role === 'employee' && parseInt(employeeId) !== currentEmployeeId) {
        return sendError(res, 'Access denied', 403);
      }

      if (role === 'manager') {
        const employee = await Employee.findById(employeeId);
        if (employee.managerId !== currentEmployeeId) {
          return sendError(res, 'Access denied', 403);
        }
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      const salaryStructure = {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        employeeCode: employee.employeeCode,
        basicSalary: employee.basicSalary,
        allowances: {
          hra: employee.basicSalary * 0.4, // 40% of basic
          transportAllowance: 2000, // Fixed amount
          medicalAllowance: 1500 // Fixed amount
        },
        deductions: {
          pfDeduction: employee.basicSalary * 0.12, // 12% of basic
          esiDeduction: employee.basicSalary * 0.0175, // 1.75% of basic
          professionalTax: 200 // Fixed amount
        }
      };

      // Calculate totals
      const totalAllowances = Object.values(salaryStructure.allowances).reduce((sum, val) => sum + val, 0);
      const totalDeductions = Object.values(salaryStructure.deductions).reduce((sum, val) => sum + val, 0);

      salaryStructure.grossSalary = employee.basicSalary + totalAllowances;
      salaryStructure.totalDeductions = totalDeductions;
      salaryStructure.netSalary = salaryStructure.grossSalary - totalDeductions;

      return sendSuccess(res, salaryStructure, 'Salary structure retrieved');
    } catch (error) {
      console.error('Get salary structure error:', error);
      return sendError(res, 'Failed to get salary structure', 500);
    }
  }

  // ==========================================
  // GENERATE PAYSLIP CSV
  // ==========================================
  static async generatePayslipCSV(payroll, employee) {
    // Generate CSV data for payslip

    // Create CSV data
    const csvData = [
      // Header
      ['HRMS Company - Payslip'],
      [`Pay Period: ${getMonthName(payroll.month)} ${payroll.year}`],
      [''],

      // Employee Information
      ['Employee Information'],
      ['Field', 'Value'],
      ['Employee Name', `${employee.firstName} ${employee.lastName}`],
      ['Employee ID', employee.employeeCode || employee.id],
      ['Department', employee.department || 'N/A'],
      ['Position', employee.position || 'N/A'],
      ['Working Days', payroll.workingDays || 22],
      [''],

      // Earnings
      ['Earnings'],
      ['Component', 'Amount (₹)'],
      ['Basic Salary', formatAmount(payroll.basicSalary)],
      ['HRA', formatAmount(payroll.hra)],
      ['Transport Allowance', formatAmount(payroll.transportAllowance)],
      ['Overtime Pay', formatAmount(payroll.overtimePay || 0)],
      ['Gross Salary', formatAmount(payroll.grossSalary)],
      [''],

      // Deductions
      ['Deductions'],
      ['Component', 'Amount (₹)'],
      ['PF Deduction', formatAmount(payroll.pfDeduction)],
      ['Tax Deduction', formatAmount(payroll.taxDeduction)],
      ['Total Deductions', formatAmount(payroll.totalDeductions)],
      [''],

      // Net Salary
      ['Net Salary', formatAmount(payroll.netSalary)],
      [''],
      ['Generated on', new Date().toLocaleDateString()],
      ['Note', 'This is a computer-generated payslip']
    ];

    // Convert to CSV string
    const csvString = csvData.map(row =>
      row.map(field => `"${field}"`).join(',')
    ).join('\n');

    return csvString;
  }
}

module.exports = PayrollController;
