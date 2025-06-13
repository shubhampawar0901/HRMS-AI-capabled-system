const { Employee, Department, User } = require('../models');
const { sendSuccess, sendError, sendCreated } = require('../utils/responseHelper');

class EmployeeController {
  // ==========================================
  // EMPLOYEE CRUD OPERATIONS
  // ==========================================
  
  static async getAllEmployees(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        departmentId, 
        status = 'active',
        search 
      } = req.query;

      const options = {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        departmentId,
        status,
        search
      };

      const employees = await Employee.findAll(options);
      const total = await Employee.count({ departmentId, status, search });

      return sendSuccess(res, {
        employees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }, 'Employees retrieved successfully');
    } catch (error) {
      console.error('Get employees error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id);

      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      return sendSuccess(res, employee, 'Employee retrieved successfully');
    } catch (error) {
      console.error('Get employee error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async createEmployee(req, res) {
    try {
      const employeeData = req.body;
      
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'departmentId', 'position', 'hireDate'];
      for (const field of requiredFields) {
        if (!employeeData[field]) {
          return sendError(res, `${field} is required`, 400);
        }
      }

      // Generate employee code
      employeeData.employeeCode = await Employee.generateEmployeeCode();

      // Create employee
      const employee = await Employee.create(employeeData);

      return sendCreated(res, employee, 'Employee created successfully');
    } catch (error) {
      console.error('Create employee error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const employee = await Employee.findById(id);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      const updatedEmployee = await Employee.update(id, updateData);
      return sendSuccess(res, updatedEmployee, 'Employee updated successfully');
    } catch (error) {
      console.error('Update employee error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params;

      const employee = await Employee.findById(id);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      await Employee.delete(id);
      return sendSuccess(res, null, 'Employee deleted successfully');
    } catch (error) {
      console.error('Delete employee error:', error);
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // EMPLOYEE PROFILE OPERATIONS
  // ==========================================
  
  static async getEmployeeProfile(req, res) {
    try {
      const { userId } = req.user;
      const employee = await Employee.findByUserId(userId);

      if (!employee) {
        return sendError(res, 'Employee profile not found', 404);
      }

      return sendSuccess(res, employee, 'Employee profile retrieved successfully');
    } catch (error) {
      console.error('Get employee profile error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async updateEmployeeProfile(req, res) {
    try {
      const { userId } = req.user;
      const updateData = req.body;

      const employee = await Employee.findByUserId(userId);
      if (!employee) {
        return sendError(res, 'Employee profile not found', 404);
      }

      // Restrict certain fields from self-update
      const restrictedFields = ['basicSalary', 'status', 'managerId', 'departmentId'];
      restrictedFields.forEach(field => delete updateData[field]);

      const updatedEmployee = await Employee.update(employee.id, updateData);
      return sendSuccess(res, updatedEmployee, 'Profile updated successfully');
    } catch (error) {
      console.error('Update employee profile error:', error);
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // DEPARTMENT OPERATIONS
  // ==========================================
  
  static async getAllDepartments(req, res) {
    try {
      const { search } = req.query;
      const departments = await Department.findAll({ search });
      return sendSuccess(res, departments, 'Departments retrieved successfully');
    } catch (error) {
      console.error('Get departments error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const department = await Department.findById(id);

      if (!department) {
        return sendError(res, 'Department not found', 404);
      }

      return sendSuccess(res, department, 'Department retrieved successfully');
    } catch (error) {
      console.error('Get department error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async createDepartment(req, res) {
    try {
      const { name, description, managerId } = req.body;

      if (!name) {
        return sendError(res, 'Department name is required', 400);
      }

      // Check if department name already exists
      const existingDepartment = await Department.findByName(name);
      if (existingDepartment) {
        return sendError(res, 'Department name already exists', 400);
      }

      const department = await Department.create({
        name,
        description,
        managerId
      });

      return sendCreated(res, department, 'Department created successfully');
    } catch (error) {
      console.error('Create department error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const department = await Department.findById(id);
      if (!department) {
        return sendError(res, 'Department not found', 404);
      }

      const updatedDepartment = await Department.update(id, updateData);
      return sendSuccess(res, updatedDepartment, 'Department updated successfully');
    } catch (error) {
      console.error('Update department error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      const department = await Department.findById(id);
      if (!department) {
        return sendError(res, 'Department not found', 404);
      }

      // Check if department has employees
      const employeeCount = await Department.getEmployeeCount(id);
      if (employeeCount > 0) {
        return sendError(res, 'Cannot delete department with active employees', 400);
      }

      await Department.delete(id);
      return sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
      console.error('Delete department error:', error);
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // DOCUMENT OPERATIONS
  // ==========================================
  
  static async uploadEmployeeDocument(req, res) {
    try {
      const { id } = req.params;
      const { documentType } = req.body;

      if (!req.file) {
        return sendError(res, 'No file uploaded', 400);
      }

      const employee = await Employee.findById(id);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // For now, return a placeholder response for document upload
      const document = {
        id: Date.now(),
        employeeId: id,
        documentType,
        fileName: req.file.originalname,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
      };

      return sendCreated(res, document, 'Document uploaded successfully');
    } catch (error) {
      console.error('Upload document error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async getEmployeeDocuments(req, res) {
    try {
      const { id } = req.params;
      const { documentType } = req.query;

      const employee = await Employee.findById(id);
      if (!employee) {
        return sendError(res, 'Employee not found', 404);
      }

      // For now, return placeholder documents
      const documents = [];
      return sendSuccess(res, documents, 'Documents retrieved successfully');
    } catch (error) {
      console.error('Get documents error:', error);
      return sendError(res, error.message, 500);
    }
  }

  // ==========================================
  // STATISTICS AND REPORTS
  // ==========================================
  
  static async getEmployeeStats(req, res) {
    try {
      // For now, return placeholder stats
      const stats = {
        totalEmployees: await Employee.count({}),
        activeEmployees: await Employee.count({ status: 'active' }),
        inactiveEmployees: await Employee.count({ status: 'inactive' }),
        departmentCount: await Department.count({})
      };
      return sendSuccess(res, stats, 'Employee statistics retrieved successfully');
    } catch (error) {
      console.error('Get employee stats error:', error);
      return sendError(res, error.message, 500);
    }
  }

  static async getDepartmentStats(req, res) {
    try {
      const stats = await Department.getDepartmentStats();
      return sendSuccess(res, stats, 'Department statistics retrieved successfully');
    } catch (error) {
      console.error('Get department stats error:', error);
      return sendError(res, error.message, 500);
    }
  }
}

module.exports = EmployeeController;
