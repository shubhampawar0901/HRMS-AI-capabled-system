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

// Helper function to calculate working days in a month (excluding weekends)
const getWorkingDaysInMonth = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });
};

class PayrollController {
  // ==========================================
  // GENERATE PAYROLL PREVIEW (UPDATED)
  // ==========================================
  static async generatePayroll(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { employeeId, month, year } = req.body;

      // Check if payroll already exists (ENHANCED VALIDATION)
      const existing = await Payroll.findByEmployeeAndPeriod(employeeId, month, year);
      if (existing) {
        console.warn(`⚠️ Duplicate payroll attempt: Employee ${employeeId}, Period ${month}/${year}, Existing ID: ${existing.id}`);
        return sendError(res, `Payroll already exists for ${employee.firstName} ${employee.lastName} for ${getMonthName(month)} ${year}. Please check existing records.`, 409);
      }

      // Get employee details
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // Get attendance data for the month
      const attendanceData = await Attendance.getSummary(employeeId, month, year);

      // Validate attendance data
      if (!attendanceData || attendanceData.total_days === 0) {
        console.warn(`⚠️ No attendance data found for employee ${employeeId} for ${month}/${year}. Using default values.`);
      }

      // Calculate payroll (PREVIEW ONLY - NOT SAVED)
      const payrollData = await PayrollController.calculatePayroll(employee, attendanceData, month, year);

      // Return preview data with employee info
      const previewData = {
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          employeeCode: employee.employeeCode,
          department: employee.departmentName,
          position: employee.position,
          originalBasicSalary: employee.basicSalary
        },
        period: {
          month,
          year,
          monthName: getMonthName(month)
        },
        attendance: {
          workingDays: payrollData.workingDays,
          presentDays: payrollData.presentDays,
          absentDays: payrollData.absentDays,
          overtimeHours: payrollData.overtimeHours,
          hasAttendanceData: payrollData.hasAttendanceData,
          attendanceNote: payrollData.attendanceNote
        },
        calculations: payrollData,
        preview: true, // Flag to indicate this is preview data
        message: 'Payroll calculated successfully. Please review and confirm to save.'
      };

