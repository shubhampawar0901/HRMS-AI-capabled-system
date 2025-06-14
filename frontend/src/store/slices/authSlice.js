import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '@/services/authService';

// Helper function to safely parse JSON from localStorage
const safeParseJSON = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to parse ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Remove corrupted data
    return null;
  }
};

// Async thunks for authentication actions
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const user = safeParseJSON('user');

      if (token && !user) {
        // Token exists but no user data, fetch user profile
        const response = await authService.getProfile();
        localStorage.setItem('user', JSON.stringify(response.data));
        return {
          user: response.data,
          token,
          isAuthenticated: true
        };
      } else if (token && user) {
        // Both token and user exist
        return {
          user,
          token,
          isAuthenticated: true
        };
      } else {
        // No token or user, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
        return {
          user: null,
          token: null,
          isAuthenticated: false
        };
      }
    } catch (error) {
      // If profile fetch fails, clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Authentication initialization failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      // Backend returns nested data: response.data.data.accessToken
      const responseData = response.data.data || response.data;
      const token = responseData.accessToken || responseData.token;
      const user = responseData.user;

      if (!token || !user) {
        throw new Error('Invalid response structure from server');
      }

      localStorage.setItem('token', token);
      if (responseData.refreshToken) {
        localStorage.setItem('refreshToken', responseData.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      return {
        token,
        user,
        refreshToken: responseData.refreshToken
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);



export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return true;
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return true;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(profileData);
      const responseData = response.data.data || response.data;
      const user = responseData.user || responseData;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Profile update failed');
    }
  }
);

export const refreshUserData = createAsyncThunk(
  'auth/refreshUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      const responseData = response.data.data || response.data;
      const user = responseData.user || responseData;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to refresh user data');
    }
  }
);



// Initial state
const initialState = {
  user: safeParseJSON('user'),
  token: localStorage.getItem('token') || null,
  isAuthenticated: false, // Will be set by initializeAuth
  isLoading: true, // Start with loading to trigger initialization
  error: null,
  loginAttempts: 0,
  lastLoginTime: null
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // state.loginAttempts += 1; // DISABLED: No rate limiting for development
      })
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear the state
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginTime = null;
      })
      // Update profile cases
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Refresh user data cases
      .addCase(refreshUserData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(refreshUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setLoading,
  resetLoginAttempts,
  incrementLoginAttempts,
  setAuthenticated,
  updateUser,
  clearAuthState
} = authSlice.actions;

export default authSlice.reducer;
