# 🎨 Complete UI Details - AI-Enhanced HRMS

## 📌 Assignment Context

This UI design covers all screens for the HRMS platform following the frontend development rules from `planning/Workflow/frontend.md` using React, Tailwind CSS v4, and ShadCN UI components.

## 🎯 Technology Stack

**Context Statement**: "I am building a React app using JavaScript, Tailwind v4, and ShadCN UI."

- **Framework**: React with functional components (.jsx files)
- **Language**: JavaScript (JSX) - NOT TypeScript
- **Styling**: Tailwind CSS v4 + ShadCN UI components
- **Approach**: CSS-first (no tailwind.config.js)
- **State Management**: React Context + useReducer
- **Routing**: React Router v6

## 🔐 Authentication Screens

### **1. Login Screen (`/login`)**
```jsx
// Component: LoginForm.jsx
// ShadCN Components: Card, Input, Button, Alert
- Email input field (ShadCN Input)
- Password input field (ShadCN Input with eye toggle)
- "Remember Me" checkbox
- Login button (ShadCN Button with loading state)
- Role selection dropdown (Admin/Manager/Employee)
- Error message display (ShadCN Alert)
- Smooth transitions: transition-colors duration-200 ease-in-out
- Hover effects: hover:bg-accent/10
```

## 👥 Role-Based Dashboard Screens

### **2. Admin Dashboard (`/admin/dashboard`)**
```tsx
// Components: Card, Chart, Badge, Table
Layout: Grid-based responsive layout
- Header with user info and logout
- Sidebar navigation (collapsible)
- Main content area:
  * Employee count cards (total, active, new hires)
  * Attendance overview chart
  * Leave requests pending (table)
  * AI insights cards (attrition alerts, anomalies)
  * Quick actions (Add Employee, Generate Report)
- Smooth hover effects on cards
- Gradient backgrounds on stat cards
```

### **3. Manager Dashboard (`/manager/dashboard`)**
```tsx
// Components: Card, Chart, Badge, Table
Layout: Similar to admin but team-focused
- Team overview cards
- Team attendance chart
- Pending approvals table
- Team performance metrics
- AI insights for team
- Quick actions (Team Report, Approve Requests)
```

### **4. Employee Dashboard (`/employee/dashboard`)**
```tsx
// Components: Card, Badge, Calendar
Layout: Personal-focused layout
- Personal info card
- Attendance summary
- Leave balance cards
- Upcoming goals
- Recent payslips
- AI chatbot widget
- Quick actions (Check In/Out, Apply Leave)
```

## 👤 Employee Management Screens

### **7. Employee List (`/admin/employees`)**
```tsx
// Components: Table, Input, Button, Badge, Dialog
- Search and filter bar (ShadCN Input with search icon)
- Employee table with columns:
  * Photo, Name, Employee Code, Department, Position, Status
- Action buttons (View, Edit, Deactivate)
- Add Employee button (floating action)
- Pagination (ShadCN Pagination)
- Bulk actions (select multiple)
- Smooth table row hover effects
```

### **8. Employee Profile (`/admin/employees/:id`)**
```tsx
// Components: Card, Tabs, Avatar, Badge, Button
Layout: Tabbed interface
- Employee photo and basic info header
- Tabs: Personal Info, Employment, Attendance, Leave, Performance
- Edit button (role-based visibility)
- Action buttons (Deactivate, Generate Report)
- Smooth tab transitions
```

### **9. Add/Edit Employee (`/admin/employees/new` or `/admin/employees/:id/edit`)**
```tsx
// Components: Form, Input, Select, DatePicker, Button
Layout: Multi-step form
- Step 1: Personal Information
- Step 2: Employment Details
- Step 3: Contact Information
- Progress indicator
- Save Draft functionality
- Form validation with error messages
- Smooth step transitions
```

## ⏰ Attendance Management Screens

### **10. Attendance Dashboard (`/attendance`)**
```tsx
// Components: Card, Calendar, Chart, Button
- Check In/Out buttons (large, prominent)
- Today's attendance status
- Weekly attendance chart
- Calendar view with attendance markers
- Recent attendance history table
- Smooth button press animations
```

### **11. Attendance History (`/attendance/history`)**
```tsx
// Components: Table, DatePicker, Input, Badge
- Date range selector
- Attendance table with status badges
- Export functionality
- Filter by status
- Pagination
- Smooth loading states
```

### **12. Team Attendance (`/manager/attendance`)**
```tsx
// Components: Table, Chart, Select, Badge
- Team member selector
- Attendance overview chart
- Team attendance table
- Anomaly alerts (AI-powered)
- Export team report
```

## 🏖️ Leave Management Screens

### **13. Leave Application (`/leave/apply`)**
```tsx
// Components: Form, Select, DatePicker, Textarea, Button
- Leave type dropdown
- Date range picker (start/end dates)
- Reason textarea
- Leave balance display
- Submit button with loading state
- Form validation
- Smooth date picker animations
```

### **14. Leave History (`/leave/history`)**
```tsx
// Components: Table, Badge, Button, Dialog
- Leave applications table
- Status badges (Pending, Approved, Rejected)
- View details modal
- Cancel pending requests
- Filter by status/date
- Pagination
```

