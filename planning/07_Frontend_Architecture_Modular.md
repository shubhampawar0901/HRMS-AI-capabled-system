# 🎨 Modular Frontend Architecture - Independent Development

## 🎯 **Frontend Architecture for Multi-Agent Development**

This frontend architecture enables **multiple agents to work independently** on different modules without conflicts. Each module is self-contained with its own components, services, and state management.

---

## 📁 **Project Structure**

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── App.tsx                     # Main application component
│   ├── index.tsx                   # Application entry point
│   ├── shared/                     # Shared utilities and components
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Layout.tsx
│   │   │   ├── UI/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── index.ts
│   │   │   └── Common/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   ├── hooks/                  # Shared custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── services/               # API service layer
│   │   │   ├── api.ts              # Base API configuration
│   │   │   ├── auth.ts             # Authentication utilities
│   │   │   └── types.ts            # Shared TypeScript types
│   │   ├── store/                  # Redux store configuration
│   │   │   ├── index.ts            # Store setup
│   │   │   ├── rootReducer.ts      # Root reducer
│   │   │   └── middleware.ts       # Custom middleware
│   │   ├── utils/                  # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   ├── validation.ts
│   │   │   └── formatters.ts
│   │   └── styles/                 # Global styles and theme
│   │       ├── globals.css
│   │       ├── theme.ts
│   │       └── variables.css
│   ├── modules/                    # Feature modules (independent)
│   │   ├── auth/                   # 🔐 Authentication Module
│   │   ├── dashboard/              # 🏠 Dashboard Module
│   │   ├── employees/              # 👥 Employee Management Module
│   │   ├── attendance/             # ⏰ Attendance Module
│   │   ├── leave/                  # 🏖️ Leave Management Module
│   │   ├── payroll/                # 💰 Payroll Module
│   │   ├── performance/            # 📊 Performance Module
│   │   ├── ai-features/            # 🤖 AI Features Module
│   │   └── reports/                # 📈 Reports Module
│   └── types/                      # Global TypeScript definitions
│       ├── api.ts
│       ├── user.ts
│       └── common.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🧩 **Module Template Structure**

Each module follows this exact structure for consistency:

```
modules/[module-name]/
├── index.ts                        # Module entry point and exports
├── routes.tsx                      # Module routing configuration
├── components/                     # Module-specific components
│   ├── [Feature]List.tsx
│   ├── [Feature]Form.tsx
│   ├── [Feature]Details.tsx
│   └── index.ts                    # Component exports
├── pages/                          # Page components
│   ├── [Feature]Page.tsx
│   ├── [Feature]ListPage.tsx
│   └── index.ts                    # Page exports
├── services/                       # Module API services
│   ├── [module]Api.ts
│   ├── types.ts                    # Module-specific types
│   └── index.ts                    # Service exports
├── store/                          # Module state management
│   ├── [module]Slice.ts            # Redux slice
│   ├── selectors.ts                # State selectors
│   ├── thunks.ts                   # Async actions
│   └── index.ts                    # Store exports
├── hooks/                          # Module-specific hooks
│   ├── use[Module].ts
│   └── index.ts                    # Hook exports
├── utils/                          # Module utilities
│   ├── [module]Utils.ts
│   ├── validation.ts
│   └── constants.ts
└── tests/                          # Module tests
    ├── components/
    ├── services/
    └── utils/
```

---

## 🔐 **Example: Auth Module (Complete Implementation)**

### **modules/auth/index.ts**
```typescript
// Auth module entry point
export { default as AuthRoutes } from './routes';
export * from './components';
export * from './pages';
export * from './services';
export * from './store';
export * from './hooks';
```

### **modules/auth/routes.tsx**
```typescript
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, ForgotPasswordPage, ResetPasswordPage } from './pages';

const AuthRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
```

### **modules/auth/components/LoginForm.tsx**
```typescript
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Button, Input } from '../../../shared/components/UI';
import { useAuth } from '../hooks';
import { loginUser } from '../store/authSlice';
import { validateLoginForm } from '../utils/validation';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      onSuccess?.();
    } catch (error: any) {
      // Handle login errors
      if (error.field) {
        setErrors({ [error.field]: error.message });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
      </div>
      
      <div>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
        />
      </div>

      {errors.general && (
        <div className="text-red-500 text-sm">{errors.general}</div>
      )}

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
```

