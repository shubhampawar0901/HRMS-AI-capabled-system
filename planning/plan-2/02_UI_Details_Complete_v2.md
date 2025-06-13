# 🎨 Complete UI Details v2 - Streamlined AI-Enhanced HRMS

## 📌 Assignment Context

This UI design covers the **streamlined 15-screen** HRMS platform following the frontend development rules from `planning/Workflow/frontend.md` using React, Tailwind CSS v4, and ShadCN UI components.

**⚠️ IMPORTANT UPDATE**: This document has been corrected to use proper Tailwind configuration with tailwind.config.js (required for ShadCN UI) instead of the previously mentioned CSS-first approach.

## 🎯 Technology Stack

**Context Statement**: "I am building a React app using JavaScript, Tailwind v4, and ShadCN UI."

- **Framework**: React with functional components (.jsx files)
- **Language**: JavaScript (JSX) - NOT TypeScript
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **Approach**: Standard Tailwind setup WITH tailwind.config.js (Required for ShadCN UI)
- **Configuration**: Proper CSS variables and design tokens for theming
- **Theming**: ShadCN-compatible theme system with dark mode support
- **State Management**: React Context + useReducer
- **Routing**: React Router v6

## 📊 Screen Reduction Summary

**Before**: 30+ screens → **After**: 15 screens (50% reduction)
- **Merged screens** using tabs, modals, and contextual sections
- **Eliminated redundant** navigation and duplicate functionality
- **Improved user experience** with consolidated workflows

## 🔐 Authentication Screens (1 Screen)

### **1. Login Screen (`/login`)**
```jsx
// Component: LoginForm.jsx
// ShadCN Components: Card, Input, Button, Alert, Select
- Email input field (ShadCN Input)
- Password input field (ShadCN Input with eye toggle)
- "Remember Me" checkbox
- Role selection dropdown (Admin/Manager/Employee)
- Login button (ShadCN Button with loading state)
- Error message display (ShadCN Alert)
- Smooth transitions: transition-colors duration-200 ease-in-out
- Hover effects: hover:bg-accent/10
```

## 🏠 Dashboard Screens (3 Screens)

### **2. Admin Dashboard (`/admin/dashboard`)**
```jsx
// Component: AdminDashboard.jsx
// ShadCN Components: Card, Chart, Badge, Table, Button, Tabs
Layout: Comprehensive admin overview
- Employee metrics cards (Total, Active, New Hires)
- Attendance overview chart
- Pending approvals summary table
- AI insights panel (Attrition alerts, Anomalies)
- Quick actions (Add Employee, Process Payroll, Generate Reports)
- Recent activities feed
- System health indicators
- Embedded reports widgets (instead of separate reports screen)
- Settings dropdown in header (instead of separate settings screen)
```

### **3. Manager Dashboard (`/manager/dashboard`)**
```jsx
// Component: ManagerDashboard.jsx
// ShadCN Components: Card, Chart, Badge, Table, Tabs
Layout: Team-focused dashboard
- Team overview cards (Team Size, Present Today, On Leave)
- Team attendance chart
- Pending leave approvals table
- Team performance metrics
- AI insights for team (Attrition risks, Performance trends)
- Quick actions (Approve Leaves, Team Report, 1:1 Scheduling)
- Team calendar widget
- Direct reports list with status
```

### **4. Employee Dashboard (`/employee/dashboard`)**
```jsx
// Component: EmployeeDashboard.jsx
// ShadCN Components: Card, Badge, Calendar, Button
Layout: Personal-focused interface
- Welcome message with current date/time
- Check-in/Check-out widget (large, prominent)
- Leave balance cards (Annual, Sick, Emergency)
- This month attendance summary
- Recent payslip access
- Performance goals progress
- AI chatbot widget (floating)
- Quick actions (Apply Leave, View Payslip, Update Goals)
- Profile settings in header dropdown (instead of separate screen)
```

## 👥 Employee Management Screens (2 Screens)

### **5. Employee List (`/admin/employees`)**
```jsx
// Component: EmployeeList.jsx
// ShadCN Components: Table, Input, Select, Button, Dialog
Enhanced with quick actions:
- Search and filter bar (Name, Department, Status)
- Employee data table with photos
- Inline quick actions (View, Edit, Deactivate)
- Add Employee button (opens modal instead of separate screen)
- Bulk operations (Export, Bulk Update)
- Pagination with page size selector
- Department filter dropdown
- Status filter (Active, Inactive, On Leave)
- Quick stats header (Total, Active, New This Month)
```

