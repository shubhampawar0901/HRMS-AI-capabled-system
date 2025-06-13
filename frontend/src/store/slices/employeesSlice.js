import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '@/services/employeeService';

// Async thunks for employee operations
export const fetchEmployees = createAsyncThunk(
  'employees/fetchEmployees',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchEmployeeById = createAsyncThunk(
  'employees/fetchEmployeeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployeeById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/createEmployee',
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await employeeService.createEmployee(employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/updateEmployee',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateEmployee(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/deleteEmployee',
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete employee');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'employees/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await employeeService.getDepartments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const uploadEmployeeDocument = createAsyncThunk(
  'employees/uploadDocument',
  async ({ employeeId, formData }, { rejectWithValue }) => {
    try {
      const response = await employeeService.uploadDocument(employeeId, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    employees: [],
    currentEmployee: null,
    departments: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {
      search: '',
      departmentId: '',
      status: 'active'
    },
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isUploadingDocument: false,
    error: null,
    success: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetEmployeeState: (state) => {
      state.employees = [];
      state.currentEmployee = null;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      };
      state.filters = {
        search: '',
        departmentId: '',
        status: 'active'
      };
      state.error = null;
      state.success = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch employees
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload.employees || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch employee by ID
      .addCase(fetchEmployeeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEmployee = action.payload;
      })
      .addCase(fetchEmployeeById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create employee
      .addCase(createEmployee.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.isCreating = false;
        state.employees.unshift(action.payload);
        state.success = 'Employee created successfully';
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update employee
      .addCase(updateEmployee.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.employees.findIndex(emp => emp.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        state.currentEmployee = action.payload;
        state.success = 'Employee updated successfully';
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete employee
      .addCase(deleteEmployee.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.employees = state.employees.filter(emp => emp.id !== action.payload);
        state.success = 'Employee deleted successfully';
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Fetch departments
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      })
      
      // Upload document
      .addCase(uploadEmployeeDocument.pending, (state) => {
        state.isUploadingDocument = true;
        state.error = null;
      })
      .addCase(uploadEmployeeDocument.fulfilled, (state, action) => {
        state.isUploadingDocument = false;
        state.success = 'Document uploaded successfully';
      })
      .addCase(uploadEmployeeDocument.rejected, (state, action) => {
        state.isUploadingDocument = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearCurrentEmployee, 
  clearError, 
  clearSuccess, 
  resetEmployeeState 
} = employeesSlice.actions;

export default employeesSlice.reducer;
