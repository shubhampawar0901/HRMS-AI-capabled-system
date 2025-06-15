const { executeQuery } = require('../config/database');

class LeaveBalance {
  constructor(data) {
    this.id = data.id;
    this.employeeId = data.employee_id;
    this.leaveTypeId = data.leave_type_id;
    this.year = data.year;
    this.allocatedDays = data.allocated_days;
    this.usedDays = data.used_days;
    this.remainingDays = data.remaining_days;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;

    // Additional fields from joins
    this.leave_type_name = data.leave_type_name;
    this.maxDaysPerYear = data.max_days_per_year;
    this.employeeName = data.employee_name;
    this.employeeCode = data.employee_code;
  }

  // Static methods for database operations
  static async findById(id) {
    const query = `
      SELECT lb.*, 
             CONCAT(e.first_name, ' ', e.last_name) as employee_name,
             e.employee_code,
             lt.name as leave_type_name
      FROM leave_balances lb
      LEFT JOIN employees e ON lb.employee_id = e.id
      LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.id = ?
    `;
    const rows = await executeQuery(query, [id]);
    return rows.length > 0 ? new LeaveBalance(rows[0]) : null;
  }

  static async findByEmployeeAndType(employeeId, leaveTypeId, year) {
    const query = `
      SELECT lb.*, 
             lt.name as leave_type_name
      FROM leave_balances lb
      LEFT JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = ? AND lb.leave_type_id = ? AND lb.year = ?
    `;
    const rows = await executeQuery(query, [employeeId, leaveTypeId, year]);
    return rows.length > 0 ? new LeaveBalance(rows[0]) : null;
  }