### **6. Employee Profile (`/admin/employees/:id`)**
```jsx
// Component: EmployeeProfile.jsx
// ShadCN Components: Card, Tabs, Button, Dialog, Form, Input
Consolidated employee management:
- Tabs: [Personal Info] [Employment] [Attendance] [Leave] [Performance] [Payroll]
- Edit mode toggle (instead of separate edit screen)
- Personal Info tab: Basic details, contact, emergency contact
- Employment tab: Department, position, manager, salary
- Attendance tab: Recent attendance, patterns, anomalies
- Leave tab: Balance, history, pending requests
- Performance tab: Goals, reviews, ratings
- Payroll tab: Salary structure, recent payslips
- Action buttons: Edit, Deactivate, Generate Report
- Breadcrumb navigation
```

## ⏰ Attendance Hub (1 Screen)

### **7. Attendance Hub (`/attendance`)**
```jsx
// Component: AttendanceHub.jsx
// ShadCN Components: Tabs, Card, Table, Calendar, Chart, Button
Consolidated attendance management:
- Tabs: [Today's Status] [History] [Team View] [Reports]
- Today's Status tab:
  - Check-in/Check-out widget
  - Current status indicator
  - Today's working hours
  - Break time tracking
- History tab:
  - Date range picker
  - Attendance table with filters
  - Monthly summary cards
  - Export functionality
- Team View tab (Manager/Admin only):
  - Team attendance grid
  - Late arrivals alerts
  - Early departures tracking
  - Attendance trends chart
- Reports tab:
  - Quick report generation
  - Attendance analytics
  - Anomaly detection results
```

## 🏖️ Leave Management Screens (2 Screens)

### **8. Leave Hub (`/leave`)**
```jsx
// Component: LeaveHub.jsx
// ShadCN Components: Tabs, Card, Form, Calendar, Table, Button
Consolidated leave management:
- Tabs: [Apply Leave] [My History] [Balance] [Team Calendar]
- Apply Leave tab:
  - Leave type selection
  - Date picker with calendar view
  - Reason text area
  - Leave balance preview
  - Submit button with validation
- My History tab:
  - Leave applications table
  - Status badges (Pending, Approved, Rejected)
  - Filter by status/date
  - Cancel pending requests
- Balance tab:
  - Leave type cards with remaining days
  - Accrual schedule
  - Usage charts
  - Next accrual date
- Team Calendar tab (Manager only):
  - Team leave calendar
  - Overlapping leave alerts
  - Coverage planning
```

### **9. Leave Approvals (`/manager/leave/approvals`)**
```jsx
// Component: LeaveApprovals.jsx
// ShadCN Components: Table, Button, Dialog, Textarea, Calendar
Manager-specific leave management:
- Pending requests table with employee details
- Approve/Reject buttons with bulk actions
- Rejection reason modal
- Team leave calendar view
- Leave impact analysis
- Approval workflow tracking
- Email notification settings
- Delegation settings for approval authority
```

## 💰 Payroll Hub (1 Screen)

### **10. Payroll Hub (`/payroll`)**
```jsx
// Component: PayrollHub.jsx
// ShadCN Components: Tabs, Card, Table, Chart, Button, Dialog
Consolidated payroll management:
- Tabs: [My Payroll] [Payslips] [Management] [Reports]
- My Payroll tab (Employee view):
  - Current month summary
  - Salary breakdown chart
  - Tax information
  - YTD earnings summary
- Payslips tab:
  - Payslip history table
  - Download/Print buttons
  - Detailed payslip view modal (instead of separate screen)
  - Search and filter by date
- Management tab (Admin only):
  - Employee payroll table
  - Process payroll button
  - Bulk operations
  - Payroll status tracking
  - Salary structure management
- Reports tab:
  - Payroll analytics
  - Tax reports
  - Export functionality
```

## 📊 Performance Hub (1 Screen)

### **11. Performance Hub (`/performance`)**
```jsx
// Component: PerformanceHub.jsx
// ShadCN Components: Tabs, Card, Form, Table, Chart, Progress
Consolidated performance management:
- Tabs: [Goals] [Reviews] [History] [Analytics]
- Goals tab:
  - Current goals list with progress bars
  - Add/Edit goal modal
  - Goal categories and priorities
  - Target date tracking
  - Achievement status
- Reviews tab:
  - Pending reviews list
  - Create review button
  - Review form with AI-generated feedback
  - Rating scales and comments
  - Submit/Save draft options
- History tab:
  - Completed reviews table
  - Performance trends chart
  - Rating history
  - Goal achievement timeline
- Analytics tab:
  - Performance metrics dashboard
  - Team comparison (Manager view)
  - Improvement recommendations
  - Performance distribution charts
```

