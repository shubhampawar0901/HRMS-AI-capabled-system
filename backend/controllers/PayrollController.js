const { Payroll, Employee, Attendance } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');
const moment = require('moment');

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
      const { role, employeeId } = req.user;
      const { month, year, page = 1, limit = 20 } = req.query;

      let records;
      let total;

      if (role === 'admin') {
        // Admin can see all payroll records
        const options = { month, year, page: parseInt(page), limit: parseInt(limit) };
        records = await Payroll.findAll(options);
        total = await Payroll.count(options);
      } else {
        // Employee can only see their own records
        const options = { employeeId, month, year, page: parseInt(page), limit: parseInt(limit) };
        records = await Payroll.findByEmployee(employeeId, options);
        total = await Payroll.countByEmployee(employeeId, options);
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

      return sendSuccess(res, responseData, 'Payroll records retrieved');
    } catch (error) {
      console.error('Get payroll records error:', error);
      return sendError(res, 'Failed to get payroll records', 500);
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
      const { year, page = 1, limit = 20 } = req.query;

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
}

module.exports = PayrollController;