  static async create(balanceData) {
    const query = `
      INSERT INTO leave_balances (
        employee_id, leave_type_id, year, allocated_days, 
        used_days, remaining_days, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const remainingDays = balanceData.allocatedDays - (balanceData.usedDays || 0);
    
    const result = await executeQuery(query, [
      balanceData.employeeId,
      balanceData.leaveTypeId,
      balanceData.year,
      balanceData.allocatedDays,
      balanceData.usedDays || 0,
      remainingDays
    ]);
    
    return await LeaveBalance.findById(result.insertId);
  }

  static async update(id, balanceData) {
    const updates = [];
    const values = [];
    
    const fields = ['allocated_days', 'used_days'];
    
    fields.forEach(field => {
      const camelField = field.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      if (balanceData[camelField] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(balanceData[camelField]);
      }
    });
    
    if (updates.length === 0) return await LeaveBalance.findById(id);
    
    // Always recalculate remaining days
    updates.push('remaining_days = allocated_days - used_days');
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const query = `UPDATE leave_balances SET ${updates.join(', ')} WHERE id = ?`;
    await executeQuery(query, values);
    
    return await LeaveBalance.findById(id);
  }

  static async delete(id) {
    const query = 'DELETE FROM leave_balances WHERE id = ?';
    await executeQuery(query, [id]);
  }

  static async findByEmployee(employeeId, year) {
    const query = `
      SELECT lb.*, 
             lt.name as leave_type_name,
             lt.max_days_per_year
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = ? AND lb.year = ?
      ORDER BY lt.name
    `;
    const rows = await executeQuery(query, [employeeId, year]);
    return rows.map(row => new LeaveBalance(row));
  }

  static async initializeForEmployee(employeeId, year) {
    // Get all active leave types
    const leaveTypesQuery = 'SELECT * FROM leave_types WHERE is_active = 1';
    const leaveTypes = await executeQuery(leaveTypesQuery);
    
    const balances = [];
    
    for (const leaveType of leaveTypes) {
      // Check if balance already exists
      const existing = await LeaveBalance.findByEmployeeAndType(
        employeeId, 
        leaveType.id, 
        year
      );
      
      if (!existing) {
        const balance = await LeaveBalance.create({
          employeeId,
          leaveTypeId: leaveType.id,
          year,
          allocatedDays: leaveType.max_days_per_year,
          usedDays: 0
        });
        balances.push(balance);
      } else {
        balances.push(existing);
      }
    }
    
    return balances;
  }

  static async deductLeave(employeeId, leaveTypeId, days, year) {
    const balance = await LeaveBalance.findByEmployeeAndType(employeeId, leaveTypeId, year);
    
    if (!balance) {
      throw new Error('Leave balance not found');
    }
    
    if (balance.remainingDays < days) {
      throw new Error('Insufficient leave balance');
    }
    
    return await LeaveBalance.update(balance.id, {
      usedDays: balance.usedDays + days
    });
  }

  static async addLeave(employeeId, leaveTypeId, days, year) {
    const balance = await LeaveBalance.findByEmployeeAndType(employeeId, leaveTypeId, year);
    
    if (!balance) {
      throw new Error('Leave balance not found');
    }
    
    const newUsedDays = Math.max(0, balance.usedDays - days);
    
    return await LeaveBalance.update(balance.id, {
      usedDays: newUsedDays
    });
  }

  static async checkBalance(employeeId, leaveTypeId, requiredDays, year) {
    const balance = await LeaveBalance.findByEmployeeAndType(employeeId, leaveTypeId, year);
    
    if (!balance) {
      return { hasBalance: false, message: 'Leave balance not found' };
    }
    
    if (balance.remainingDays < requiredDays) {
      return { 
        hasBalance: false, 
        message: `Insufficient balance. Required: ${requiredDays}, Available: ${balance.remainingDays}`,
        available: balance.remainingDays,
        required: requiredDays
      };
    }
    
    return { 
      hasBalance: true, 
      message: 'Sufficient balance available',
      available: balance.remainingDays,
      required: requiredDays
    };
  }

  static async getEmployeeBalanceSummary(employeeId, year) {
    const query = `
      SELECT 
        lb.*,
        lt.name as leave_type_name,
        lt.max_days_per_year,
        ROUND((lb.used_days / lb.allocated_days) * 100, 2) as utilization_percentage
      FROM leave_balances lb
      JOIN leave_types lt ON lb.leave_type_id = lt.id
      WHERE lb.employee_id = ? AND lb.year = ?
      ORDER BY lt.name
    `;
    
    const balances = await executeQuery(query, [employeeId, year]);
    
    const summary = {
      totalAllocated: balances.reduce((sum, b) => sum + b.allocated_days, 0),
      totalUsed: balances.reduce((sum, b) => sum + b.used_days, 0),
      totalRemaining: balances.reduce((sum, b) => sum + b.remaining_days, 0),
      balances: balances.map(row => new LeaveBalance(row))
    };
    
    summary.overallUtilization = summary.totalAllocated > 0 
      ? Math.round((summary.totalUsed / summary.totalAllocated) * 100 * 100) / 100 
      : 0;
    
    return summary;
  }

  static async getDepartmentBalanceSummary(departmentId, year) {
    const query = `
      SELECT 
        e.id as employee_id,
        CONCAT(e.first_name, ' ', e.last_name) as employee_name,
        e.employee_code,
        SUM(lb.allocated_days) as total_allocated,
        SUM(lb.used_days) as total_used,
        SUM(lb.remaining_days) as total_remaining,
        ROUND(AVG((lb.used_days / lb.allocated_days) * 100), 2) as avg_utilization
      FROM employees e
      LEFT JOIN leave_balances lb ON e.id = lb.employee_id AND lb.year = ?
      WHERE e.department_id = ? AND e.status = 'active'
      GROUP BY e.id, e.first_name, e.last_name, e.employee_code
      ORDER BY e.first_name, e.last_name
    `;
    
    return await executeQuery(query, [year, departmentId]);
  }

  static async syncWithLeaveApplications(employeeId, year) {
    // Get all approved leave applications for the year
    const applicationsQuery = `
      SELECT leave_type_id, SUM(total_days) as total_used
      FROM leave_applications
      WHERE employee_id = ?
        AND YEAR(start_date) = ?
        AND status = 'approved'
      GROUP BY leave_type_id
    `;

    const applications = await executeQuery(applicationsQuery, [employeeId, year]);

    // Update balances based on actual usage
    for (const app of applications) {
      const balance = await LeaveBalance.findByEmployeeAndType(
        employeeId,
        app.leave_type_id,
        year
      );

      if (balance && balance.usedDays !== app.total_used) {
        await LeaveBalance.update(balance.id, {
          usedDays: app.total_used
        });
      }
    }

    return await LeaveBalance.findByEmployee(employeeId, year);
  }

  static async updateUsedDays(employeeId, leaveTypeId, year, additionalDays) {
    const balance = await LeaveBalance.findByEmployeeAndType(employeeId, leaveTypeId, year);

    if (!balance) {
      // Create balance if it doesn't exist
      const leaveTypeQuery = 'SELECT * FROM leave_types WHERE id = ?';
      const leaveTypes = await executeQuery(leaveTypeQuery, [leaveTypeId]);

      if (leaveTypes.length === 0) {
        throw new Error('Leave type not found');
      }

      return await LeaveBalance.create({
        employeeId,
        leaveTypeId,
        year,
        allocatedDays: leaveTypes[0].max_days_per_year,
        usedDays: additionalDays
      });
    }

    return await LeaveBalance.update(balance.id, {
      usedDays: balance.usedDays + additionalDays
    });
  }

  // Instance methods
  getUtilizationPercentage() {
    if (this.allocatedDays === 0) return 0;
    return Math.round((this.usedDays / this.allocatedDays) * 100 * 100) / 100;
  }

  hasBalance(requiredDays) {
    return this.remainingDays >= requiredDays;
  }

  toJSON() {
    return { ...this };
  }

  async save() {
    if (this.id) {
      return await LeaveBalance.update(this.id, this);
    } else {
      return await LeaveBalance.create(this);
    }
  }
}

module.exports = LeaveBalance;
