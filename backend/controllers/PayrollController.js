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
      const { month, year, page = 1, limit = 100 } = req.query;

      console.log(`Role: ${role}, EmployeeId: ${employeeId}`);
      console.log(`Filters - Month: ${month}, Year: ${year}, Page: ${page}, Limit: ${limit}`);

      let records;
      let total;

      if (role === 'admin') {
        // Admin can see all payroll records
        console.log('🔍 Admin access - fetching all payroll records');
        const options = {
          month: month ? parseInt(month) : null,
          year: year ? parseInt(year) : null,
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
  // DOWNLOAD PAYSLIP PDF
  // ==========================================
  static async downloadPayslipPDF(req, res) {
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

      // Generate PDF
      const pdfBuffer = await PayrollController.generatePayslipPDF(payroll, employee);

      // Set response headers for PDF download
      const filename = `payslip_${employee.firstName}_${employee.lastName}_${payroll.month}_${payroll.year}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Download payslip PDF error:', error);
      return sendError(res, 'Failed to generate payslip PDF', 500);
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
  // GENERATE PAYSLIP PDF
  // ==========================================
  static async generatePayslipPDF(payroll, employee) {
    // For now, create a simple HTML-based PDF using a basic approach
    // This is a temporary solution until puppeteer is fully installed

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Payslip - ${employee.firstName} ${employee.lastName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .payslip-title { font-size: 18px; margin-top: 10px; }
        .employee-info { margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .section { margin: 20px 0; }
        .section-title { font-size: 16px; font-weight: bold; background: #f0f0f0; padding: 8px; }
        .earnings, .deductions { width: 48%; display: inline-block; vertical-align: top; }
        .amount { text-align: right; }
        .total-row { font-weight: bold; border-top: 1px solid #333; padding-top: 5px; }
        .net-salary { font-size: 18px; font-weight: bold; text-align: center; background: #e8f5e8; padding: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">HRMS Company</div>
        <div class="payslip-title">Payslip for ${getMonthName(payroll.month)} ${payroll.year}</div>
    </div>

    <div class="employee-info">
        <div class="info-row">
            <span><strong>Employee Name:</strong> ${employee.firstName} ${employee.lastName}</span>
            <span><strong>Employee ID:</strong> ${employee.employeeCode || employee.id}</span>
        </div>
        <div class="info-row">
            <span><strong>Department:</strong> ${employee.department || 'N/A'}</span>
            <span><strong>Position:</strong> ${employee.position || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span><strong>Pay Period:</strong> ${getMonthName(payroll.month)} ${payroll.year}</span>
            <span><strong>Working Days:</strong> ${payroll.workingDays || 22}</span>
        </div>
    </div>

    <div class="section">
        <div style="display: flex; justify-content: space-between;">
            <div class="earnings">
                <div class="section-title">Earnings</div>
                <div class="info-row">
                    <span>Basic Salary</span>
                    <span class="amount">₹${formatAmount(payroll.basicSalary)}</span>
                </div>
                <div class="info-row">
                    <span>HRA</span>
                    <span class="amount">₹${formatAmount(payroll.hra)}</span>
                </div>
                <div class="info-row">
                    <span>Transport Allowance</span>
                    <span class="amount">₹${formatAmount(payroll.transportAllowance)}</span>
                </div>
                <div class="info-row">
                    <span>Overtime Pay</span>
                    <span class="amount">₹${formatAmount(payroll.overtimePay || 0)}</span>
                </div>
                <div class="info-row total-row">
                    <span>Gross Salary</span>
                    <span class="amount">₹${formatAmount(payroll.grossSalary)}</span>
                </div>
            </div>

            <div class="deductions">
                <div class="section-title">Deductions</div>
                <div class="info-row">
                    <span>PF Deduction</span>
                    <span class="amount">₹${formatAmount(payroll.pfDeduction)}</span>
                </div>
                <div class="info-row">
                    <span>Tax Deduction</span>
                    <span class="amount">₹${formatAmount(payroll.taxDeduction)}</span>
                </div>
                <div class="info-row total-row">
                    <span>Total Deductions</span>
                    <span class="amount">₹${formatAmount(payroll.totalDeductions)}</span>
                </div>
            </div>
        </div>
    </div>

    <div class="net-salary">
        Net Salary: ₹${formatAmount(payroll.netSalary)}
    </div>

    <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        This is a computer-generated payslip and does not require a signature.
        <br>Generated on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>`;

    // For now, return the HTML as a simple text buffer
    // This will be replaced with actual PDF generation once puppeteer is installed
    return Buffer.from(html, 'utf8');
  }
}

module.exports = PayrollController;
