# HRMS Frontend Foundation

## 🚀 Overview
This is the frontend foundation for the HRMS (Human Resource Management System) project, built with React, Tailwind CSS v4, and ShadCN UI components. The architecture is designed to enable parallel development by multiple AI agents.

## 📁 Project Structure
```
frontend/
├── public/
│   └── index.html           # Main HTML template
├── src/
│   ├── App.jsx             # Main application component
│   ├── index.js            # Application entry point
│   ├── index.css           # Global styles with CSS variables
│   ├── shared/             # Shared components and utilities
│   │   ├── components/     # Layout, Header, Sidebar, etc.
│   │   ├── contexts/       # React contexts (Auth, Theme)
│   │   ├── ui/            # ShadCN UI components
│   │   └── lib/           # Utility functions
│   └── modules/           # Feature modules (to be implemented)
│       ├── auth/          # Authentication module
│       ├── dashboard/     # Dashboard module
│       ├── employees/     # Employee management
│       ├── attendance/    # Attendance tracking
│       ├── leave/         # Leave management
│       ├── payroll/       # Payroll processing
│       ├── performance/   # Performance management
│       └── ai-features/   # AI features module
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies and scripts
```

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

### 3. Build for Production
```bash
npm run build
```

## 🎨 Technology Stack

### **Core Technologies**
- **Framework**: React 18 with functional components (.jsx files)
- **Language**: JavaScript (JSX) - NOT TypeScript
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **Routing**: React Router v6
- **State Management**: React Context + useReducer

### **Styling Approach**
- **Configuration**: Standard Tailwind setup WITH tailwind.config.js (Required for ShadCN UI)
- **CSS Variables**: Proper CSS variables and design tokens for theming
- **Theme System**: ShadCN-compatible theme system with dark mode support
- **Animations**: Smooth transitions and hover effects for all interactive elements

### **Design System**
- **Colors**: CSS variables-based theming with HRMS-specific role colors
- **Components**: ShadCN UI components with custom HRMS styling
- **Responsive**: Mobile-first responsive design
- **Accessibility**: Built-in accessibility features from ShadCN UI

## 🎯 Key Features

### **Authentication System**
- JWT-based authentication
- Role-based access control (Admin, Manager, Employee)
- Protected routes with role validation
- Persistent login state

### **Theme System**
- Light/Dark mode toggle
- CSS variables for consistent theming
- System preference detection
- Persistent theme selection

### **Navigation**
- Responsive sidebar navigation
- Role-based menu filtering
- Mobile-friendly design
- Breadcrumb navigation

### **HRMS-Specific Styling**
```css
/* Role-based button variants */
.hrms-button-admin    /* Red theme for admin actions */
.hrms-button-manager  /* Orange theme for manager actions */
.hrms-button-employee /* Green theme for employee actions */
.hrms-button-ai       /* Purple theme for AI features */

/* Interactive elements */
.hrms-card-hover      /* Smooth hover effects for cards */
.hrms-interactive     /* Consistent transitions */
```

## 🔧 Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🏗 Development Guidelines

### **For Module Agents**
Each module agent should:
1. Work only in their assigned `src/modules/[module-name]/` folder
2. Use shared components from `src/shared/`
3. Follow the established design system
4. Use ShadCN UI components consistently
5. Implement proper responsive design

### **Folder Ownership Rules**
- ✅ **Foundation Agent**: `src/shared/`, `src/App.jsx`, config files
- ✅ **Module Agents**: Only their assigned `src/modules/[module-name]/` folder
- ❌ **Never modify**: Other agents' module folders, shared components

### **Required Standards**
```javascript
// ✅ MUST USE:
- ShadCN UI components from src/shared/ui/
- CSS variables defined in index.css
- HRMS-specific color tokens from tailwind.config.js
- Responsive design patterns
- Dark mode compatible styling

// ❌ MUST NOT USE:
- Hardcoded colors instead of CSS variables
- Direct styling without Tailwind classes
- Components outside of ShadCN UI
- Inline styles or style attributes
```

## 🎨 Design System

### **Color Tokens**
```javascript
// CSS Variables (defined in index.css)
--primary: 221.2 83.2% 53.3%
--secondary: 210 40% 96%
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%

// HRMS Role Colors (defined in tailwind.config.js)
hrms-admin: #DC2626     // Red for admin
hrms-manager: #D97706   // Orange for manager
hrms-employee: #059669  // Green for employee
hrms-ai: #8B5CF6        // Purple for AI features
```

### **Component Classes**
```css
.hrms-card              /* Standard card styling */
.hrms-card-hover        /* Card with hover effects */
.hrms-form-container    /* Form container styling */
.hrms-nav-item          /* Navigation item styling */
.hrms-dashboard-grid    /* Dashboard grid layout */
```

## 🔐 Authentication Flow
1. User visits protected route
2. AuthContext checks for valid token
3. If not authenticated, redirect to login
4. Login component handles authentication
5. On success, redirect to dashboard based on role

## 📱 Responsive Design
- **Mobile**: Collapsible sidebar, touch-friendly buttons
- **Tablet**: Adaptive layout, optimized spacing
- **Desktop**: Full sidebar, hover effects, keyboard navigation

## 🚦 Module Status
- ✅ **Foundation**: Complete with proper Tailwind + ShadCN setup
- ✅ **Authentication**: Basic structure ready
- ✅ **Layout System**: Header, Sidebar, Protected Routes
- ✅ **Theme System**: Light/Dark mode with CSS variables
- ⏳ **Auth Module**: Ready for implementation
- ⏳ **Dashboard Module**: Ready for implementation
- ⏳ **Employee Module**: Ready for implementation
- ⏳ **Attendance Module**: Ready for implementation
- ⏳ **Leave Module**: Ready for implementation
- ⏳ **Payroll Module**: Ready for implementation
- ⏳ **Performance Module**: Ready for implementation
- ⏳ **AI Features Module**: Ready for implementation

## 🔗 Integration
This frontend is designed to work with the Node.js backend located in the `backend/` directory.

## 📝 Notes
- All modules are designed to be independent and can be developed in parallel
- Shared components are centralized to avoid conflicts
- ShadCN UI components provide consistent styling and accessibility
- CSS variables enable easy theming and customization
- The foundation includes proper TypeScript support if needed in the future
