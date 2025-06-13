import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '@/services/dashboardService';

// Async thunks for dashboard actions
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (role, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getDashboardStats(role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentActivities(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch recent activities');
    }
  }
);

export const fetchQuickActions = createAsyncThunk(
  'dashboard/fetchQuickActions',
  async (role, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getQuickActions(role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch quick actions');
    }
  }
);

export const fetchAttendanceWidget = createAsyncThunk(
  'dashboard/fetchAttendanceWidget',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAttendanceWidget(employeeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance data');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'dashboard/fetchPerformanceMetrics',
  async ({ employeeId, period }, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getPerformanceMetrics(employeeId, period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch performance metrics');
    }
  }
);

export const fetchLeaveSummary = createAsyncThunk(
  'dashboard/fetchLeaveSummary',
  async (employeeId, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getLeaveSummary(employeeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch leave summary');
    }
  }
);

export const fetchTeamOverview = createAsyncThunk(
  'dashboard/fetchTeamOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getTeamOverview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch team overview');
    }
  }
);

export const fetchNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getNotifications(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'dashboard/markNotificationRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await dashboardService.markNotificationRead(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

// Initial state
const initialState = {
  stats: {
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  },
  recentActivities: {
    data: [],
    isLoading: false,
    error: null,
    lastFetch: null
  },
  quickActions: {
    data: [],
    isLoading: false,
    error: null
  },
  attendanceWidget: {
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  },
  performanceMetrics: {
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  },
  leaveSummary: {
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  },
  teamOverview: {
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  },
  notifications: {
    data: [],
    isLoading: false,
    error: null,
    unreadCount: 0
  },
  refreshing: false,
  lastRefresh: null
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      return initialState;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    updateNotificationCount: (state, action) => {
      state.notifications.unreadCount = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.data.unshift(action.payload);
      state.notifications.unreadCount += 1;
    },
    clearError: (state, action) => {
      const section = action.payload;
      if (section && state[section]) {
        state[section].error = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats cases
      .addCase(fetchDashboardStats.pending, (state) => {
        state.stats.isLoading = true;
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats.isLoading = false;
        state.stats.data = action.payload;
        state.stats.lastFetch = new Date().toISOString();
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.stats.isLoading = false;
        state.stats.error = action.payload;
      })
      // Recent activities cases
      .addCase(fetchRecentActivities.pending, (state) => {
        state.recentActivities.isLoading = true;
        state.recentActivities.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities.isLoading = false;
        state.recentActivities.data = action.payload;
        state.recentActivities.lastFetch = new Date().toISOString();
        state.recentActivities.error = null;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.recentActivities.isLoading = false;
        state.recentActivities.error = action.payload;
      })
      // Quick actions cases
      .addCase(fetchQuickActions.pending, (state) => {
        state.quickActions.isLoading = true;
        state.quickActions.error = null;
      })
      .addCase(fetchQuickActions.fulfilled, (state, action) => {
        state.quickActions.isLoading = false;
        state.quickActions.data = action.payload;
        state.quickActions.error = null;
      })
      .addCase(fetchQuickActions.rejected, (state, action) => {
        state.quickActions.isLoading = false;
        state.quickActions.error = action.payload;
      })
      // Attendance widget cases
      .addCase(fetchAttendanceWidget.pending, (state) => {
        state.attendanceWidget.isLoading = true;
        state.attendanceWidget.error = null;
      })
      .addCase(fetchAttendanceWidget.fulfilled, (state, action) => {
        state.attendanceWidget.isLoading = false;
        state.attendanceWidget.data = action.payload;
        state.attendanceWidget.lastFetch = new Date().toISOString();
        state.attendanceWidget.error = null;
      })
      .addCase(fetchAttendanceWidget.rejected, (state, action) => {
        state.attendanceWidget.isLoading = false;
        state.attendanceWidget.error = action.payload;
      })
      // Performance metrics cases
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.performanceMetrics.isLoading = true;
        state.performanceMetrics.error = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.performanceMetrics.isLoading = false;
        state.performanceMetrics.data = action.payload;
        state.performanceMetrics.lastFetch = new Date().toISOString();
        state.performanceMetrics.error = null;
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.performanceMetrics.isLoading = false;
        state.performanceMetrics.error = action.payload;
      })
      // Leave summary cases
      .addCase(fetchLeaveSummary.pending, (state) => {
        state.leaveSummary.isLoading = true;
        state.leaveSummary.error = null;
      })
      .addCase(fetchLeaveSummary.fulfilled, (state, action) => {
        state.leaveSummary.isLoading = false;
        state.leaveSummary.data = action.payload;
        state.leaveSummary.lastFetch = new Date().toISOString();
        state.leaveSummary.error = null;
      })
      .addCase(fetchLeaveSummary.rejected, (state, action) => {
        state.leaveSummary.isLoading = false;
        state.leaveSummary.error = action.payload;
      })
      // Team overview cases
      .addCase(fetchTeamOverview.pending, (state) => {
        state.teamOverview.isLoading = true;
        state.teamOverview.error = null;
      })
      .addCase(fetchTeamOverview.fulfilled, (state, action) => {
        state.teamOverview.isLoading = false;
        state.teamOverview.data = action.payload;
        state.teamOverview.lastFetch = new Date().toISOString();
        state.teamOverview.error = null;
      })
      .addCase(fetchTeamOverview.rejected, (state, action) => {
        state.teamOverview.isLoading = false;
        state.teamOverview.error = action.payload;
      })
      // Notifications cases
      .addCase(fetchNotifications.pending, (state) => {
        state.notifications.isLoading = true;
        state.notifications.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications.isLoading = false;
        state.notifications.data = action.payload;
        state.notifications.unreadCount = action.payload.filter(n => !n.read).length;
        state.notifications.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notifications.isLoading = false;
        state.notifications.error = action.payload;
      })
      // Mark notification read cases
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.data.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.notifications.unreadCount = Math.max(0, state.notifications.unreadCount - 1);
        }
      });
  }
});

export const { 
  clearDashboardData, 
  setRefreshing, 
  updateNotificationCount, 
  addNotification,
  clearError 
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