### **15. Leave Approvals (`/manager/leave/approvals`)**
```tsx
// Components: Table, Button, Dialog, Textarea
- Pending requests table
- Approve/Reject buttons
- Bulk approval functionality
- Rejection reason modal
- Team leave calendar view
- Smooth approval animations
```

## 💰 Payroll Screens

### **16. Payroll Dashboard (`/payroll`)**
```tsx
// Components: Card, Chart, Table, Button
- Current month payroll summary
- Payslip download button
- Salary breakdown chart
- Payroll history table
- Tax information cards
```

### **17. Payslip View (`/payroll/payslip/:id`)**
```tsx
// Components: Card, Table, Button
- Detailed payslip layout
- Earnings and deductions breakdown
- Download PDF button
- Print functionality
- Professional styling
```

### **18. Payroll Management (`/admin/payroll`)**
```tsx
// Components: Table, Button, Dialog, Progress
- Employee payroll table
- Process payroll button
- Bulk operations
- Payroll status tracking
- Export functionality
```

## 📊 Performance Management Screens

### **19. Goals Dashboard (`/performance/goals`)**
```tsx
// Components: Card, Progress, Button, Dialog
- Active goals list
- Progress indicators
- Add new goal button
- Goal details modal
- Achievement timeline
- Smooth progress animations
```

### **20. Performance Reviews (`/performance/reviews`)**
```tsx
// Components: Card, Form, Rating, Textarea, Button
- Review form interface
- Rating components (1-5 stars)
- Feedback sections
- Submit review button
- Review history
- Smooth rating animations
```

### **21. Team Performance (`/manager/performance`)**
```tsx
// Components: Chart, Table, Card, Select
- Team performance overview
- Individual performance cards
- Performance comparison chart
- Review scheduling
- AI insights integration
```

## 🤖 AI Features Screens

### **22. AI Chatbot Widget (Global)**
```tsx
// Components: Dialog, Input, Button, Avatar
- Floating chat button
- Chat interface modal
- Message bubbles
- Quick action buttons
- Typing indicators
- Smooth chat animations
```

### **23. Attrition Predictor (`/admin/ai/attrition`)**
```tsx
// Components: Table, Chart, Badge, Card
- Employee risk table
- Risk level badges (Low, Medium, High)
- Risk factors display
- Trend analysis chart
- Action recommendations
- Smooth data visualization
```

### **24. Smart Reports (`/reports/ai`)**
```tsx
// Components: Card, Chart, Select, Button
- Report type selector
- AI-generated insights
- Interactive charts
- Export functionality
- Scheduled reports
- Smooth chart transitions
```

### **25. Resume Parser (`/admin/recruitment/parser`)**
```tsx
// Components: Upload, Card, Table, Button
- File upload area (drag & drop)
- Parsing progress indicator
- Parsed data display
- Candidate information cards
- Bulk processing
- Smooth upload animations
```

## 📱 Responsive Design Considerations

### **Breakpoints**:
- Mobile: `sm:` (640px+)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)
- Large: `xl:` (1280px+)

### **Mobile Adaptations**:
- Collapsible sidebar navigation
- Stacked card layouts
- Touch-friendly button sizes
- Simplified table views
- Bottom navigation for key actions

## 🎨 Design System

### **Color Scheme**:
```css
@layer base {
  :root {
    --primary: 220 90% 56%;
    --secondary: 220 14% 96%;
    --accent: 142 76% 36%;
    --destructive: 0 84% 60%;
    --muted: 220 14% 96%;
    --border: 220 13% 91%;
  }
}
```

### **Typography**:
- Headings: `font-semibold` with appropriate sizes
- Body: `font-normal text-sm`
- Captions: `text-xs text-muted-foreground`

### **Spacing**:
- Consistent padding: `p-4`, `p-6`, `p-8`
- Margins: `mb-4`, `mt-6`, `mx-auto`
- Grid gaps: `gap-4`, `gap-6`

### **Interactive Effects**:
- Hover: `hover:bg-accent/10 transition-colors duration-200`
- Focus: `focus:ring-2 focus:ring-primary`
- Active: `active:scale-95 transition-transform`

## 🔧 Component Architecture

### **Shared Components**:
- `Layout` - Main app layout with sidebar
- `Header` - Top navigation bar
- `Sidebar` - Navigation menu
- `LoadingSpinner` - Loading states
- `ErrorBoundary` - Error handling
- `ConfirmDialog` - Confirmation modals

### **Feature Components**:
- `EmployeeCard` - Employee display card
- `AttendanceWidget` - Check in/out widget
- `LeaveBalance` - Leave balance display
- `PerformanceChart` - Performance visualization
- `ChatWidget` - AI chatbot interface

## 📋 **UI Behavior Clarifications Needed**

1. **Navigation**: Should sidebar be persistent or overlay on mobile?
2. **Notifications**: Real-time notifications system requirements?
3. **Data Refresh**: Auto-refresh intervals for dashboards?
4. **Offline Support**: Offline functionality requirements?
5. **Theme**: Dark mode support needed?
6. **Accessibility**: Specific WCAG compliance level required?
7. **Animations**: Performance vs. visual appeal preferences?
8. **Mobile**: Native app or PWA approach?

All UI components follow ShadCN UI patterns with Tailwind CSS v4 styling, ensuring consistent design language and smooth user interactions throughout the application.
