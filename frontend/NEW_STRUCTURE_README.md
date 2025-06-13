# 🎨 HRMS Frontend - New Architecture Guide

## 📁 **Folder Structure Overview**

```
frontend/src/
├── api/                    # API Configuration Layer
│   ├── endpoints.js        # Centralized API endpoints
│   ├── axiosInstance.js    # Axios configuration with interceptors
│   └── interceptors.js     # Error handling & loading management
├── services/               # Business Logic Layer
│   ├── authService.js      # Authentication operations
│   ├── employeeService.js  # Employee CRUD operations
│   ├── attendanceService.js # Attendance management
│   ├── leaveService.js     # Leave management
│   ├── payrollService.js   # Payroll operations
│   ├── performanceService.js # Performance management
│   ├── aiService.js        # AI features integration
│   ├── reportService.js    # Reports generation
│   └── dashboardService.js # Dashboard data
├── components/             # UI Components Layer
│   ├── ui/                 # Base UI components
│   ├── layout/             # Layout components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   ├── employees/          # Employee components
│   ├── attendance/         # Attendance components
│   ├── leave/              # Leave components
│   ├── payroll/            # Payroll components
│   ├── performance/        # Performance components
│   ├── ai-features/        # AI features components
│   ├── reports/            # Reports components
│   ├── forms/              # Reusable form components
│   └── charts/             # Chart components
├── pages/                  # Page Components
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   ├── employees/          # Employee pages
│   ├── attendance/         # Attendance pages
│   ├── leave/              # Leave pages
│   ├── payroll/            # Payroll pages
│   ├── performance/        # Performance pages
│   ├── ai-features/        # AI features pages
│   └── reports/            # Reports pages
├── store/                  # State Management
│   ├── slices/             # Redux slices
│   └── index.js            # Store configuration
├── hooks/                  # Custom React Hooks
│   ├── useAuth.js          # Authentication hook
│   ├── useApi.js           # API call hook
│   └── useLocalStorage.js  # Local storage hook
├── utils/                  # Utility Functions
│   ├── dateUtils.js        # Date formatting & calculations
│   ├── validationUtils.js  # Form validation helpers
│   └── formatUtils.js      # Data formatting utilities
├── routes/                 # Route Configuration
│   ├── AppRoutes.jsx       # Main route configuration
│   ├── ProtectedRoute.jsx  # Protected routes wrapper
│   └── PublicRoute.jsx     # Public routes wrapper
├── contexts/               # React Contexts
├── lib/                    # Third-party configurations
├── assets/                 # Static assets
└── styles/                 # Global styles
```

## 🚀 **Key Features**

### **1. API Layer**
- **Centralized Endpoints**: All API URLs in one place
- **Axios Configuration**: Pre-configured with auth headers
- **Auto Token Refresh**: Handles 401 errors automatically
- **Error Handling**: Comprehensive error management
- **Loading States**: Built-in loading management

### **2. Services Layer**
- **Business Logic**: Separated from UI components
- **Reusable**: Services can be used across components
- **Type Safety**: Better TypeScript support
- **Testing**: Easy to unit test independently
- **Caching**: Built-in response caching

### **3. Component Architecture**
- **Feature-based**: Components organized by feature
- **Reusable UI**: Base UI components for consistency
- **Separation**: Clear separation between pages and components
- **Modularity**: Easy to maintain and extend

### **4. Custom Hooks**
- **useAuth**: Complete authentication management
- **useApi**: API calls with loading and error states
- **useLocalStorage**: Persistent local storage with sync

### **5. Utility Functions**
- **Date Utils**: Comprehensive date handling
- **Validation**: Form validation helpers
- **Formatting**: Data formatting utilities

## 📝 **Usage Examples**

### **Using Services**
```javascript
import { employeeService } from '@/services/employeeService';

// In a component
const fetchEmployees = async () => {
  try {
    const response = await employeeService.getEmployees({ page: 1, limit: 10 });
    setEmployees(response.data);
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
};
```

### **Using Custom Hooks**
```javascript
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  const {
    data: employees,
    isLoading,
    error,
    execute: fetchEmployees
  } = useApi(employeeService.getEmployees);
  
  // Component logic...
};
```

### **Using Utilities**
```javascript
import { formatCurrency, formatDate } from '@/utils/formatUtils';
import { validateEmail } from '@/utils/validationUtils';

// Format data for display
const formattedSalary = formatCurrency(50000); // ₹50,000
const formattedDate = formatDate(new Date(), 'long'); // Monday, January 1, 2024
const isValid = validateEmail('user@example.com'); // true
```

## 🔧 **Import Path Standards**

```javascript
// UI Components
import { Button } from '@/components/ui/button';

// Feature Components
import { EmployeeCard } from '@/components/employees/EmployeeCard';

// Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';

// Services
import { authService } from '@/services/authService';

// Hooks
import { useAuth } from '@/hooks/useAuth';

// Utils
import { formatDate } from '@/utils/dateUtils';

// Store
import { store } from '@/store';
```

## 🎯 **Development Guidelines**

### **1. Component Development**
- Place components in feature-specific folders
- Use TypeScript for better type safety
- Follow naming conventions (PascalCase for components)
- Keep components focused and single-purpose

### **2. Service Development**
- All API calls should go through services
- Use the `apiRequest` wrapper for consistent error handling
- Implement proper loading states
- Add JSDoc comments for better documentation

### **3. Hook Development**
- Create custom hooks for reusable logic
- Use proper dependency arrays
- Handle cleanup in useEffect
- Return consistent object structures

### **4. Utility Development**
- Keep functions pure when possible
- Add proper error handling
- Include comprehensive JSDoc comments
- Write unit tests for complex utilities

## 🧪 **Testing Strategy**

### **Unit Tests**
- Test services independently
- Test utility functions
- Test custom hooks
- Test component logic

### **Integration Tests**
- Test API integration
- Test component interactions
- Test route navigation
- Test authentication flows

## 📦 **Build & Deployment**

The new structure is optimized for:
- **Tree Shaking**: Better bundle optimization
- **Code Splitting**: Lazy loading of routes
- **Caching**: Efficient browser caching
- **Performance**: Optimized loading times

## 🔄 **Migration Status**

✅ **Completed:**
- Folder structure reorganization
- API layer implementation
- Services layer implementation
- Custom hooks creation
- Utility functions
- Route configuration
- Import path updates

🔄 **In Progress:**
- Redux slices implementation
- Component development
- Page development
- Testing setup

## 🤝 **Agent Collaboration**

Each agent should:
1. Work in their assigned feature folder
2. Use the established services and hooks
3. Follow the import path standards
4. Update documentation as needed
5. Write tests for their components

This architecture enables multiple agents to work in parallel without conflicts while maintaining code quality and consistency.