## 🤖 AI Features (2 Screens)

### **12. AI Chatbot (Global Widget)**
```jsx
// Component: AIChatbot.jsx
// ShadCN Components: Dialog, Input, Button, ScrollArea
Floating chatbot widget:
- Floating action button (bottom-right)
- Chat modal with conversation history
- Quick action buttons for common queries
- File upload for resume parsing
- Role-based response filtering
- Conversation persistence
- Typing indicators and smooth animations
- Integration with all other screens
```

### **13. AI Hub (`/admin/ai`)**
```jsx
// Component: AIHub.jsx
// ShadCN Components: Tabs, Card, Table, Chart, Button, Progress
Consolidated AI features:
- Tabs: [Attrition Predictor] [Resume Parser] [Anomaly Detection] [Insights]
- Attrition Predictor tab:
  - Risk summary cards (High, Medium, Low)
  - Employee risk table with scores
  - Contributing factors analysis
  - Recommendation actions
  - Export reports
- Resume Parser tab:
  - File upload area
  - Parsed information display
  - Edit parsed data form
  - Confidence scores
  - Save to employee profile
- Anomaly Detection tab:
  - Anomaly list with severity levels
  - Investigation details panel
  - Resolution tracking
  - False positive marking
- Insights tab:
  - AI-generated insights dashboard
  - Trend analysis
  - Predictive analytics
  - Action recommendations
```

## 🎨 Design System & Components

### **Shared Components**
```jsx
// Reusable components across all screens
- Header.jsx (Navigation, Profile, Notifications)
- Sidebar.jsx (Role-based navigation)
- LoadingSpinner.jsx (Consistent loading states)
- ErrorBoundary.jsx (Error handling)
- ConfirmDialog.jsx (Confirmation modals)
- DataTable.jsx (Consistent table styling)
- StatsCard.jsx (Metric display cards)
- TabContainer.jsx (Consistent tab styling)
```

### **Animation & Interaction Patterns**
```jsx
// Consistent animations across all screens
- Page transitions: slide-in-right, fade-in
- Modal animations: scale-in, fade-backdrop
- Button hover: subtle scale, shadow increase
- Card hover: lift effect, shadow enhancement
- Loading states: skeleton screens, progress bars
- Success states: checkmark animations, green flash
- Error states: shake animation, red highlight
```

### **Responsive Design Patterns**
```jsx
// Mobile-first responsive design
- Desktop (1024px+): Full sidebar, multi-column layouts
- Tablet (768px-1023px): Collapsible sidebar, two-column
- Mobile (320px-767px): Bottom navigation, single column
- Touch-friendly: Larger buttons, swipe gestures
- Progressive enhancement: Core functionality first
```

### **Color Scheme & Theming**
```jsx
// CSS Variables-based color system (defined in tailwind.config.js)
Primary Colors (CSS Variables):
- Primary: hsl(var(--primary)) - Main brand color
- Secondary: hsl(var(--secondary)) - Secondary actions
- Background: hsl(var(--background)) - Page background
- Foreground: hsl(var(--foreground)) - Text color

HRMS Role Colors (Custom tokens):
- Admin: theme('colors.hrms.admin') - #DC2626
- Manager: theme('colors.hrms.manager') - #D97706
- Employee: theme('colors.hrms.employee') - #059669
- AI Features: theme('colors.hrms.ai') - #8B5CF6

ShadCN UI Colors (CSS Variables):
- Border: hsl(var(--border))
- Input: hsl(var(--input))
- Ring: hsl(var(--ring))
- Muted: hsl(var(--muted))
- Accent: hsl(var(--accent))

// Usage in components:
className="bg-primary text-primary-foreground"
className="bg-hrms-admin hover:bg-hrms-admin/90"
```

## 📱 Mobile Optimization

### **Bottom Navigation (Mobile)**
```jsx
// Mobile navigation bar
- Home (Dashboard)
- Attendance (Check-in/out)
- Leave (Quick apply)
- AI Chat (Chatbot)
- Profile (Settings)
```

### **Touch Interactions**
```jsx
// Mobile-specific interactions
- Swipe gestures for navigation
- Pull-to-refresh on data screens
- Long press for context menus
- Haptic feedback for actions
- Voice input for chatbot
```

This streamlined v2 design reduces complexity while maintaining all functionality through smart consolidation and improved user experience patterns.