      return sendSuccess(res, previewData, 'Payroll preview generated successfully');
    } catch (error) {
      console.error('Generate payroll preview error:', error);
      return sendError(res, 'Failed to generate payroll preview', 500);
    }
  }

  // ==========================================
  // CONFIRM AND SAVE PAYROLL (NEW)
  // ==========================================
  static async confirmPayroll(req, res) {
    try {
      const { role, userId } = req.user;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { employeeId, month, year, payrollData } = req.body;

      // Validate required fields
      if (!employeeId || !month || !year || !payrollData) {
        return sendError(res, 'Missing required fields', 400);
      }

      // Double-check if payroll already exists (ENHANCED VALIDATION)
      const existing = await Payroll.findByEmployeeAndPeriod(employeeId, month, year);
      if (existing) {
        console.warn(`⚠️ Duplicate payroll confirmation attempt: Employee ${employeeId}, Period ${month}/${year}, Existing ID: ${existing.id}`);
        return sendError(res, `Payroll already exists for ${employee.firstName} ${employee.lastName} for ${getMonthName(month)} ${year}. Cannot create duplicate records.`, 409);
      }

      // Get employee details for validation
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // Create payroll record with confirmed data
      const payroll = await Payroll.create({
        employeeId,
        month,
        year,
        ...payrollData,
        status: 'draft',
        processedBy: userId,
        processedAt: new Date()
      });

      return sendSuccess(res, payroll, 'Payroll confirmed and saved successfully');
    } catch (error) {
      console.error('Confirm payroll error:', error);
      return sendError(res, 'Failed to confirm payroll', 500);
    }
  }

  // ==========================================
  // PAYROLL PREVIEW (EXISTING)
  // ==========================================
  static async getPayrollPreview(req, res) {
    try {
      const { role } = req.user;

      if (role !== 'admin') {
        return sendError(res, 'Access denied', 403);
      }

      const { employeeId, month, year } = req.query;

      // Validate required parameters
      if (!employeeId || !month || !year) {
        return sendError(res, 'Employee ID, month, and year are required', 400);
      }

      // Validate month and year ranges
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return sendError(res, 'Month must be between 1 and 12', 400);
      }

      if (isNaN(yearNum) || yearNum < 2020) {
        return sendError(res, 'Year must be 2020 or later', 400);
      }

      // Check if payroll already exists for this period
      const existingPayroll = await Payroll.findByEmployeeAndPeriod(employeeId, monthNum, yearNum);
      if (existingPayroll) {
        return sendError(res, 'Payroll already exists for this employee and period', 409);
      }

      // Get employee details
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      if (employee.status !== 'active') {
        return sendError(res, 'Cannot generate payroll for inactive employee', 400);
      }

      // Get attendance data for the month
      const attendanceData = await Attendance.getSummary(employeeId, monthNum, yearNum);

      if (!attendanceData) {
        return sendError(res, 'No attendance data found for the specified period', 404);
      }

      // Calculate payroll preview (same logic as generation)
      const payrollCalculations = await PayrollController.calculatePayroll(employee, attendanceData, monthNum, yearNum);

      const response = {
        calculations: payrollCalculations,
        attendanceData: {
          workingDays: payrollCalculations.workingDays,
          presentDays: payrollCalculations.presentDays,
          absentDays: payrollCalculations.absentDays,
          totalHours: parseFloat(attendanceData.total_hours) || 0,
          overtimeHours: payrollCalculations.overtimeHours,
          hasAttendanceData: payrollCalculations.hasAttendanceData,
          attendanceNote: payrollCalculations.attendanceNote
        },
        employee: {
          id: employee.id,
          name: `${employee.firstName} ${employee.lastName}`,
          employeeCode: employee.employeeCode,
          department: employee.departmentName,
          position: employee.position,
          basicSalary: employee.basicSalary
        }
      };

      return sendSuccess(res, response, 'Payroll preview calculated successfully');
    } catch (error) {
      console.error('Payroll preview error:', error);

      // Handle specific error types
      if (error.message.includes('Employee not found')) {
        return sendError(res, 'Employee not found', 404);
      }
      if (error.message.includes('attendance')) {
        return sendError(res, 'Failed to retrieve attendance data', 500);
      }

      return sendError(res, 'Failed to calculate payroll preview', 500);
    }
  }

  // ==========================================
  // CALCULATE PAYROLL (HELPER)
  // ==========================================
  static async calculatePayroll(employee, attendanceData, month, year) {
    const basicSalary = parseFloat(employee.basicSalary) || 0;

    // FIXED: Calculate actual working days for the specific month
    const workingDays = getWorkingDaysInMonth(month, year);

    // FIXED: Correct attendance calculation
    let presentDays = parseInt(attendanceData?.present_days) || 0;
    let lateDays = parseInt(attendanceData?.late_days) || 0;
    let halfDays = parseInt(attendanceData?.half_days) || 0;

    // Total attendance days = present + late + half days
    const totalAttendanceDays = presentDays + lateDays + halfDays;
    const absentDays = Math.max(0, workingDays - totalAttendanceDays);

    // Business Rule: If no attendance data, assume full attendance
    if (!attendanceData || attendanceData.total_days === 0) {
      presentDays = workingDays; // Assume full attendance if no records
      console.log(`⚠️ No attendance data for employee ${employee.id} - assuming full attendance`);
    } else if (totalAttendanceDays < 5) {
      // Business Rule: Minimum 5 days attendance for salary calculation
      presentDays = Math.max(totalAttendanceDays, 5);
      console.log(`⚠️ Low attendance (${totalAttendanceDays}) for employee ${employee.id} - applying minimum 5 days`);
    } else {
      // Use actual attendance (present + late days count as working days)
      presentDays = totalAttendanceDays;
    }

    // FIXED: Correct overtime calculation
    const totalHours = parseFloat(attendanceData?.total_hours) || (presentDays * 8);
    const standardHours = totalAttendanceDays * 8; // Standard hours for days actually worked
    const overtimeHours = Math.max(0, totalHours - standardHours);

    // CORRECTED BUSINESS LOGIC: Full basic salary with absence deductions
    const dailySalary = basicSalary / workingDays;
    // Use the absentDays calculated above
    const absenceDeduction = dailySalary * absentDays;

    // Use FULL basic salary, not pro-rata
    const fullBasicSalary = basicSalary;

    // Allowances based on FULL basic salary
    const hra = fullBasicSalary * 0.4; // 40% of full basic
    const transportAllowance = 2000; // Fixed amount
    const overtimePay = overtimeHours * (dailySalary / 8) * 1.5; // 1.5x rate

    // Gross salary before deductions
    const grossSalary = fullBasicSalary + hra + transportAllowance + overtimePay;

    // Deductions
    const pfDeduction = fullBasicSalary * 0.12; // 12% of full basic
    const taxDeduction = grossSalary > 50000 ? grossSalary * 0.1 : 0; // 10% if > 50k
    const totalDeductions = pfDeduction + taxDeduction + absenceDeduction; // Include absence deduction

    const netSalary = grossSalary - totalDeductions;

    // Validation: Ensure no negative values
    const finalResult = {
      basicSalary: Math.max(0, fullBasicSalary), // Use full basic salary
      hra: Math.max(0, hra),
      transportAllowance: Math.max(0, transportAllowance),
      overtimePay: Math.max(0, overtimePay),
      grossSalary: Math.max(0, grossSalary),
      pfDeduction: Math.max(0, pfDeduction),
      taxDeduction: Math.max(0, taxDeduction),
      absenceDeduction: Math.max(0, absenceDeduction), // New field
      totalDeductions: Math.max(0, totalDeductions),
      netSalary: Math.max(0, netSalary),
      workingDays,
      presentDays,
      absentDays, // New field
      overtimeHours: Math.max(0, overtimeHours),
      // Add validation info
      hasAttendanceData: !!attendanceData?.total_days,
      attendanceNote: attendanceData?.total_days ? null : 'No attendance records found - assumed full attendance',
      originalBasicSalary: basicSalary, // Keep track of original basic salary
      calculationMethod: 'full_basic_with_absence_deduction' // New field for transparency
    };

    // Log calculation details for debugging
    console.log(`💰 CORRECTED Payroll calculation for employee ${employee.id}:`);
    console.log(`   Original Basic Salary: ₹${basicSalary}`);
    console.log(`   Present Days: ${presentDays}/${workingDays} (Absent: ${absentDays})`);
    console.log(`   Full Basic Salary: ₹${finalResult.basicSalary} (NO reduction)`);
    console.log(`   HRA (40% of full basic): ₹${finalResult.hra}`);
    console.log(`   Absence Deduction: ₹${finalResult.absenceDeduction}`);
    console.log(`   Gross Salary: ₹${finalResult.grossSalary}`);
    console.log(`   Total Deductions: ₹${finalResult.totalDeductions}`);
    console.log(`   Net Salary: ₹${finalResult.netSalary}`);

    return finalResult;
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
        limit: parseInt(limit),
        // IMPORTANT: Only show processed and paid payroll to employees
        status: ['processed', 'paid']
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