### **modules/auth/pages/LoginPage.tsx**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components';
import { useAuth } from '../hooks';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm onSuccess={() => window.location.href = '/dashboard'} />
          
          <div className="mt-4 text-center">
            <a
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
```

### **modules/auth/services/authApi.ts**
```typescript
import { api } from '../../../shared/services/api';
import { LoginCredentials, LoginResponse, User } from './types';

export class AuthAPI {
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  static async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  static async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  }

  static async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  }
}
```

### **modules/auth/store/authSlice.ts**
```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthAPI } from '../services/authApi';
import { LoginCredentials, User } from '../services/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await AuthAPI.login(credentials);
      
      // Store tokens in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
```

### **modules/auth/hooks/useAuth.ts**
```typescript
import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../../../shared/store';
import { loginUser, logoutUser, clearError } from '../store/authSlice';
import { LoginCredentials } from '../services/types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials)).unwrap();
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(logoutUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    ...authState,
    login,
    logout,
    clearError: clearAuthError
  };
};
```

---

## 🔄 **Module Integration in Main App**

### **App.tsx**
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './shared/store';
import { Layout } from './shared/components/Layout';
import { ProtectedRoute } from './shared/components/Common';

// Module imports
import { AuthRoutes } from './modules/auth';
import { DashboardRoutes } from './modules/dashboard';
import { EmployeeRoutes } from './modules/employees';
import { AttendanceRoutes } from './modules/attendance';
import { LeaveRoutes } from './modules/leave';
import { PayrollRoutes } from './modules/payroll';
import { PerformanceRoutes } from './modules/performance';
import { AIFeaturesRoutes } from './modules/ai-features';
import { ReportsRoutes } from './modules/reports';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/auth/*" element={<AuthRoutes />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard/*" element={<DashboardRoutes />} />
                  <Route path="/employees/*" element={<EmployeeRoutes />} />
                  <Route path="/attendance/*" element={<AttendanceRoutes />} />
                  <Route path="/leave/*" element={<LeaveRoutes />} />
                  <Route path="/payroll/*" element={<PayrollRoutes />} />
                  <Route path="/performance/*" element={<PerformanceRoutes />} />
                  <Route path="/ai/*" element={<AIFeaturesRoutes />} />
                  <Route path="/reports/*" element={<ReportsRoutes />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
```

---

## 🎯 **Module Independence Guidelines**

### **1. State Management**
- Each module manages its own Redux slice
- No direct access to other module's state
- Communication through shared events if needed

### **2. API Services**
- Module-specific API services
- Shared base API configuration
- Independent error handling

### **3. Components**
- Module-specific components
- Shared UI components for consistency
- No cross-module component dependencies

### **4. Routing**
- Each module defines its own routes
- Nested routing within modules
- Independent navigation logic

### **5. Development Workflow**
```bash
# Agent 1 works on auth module
cd src/modules/auth
npm run test:auth
npm run dev:auth

# Agent 2 works on employee module
cd src/modules/employees
npm run test:employees
npm run dev:employees

# No conflicts between agents
```

---

## 🔧 **Shared Services Configuration**

### **shared/services/api.ts**
```typescript
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { store } from '../store';

class APIService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for auth token
    this.instance.interceptors.request.use(
      (config) => {
        const state = store.getState();
        const token = state.auth.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          store.dispatch({ type: 'auth/logout' });
        }
        
        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  get = (url: string, config?: AxiosRequestConfig) => this.instance.get(url, config);
  post = (url: string, data?: any, config?: AxiosRequestConfig) => this.instance.post(url, data, config);
  put = (url: string, data?: any, config?: AxiosRequestConfig) => this.instance.put(url, data, config);
  delete = (url: string, config?: AxiosRequestConfig) => this.instance.delete(url, config);
}

export const api = new APIService();
```

This modular frontend architecture ensures that multiple agents can work simultaneously on different modules without any conflicts, while maintaining consistency and shared functionality across the application.
