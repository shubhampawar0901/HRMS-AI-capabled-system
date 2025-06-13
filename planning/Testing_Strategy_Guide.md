# 🧪 Testing Strategy Guide - Comprehensive Testing for All Agents

## 📋 **Overview**

This document provides detailed testing strategies and examples for all backend services and frontend modules. Each agent must implement comprehensive tests to ensure code quality and reliability.

---

## 🔧 **Backend Testing Strategy**

### **Testing Stack**:
- **Unit Tests**: Jest + Supertest
- **Integration Tests**: Jest + Test Database
- **API Tests**: Supertest for endpoint testing
- **Mocking**: Jest mocks for external services

### **Test Structure**:
```
services/[service-name]/tests/
├── unit/
│   ├── controllers/
│   ├── services/
│   └── models/
├── integration/
│   ├── api/
│   └── database/
├── fixtures/
│   └── testData.js
└── setup/
    ├── testSetup.js
    └── testDatabase.js
```

---

## 🎯 **Agent 1: Authentication Service Tests**

### **Unit Tests Example**:
```javascript
// tests/unit/controllers/AuthController.test.js
const request = require('supertest');
const app = require('../../../../app');
const AuthService = require('../../../services/AuthService');

jest.mock('../../../services/AuthService');

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'employee'
      };
      
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };

      AuthService.validateCredentials.mockResolvedValue(mockUser);
      AuthService.generateTokens.mockResolvedValue(mockTokens);
      AuthService.getEmployeeDetails.mockResolvedValue({
        id: 'emp-123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBe('access-token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 for invalid credentials', async () => {
      AuthService.validateCredentials.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
```

### **Integration Tests Example**:
```javascript
// tests/integration/api/auth.test.js
const request = require('supertest');
const app = require('../../../../app');
const { setupTestDatabase, cleanupTestDatabase } = require('../../setup/testDatabase');

describe('Auth API Integration', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('Complete login flow', () => {
    it('should handle complete login and token refresh flow', async () => {
      // Create test user
      const testUser = await createTestUser({
        email: 'integration@test.com',
        password: 'password123',
        role: 'employee'
      });

      // Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        })
        .expect(200);

      const { token, refreshToken } = loginResponse.body.data;

      // Use token for authenticated request
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.data.email).toBe('integration@test.com');

      // Test token refresh
      const refreshResponse = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(refreshResponse.body.data.token).toBeDefined();
    });
  });
});
```

---

## 🎯 **Agent 2: Employee Service Tests**

### **Model Tests Example**:
```javascript
// tests/unit/models/Employee.test.js
const EmployeeModel = require('../../../models/Employee');
const { setupTestDatabase } = require('../../setup/testDatabase');

describe('Employee Model', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  describe('create', () => {
    it('should create employee with valid data', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        departmentId: 'dept-123',
        position: 'Developer',
        basicSalary: 50000
      };

      const employee = await EmployeeModel.create(employeeData);

      expect(employee.id).toBeDefined();
      expect(employee.firstName).toBe('John');
      expect(employee.employeeCode).toMatch(/^EMP\d{3}$/);
    });

    it('should throw error for duplicate email', async () => {
      const employeeData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john@example.com', // Duplicate email
        departmentId: 'dept-123',
        position: 'Designer'
      };

      await expect(EmployeeModel.create(employeeData))
        .rejects
        .toThrow('Email already exists');
    });
  });
});
```

---

## 🎨 **Frontend Testing Strategy**

### **Testing Stack**:
- **Unit Tests**: Jest + React Testing Library
- **Component Tests**: React Testing Library
- **Integration Tests**: MSW (Mock Service Worker)
- **E2E Tests**: Cypress (optional)

### **Test Structure**:
```
modules/[module-name]/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── store/
├── __mocks__/
│   └── api.js
└── test-utils/
    └── renderWithProviders.js
```

---

## 🎯 **Agent 9: Authentication Module Tests**

### **Component Tests Example**:
```javascript
// modules/auth/__tests__/components/LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LoginForm from '../../components/LoginForm';
import authSlice from '../../store/authSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice
    },
    preloadedState: {
      auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('LoginForm', () => {
  it('should render login form fields', () => {
    const store = createMockStore();
    renderWithStore(<LoginForm />, store);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const store = createMockStore();
    renderWithStore(<LoginForm />, store);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Signing in...');
    });
  });

  it('should display error message on login failure', async () => {
    const store = createMockStore({
      error: 'Invalid credentials'
    });
    
    renderWithStore(<LoginForm />, store);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
```

### **Redux Store Tests Example**:
```javascript
// modules/auth/__tests__/store/authSlice.test.js
import authSlice, { loginUser, logout } from '../../store/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  };

  it('should handle logout', () => {
    const previousState = {
      user: { id: '123', email: 'test@example.com' },
      token: 'token123',
      isAuthenticated: true,
      isLoading: false,
      error: null
    };

    const action = logout();
    const state = authSlice.reducer(previousState, action);

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle loginUser.pending', () => {
    const action = { type: loginUser.pending.type };
    const state = authSlice.reducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle loginUser.fulfilled', () => {
    const payload = {
      user: { id: '123', email: 'test@example.com' },
      token: 'token123'
    };
    
    const action = { type: loginUser.fulfilled.type, payload };
    const state = authSlice.reducer(initialState, action);

    expect(state.user).toEqual(payload.user);
    expect(state.token).toBe('token123');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });
});
```

---

## 🎯 **Integration Testing with MSW**

### **API Mocking Setup**:
```javascript
// test-utils/mswSetup.js
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.json({
          success: true,
          data: {
            token: 'mock-token',
            user: {
              id: '123',
              email: 'test@example.com',
              role: 'employee'
            }
          }
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        message: 'Invalid credentials'
      })
    );
  }),
  
  rest.get('/api/employees', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          employees: [
            {
              id: '1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1
          }
        }
      })
    );
  })
];

export const server = setupServer(...handlers);
```

---

## 📊 **Test Coverage Requirements**

### **Minimum Coverage Targets**:
- **Unit Tests**: 90% line coverage
- **Integration Tests**: All API endpoints
- **Component Tests**: All user interactions
- **Error Scenarios**: All error paths tested

### **Test Commands**:
```bash
# Backend tests
npm run test:unit
npm run test:integration
npm run test:coverage

# Frontend tests
npm run test:components
npm run test:hooks
npm run test:store
npm run test:coverage
```

### **CI/CD Integration**:
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run backend tests
        run: npm run test:backend:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v1

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run frontend tests
        run: npm run test:frontend:coverage
```

This testing strategy ensures comprehensive coverage and quality for all agent implementations.
