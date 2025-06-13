const { Employee, Department, User, executeQuery } = require('../models');
const bcrypt = require('bcryptjs');

class EmployeeService {
  // ==========================================
  // EMPLOYEE MANAGEMENT
  // ==========================================
  
  static async createEmployee(employeeData) {
    try {
      // Create user account first
      const userData = {
        email: employeeData.email,
        password: employeeData.password || this.generateTemporaryPassword(),
        role: employeeData.role || 'employee'
      };

      const user = await User.create(userData);

      // Create employee record
      const employee = await Employee.create({
        ...employeeData,
        userId: user.id
      });

      // Return employee with user data
      return {
        ...employee.toJSON(),
        user: user.toJSON()
      };
    } catch (error) {
      console.error('Create employee error:', error);
      throw new Error('Failed to create employee');
    }
  }

  static async updateEmployee(employeeId, updateData) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update employee data
      const updatedEmployee = await Employee.update(employeeId, updateData);

      // Update user data if email is changed
      if (updateData.email && employee.userId) {
        await User.update(employee.userId, { email: updateData.email });
      }

      return updatedEmployee;
    } catch (error) {
      console.error('Update employee error:', error);
      throw new Error('Failed to update employee');
    }
  }

  static async deactivateEmployee(employeeId, reason) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Update employee status
      await Employee.update(employeeId, { 
        status: 'inactive',
        terminationDate: new Date(),
        terminationReason: reason
      });

      // Deactivate user account
      if (employee.userId) {
        await User.update(employee.userId, { isActive: false });
      }

      return { success: true, message: 'Employee deactivated successfully' };
    } catch (error) {
      console.error('Deactivate employee error:', error);
      throw new Error('Failed to deactivate employee');
    }
  }

  // ==========================================
  // DOCUMENT MANAGEMENT
  // ==========================================
  
  static async uploadDocument(employeeId, documentData) {
    try {
      const { documentType, file, uploadedBy } = documentData;

      // Validate employee exists
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Save document record
      const query = `
        INSERT INTO employee_documents (
          employee_id, document_type, file_name, file_path, 
          file_size, mime_type, uploaded_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const result = await executeQuery(query, [
        employeeId,
        documentType,
        file.originalname,
        file.path,
        file.size,
        file.mimetype,
        uploadedBy
      ]);

      return {
        id: result.insertId,
        employeeId,
        documentType,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Upload document error:', error);
      throw new Error('Failed to upload document');
    }
  }

  static async getEmployeeDocuments(employeeId, documentType = null) {
    try {
      let query = `
        SELECT ed.*, 
               CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
        FROM employee_documents ed
        LEFT JOIN users u ON ed.uploaded_by = u.id
        WHERE ed.employee_id = ?
      `;
      const params = [employeeId];

      if (documentType) {
        query += ' AND ed.document_type = ?';
        params.push(documentType);
      }

      query += ' ORDER BY ed.created_at DESC';

      const documents = await executeQuery(query, params);
      return documents;
    } catch (error) {
      console.error('Get employee documents error:', error);
      throw new Error('Failed to retrieve employee documents');
    }
  }

  static async deleteDocument(documentId, userId) {
    try {
      // Check if document exists and user has permission
      const query = 'SELECT * FROM employee_documents WHERE id = ?';
      const documents = await executeQuery(query, [documentId]);

      if (documents.length === 0) {
        throw new Error('Document not found');
      }

      const document = documents[0];

      // Delete from database
      const deleteQuery = 'DELETE FROM employee_documents WHERE id = ?';
      await executeQuery(deleteQuery, [documentId]);

      // TODO: Delete physical file from storage
      // fs.unlinkSync(document.file_path);

      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  }

  // ==========================================
  // EMPLOYEE SEARCH AND FILTERING
  // ==========================================
  
  static async searchEmployees(searchCriteria) {
    try {
      const { 
        query, 
        departmentId, 
        position, 
        status, 
        hireDate, 
        limit = 50 
      } = searchCriteria;

      let sqlQuery = `
        SELECT e.*, d.name as department_name,
               CONCAT(m.first_name, ' ', m.last_name) as manager_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN employees m ON e.manager_id = m.id
        WHERE e.status != 'deleted'
      `;
      const params = [];

      if (query) {
        sqlQuery += ` AND (
          e.first_name LIKE ? OR 
          e.last_name LIKE ? OR 
          e.employee_code LIKE ? OR 
          e.email LIKE ?
        )`;
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (departmentId) {
        sqlQuery += ' AND e.department_id = ?';
        params.push(departmentId);
      }

      if (position) {
        sqlQuery += ' AND e.position LIKE ?';
        params.push(`%${position}%`);
      }

      if (status) {
        sqlQuery += ' AND e.status = ?';
        params.push(status);
      }

      if (hireDate) {
        sqlQuery += ' AND DATE(e.hire_date) = ?';
        params.push(hireDate);
      }

      sqlQuery += ' ORDER BY e.first_name, e.last_name LIMIT ?';
      params.push(parseInt(limit));

      const employees = await executeQuery(sqlQuery, params);
      return employees.map(emp => new Employee(emp));
    } catch (error) {
      console.error('Search employees error:', error);
      throw new Error('Failed to search employees');
    }
  }

  // ==========================================
  // EMPLOYEE STATISTICS
  // ==========================================
  
  static async getEmployeeStatistics() {
    try {
      const stats = {};

      // Total employees by status
      const statusQuery = `
        SELECT status, COUNT(*) as count 
        FROM employees 
        WHERE status != 'deleted'
        GROUP BY status
      `;
      const statusStats = await executeQuery(statusQuery);
      stats.byStatus = statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {});

      // Employees by department
      const deptQuery = `
        SELECT d.name as department, COUNT(e.id) as count
        FROM departments d
        LEFT JOIN employees e ON d.id = e.department_id AND e.status = 'active'
        GROUP BY d.id, d.name
        ORDER BY count DESC
      `;
      const deptStats = await executeQuery(deptQuery);
      stats.byDepartment = deptStats;

      // Recent hires (last 30 days)
      const recentHiresQuery = `
        SELECT COUNT(*) as count
        FROM employees
        WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
          AND status = 'active'
      `;
      const recentHires = await executeQuery(recentHiresQuery);
      stats.recentHires = recentHires[0].count;

      // Average tenure
      const tenureQuery = `
        SELECT AVG(DATEDIFF(CURDATE(), hire_date) / 365.25) as avg_tenure
        FROM employees
        WHERE status = 'active'
      `;
      const tenure = await executeQuery(tenureQuery);
      stats.averageTenure = Math.round(tenure[0].avg_tenure * 10) / 10;

      // Gender distribution
      const genderQuery = `
        SELECT gender, COUNT(*) as count
        FROM employees
        WHERE status = 'active' AND gender IS NOT NULL
        GROUP BY gender
      `;
      const genderStats = await executeQuery(genderQuery);
      stats.byGender = genderStats.reduce((acc, stat) => {
        acc[stat.gender] = stat.count;
        return acc;
      }, {});

      return stats;
    } catch (error) {
      console.error('Get employee statistics error:', error);
      throw new Error('Failed to retrieve employee statistics');
    }
  }

  // ==========================================
  // EMPLOYEE HIERARCHY
  // ==========================================
  
  static async getEmployeeHierarchy(managerId = null) {
    try {
      const query = `
        SELECT e.*, d.name as department_name
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE e.manager_id ${managerId ? '= ?' : 'IS NULL'} 
          AND e.status = 'active'
        ORDER BY e.first_name, e.last_name
      `;
      
      const params = managerId ? [managerId] : [];
      const employees = await executeQuery(query, params);

      // Get subordinates for each employee
      for (const employee of employees) {
        employee.subordinates = await this.getEmployeeHierarchy(employee.id);
      }

      return employees;
    } catch (error) {
      console.error('Get employee hierarchy error:', error);
      throw new Error('Failed to retrieve employee hierarchy');
    }
  }

  static async getManagerChain(employeeId) {
    try {
      const chain = [];
      let currentEmployeeId = employeeId;

      while (currentEmployeeId) {
        const employee = await Employee.findById(currentEmployeeId);
        if (!employee) break;

        chain.push(employee);
        currentEmployeeId = employee.managerId;

        // Prevent infinite loops
        if (chain.length > 10) break;
      }

      return chain;
    } catch (error) {
      console.error('Get manager chain error:', error);
      throw new Error('Failed to retrieve manager chain');
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================
  
  static generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  static async validateEmployeeData(employeeData) {
    const errors = [];

    // Check required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'departmentId', 'position', 'hireDate'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        errors.push(`${field} is required`);
      }
    }

    // Validate email format
    if (employeeData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
      errors.push('Invalid email format');
    }

    // Check if email already exists
    if (employeeData.email) {
      const existingUser = await User.findByEmail(employeeData.email);
      if (existingUser) {
        errors.push('Email already exists');
      }
    }

    // Validate department exists
    if (employeeData.departmentId) {
      const department = await Department.findById(employeeData.departmentId);
      if (!department) {
        errors.push('Invalid department ID');
      }
    }

    // Validate manager exists (if provided)
    if (employeeData.managerId) {
      const manager = await Employee.findById(employeeData.managerId);
      if (!manager) {
        errors.push('Invalid manager ID');
      }
    }

    return errors;
  }

  static async bulkImportEmployees(employeesData) {
    try {
      const results = {
        success: [],
        errors: []
      };

      for (const employeeData of employeesData) {
        try {
          // Validate data
          const validationErrors = await this.validateEmployeeData(employeeData);
          if (validationErrors.length > 0) {
            results.errors.push({
              data: employeeData,
              errors: validationErrors
            });
            continue;
          }

          // Create employee
          const employee = await this.createEmployee(employeeData);
          results.success.push(employee);
        } catch (error) {
          results.errors.push({
            data: employeeData,
            errors: [error.message]
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Bulk import error:', error);
      throw new Error('Failed to import employees');
    }
  }
}

module.exports = EmployeeService;
