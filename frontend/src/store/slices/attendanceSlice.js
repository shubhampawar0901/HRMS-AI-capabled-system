import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceService } from '@/services/attendanceService';

// Async thunks for attendance operations
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (checkInData, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkIn(checkInData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (checkOutData, { rejectWithValue }) => {
    try {
      const response = await attendanceService.checkOut(checkOutData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getTodayAttendance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today\'s attendance');
    }
  }
);

export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchAttendanceHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceHistory(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance history');
    }
  }
);

export const fetchTeamAttendance = createAsyncThunk(
  'attendance/fetchTeamAttendance',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getTeamAttendance(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team attendance');
    }
  }
);

export const fetchAttendanceStats = createAsyncThunk(
  'attendance/fetchAttendanceStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attendance statistics');
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.updateAttendance(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update attendance');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    todayAttendance: null,
    attendanceHistory: [],
    teamAttendance: [],
    attendanceStats: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0
    },
    filters: {
      startDate: '',
      endDate: '',
      employeeId: '',
      status: ''
    },
    isLoading: false,
    isCheckingIn: false,
    isCheckingOut: false,
    isUpdating: false,
    error: null,
    success: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTodayAttendance: (state) => {
      state.todayAttendance = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    resetAttendanceState: (state) => {
      state.attendanceHistory = [];
      state.teamAttendance = [];
      state.attendanceStats = null;
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
      };
      state.filters = {
        startDate: '',
        endDate: '',
        employeeId: '',
        status: ''
      };
      state.error = null;
      state.success = null;
    },
    updateTodayAttendance: (state, action) => {
      state.todayAttendance = { ...state.todayAttendance, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Check in
      .addCase(checkIn.pending, (state) => {
        state.isCheckingIn = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        state.isCheckingIn = false;
        state.todayAttendance = action.payload;
        state.success = 'Checked in successfully';
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.isCheckingIn = false;
        state.error = action.payload;
      })
      
      // Check out
      .addCase(checkOut.pending, (state) => {
        state.isCheckingOut = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        state.isCheckingOut = false;
        state.todayAttendance = action.payload;
        state.success = 'Checked out successfully';
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.isCheckingOut = false;
        state.error = action.payload;
      })
      
      // Fetch today's attendance
      .addCase(fetchTodayAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodayAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.todayAttendance = action.payload;
      })
      .addCase(fetchTodayAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch attendance history
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.attendanceHistory = action.payload.attendance || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch team attendance
      .addCase(fetchTeamAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamAttendance = action.payload.attendance || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchTeamAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch attendance stats
      .addCase(fetchAttendanceStats.fulfilled, (state, action) => {
        state.attendanceStats = action.payload;
      })
      
      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.attendanceHistory.findIndex(att => att.id === action.payload.id);
        if (index !== -1) {
          state.attendanceHistory[index] = action.payload;
        }
        state.success = 'Attendance updated successfully';
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearTodayAttendance, 
  clearError, 
  clearSuccess, 
  resetAttendanceState,
  updateTodayAttendance
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
