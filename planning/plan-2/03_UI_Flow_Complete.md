# 🔄 Complete UI Flow Navigation - AI-Enhanced HRMS

## 📌 Assignment Context

This document maps the complete screen-to-screen navigation for the HRMS platform, covering all user roles and transitions as discussed in our previous conversations.

## 🚀 Application Entry Points

### **Initial Load**
- **URL**: `/` 
- **Logic**: Check authentication status
- **Authenticated**: Redirect to role-based dashboard
- **Unauthenticated**: Redirect to `/login`

## 🔐 Authentication Flow

### **1. Login Screen (`/login`)**
**Elements & Transitions**:
- **Email Input** → Focus to Password Input (Tab/Enter)
- **Password Input** → Focus to Login Button (Tab/Enter)
- **Login Button** →
  - Success: Navigate to role-based dashboard
  - Error: Show error message, stay on login
- **Role Selector** → Change login context (no navigation)

## 👑 Admin Role Navigation Flow

### **2. Admin Dashboard (`/admin/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/admin/dashboard`
  - Employees → Navigate to `/admin/employees`
  - Attendance → Navigate to `/admin/attendance`
  - Leave → Navigate to `/admin/leave`
  - Payroll → Navigate to `/admin/payroll`
  - Performance → Navigate to `/admin/performance`
  - AI Features → Navigate to `/admin/ai`
  - Reports → Navigate to `/admin/reports`
- **Quick Action Cards**:
  - Add Employee → Navigate to `/admin/employees/new`
  - Generate Report → Navigate to `/admin/reports/generate`
  - View Attrition Alerts → Navigate to `/admin/ai/attrition`
- **Header Elements**:
  - Profile Dropdown → Navigate to `/profile`
  - Logout → Navigate to `/login`
  - Notifications → Open notifications panel (no navigation)

### **3. Employee Management Flow (`/admin/employees`)**
**Elements & Transitions**:
- **Add Employee Button** → Navigate to `/admin/employees/new`
- **Search Input** → Filter table (no navigation)
- **Employee Table Rows**:
  - Click Row → Navigate to `/admin/employees/:id`
  - Edit Button → Navigate to `/admin/employees/:id/edit`
  - View Button → Navigate to `/admin/employees/:id`
- **Pagination Controls** → Update table view (no navigation)

### **4. Employee Profile (`/admin/employees/:id`)**
**Elements & Transitions**:
- **Edit Button** → Navigate to `/admin/employees/:id/edit`
- **Back Button** → Navigate to `/admin/employees`
- **Tab Navigation**:
  - Personal Info → Show personal info tab (no navigation)
  - Employment → Show employment tab (no navigation)
  - Attendance → Show attendance tab (no navigation)
  - Leave → Show leave tab (no navigation)
  - Performance → Show performance tab (no navigation)
- **Generate Report Button** → Navigate to `/admin/reports/employee/:id`

### **5. Add/Edit Employee (`/admin/employees/new` or `/admin/employees/:id/edit`)**
**Elements & Transitions**:
- **Next Step Button** → Move to next form step (no navigation)
- **Previous Step Button** → Move to previous form step (no navigation)
- **Save Draft Button** → Save and stay on page
- **Save & Continue Button** → Save and move to next step
- **Submit Button** → 
  - Success: Navigate to `/admin/employees/:id`
  - Error: Show validation errors, stay on page
- **Cancel Button** → Navigate to `/admin/employees`

## 👨‍💼 Manager Role Navigation Flow

### **8. Manager Dashboard (`/manager/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/manager/dashboard`
  - My Team → Navigate to `/manager/team`
  - Attendance → Navigate to `/manager/attendance`
  - Leave Approvals → Navigate to `/manager/leave/approvals`
  - Performance → Navigate to `/manager/performance`
  - Reports → Navigate to `/manager/reports`
- **Quick Action Cards**:
  - Approve Requests → Navigate to `/manager/leave/approvals`
  - Team Report → Navigate to `/manager/reports/team`
  - Performance Review → Navigate to `/manager/performance/reviews`

### **9. Team Management (`/manager/team`)**
**Elements & Transitions**:
- **Team Member Cards**:
  - Click Card → Navigate to `/manager/team/:employeeId`
  - Performance Button → Navigate to `/manager/performance/:employeeId`
- **Team Actions**:
  - Schedule Meeting → Open meeting scheduler (no navigation)
  - Generate Team Report → Navigate to `/manager/reports/team`

### **10. Leave Approvals (`/manager/leave/approvals`)**
**Elements & Transitions**:
- **Approve Button** → Update status, refresh table (no navigation)
- **Reject Button** → Open rejection modal (no navigation)
- **View Details Button** → Open details modal (no navigation)
- **Bulk Actions** → Process multiple requests (no navigation)

## 👤 Employee Role Navigation Flow

### **11. Employee Dashboard (`/employee/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/employee/dashboard`
  - Profile → Navigate to `/employee/profile`
  - Attendance → Navigate to `/employee/attendance`
  - Leave → Navigate to `/employee/leave`
  - Payroll → Navigate to `/employee/payroll`
  - Performance → Navigate to `/employee/performance`
- **Quick Action Widgets**:
  - Check In/Out → Update attendance status (no navigation)
  - Apply Leave → Navigate to `/employee/leave/apply`
  - View Payslip → Navigate to `/employee/payroll/latest`

### **12. Employee Profile (`/employee/profile`)**
**Elements & Transitions**:
- **Edit Personal Info Button** → Navigate to `/employee/profile/edit`
- **Change Password Button** → Navigate to `/employee/profile/password`
- **Update Photo Button** → Open photo upload modal (no navigation)

## ⏰ Attendance Flow (All Roles)

### **13. Attendance Dashboard (`/attendance`)**
**Elements & Transitions**:
- **Check In Button** → Record check-in, update status (no navigation)
- **Check Out Button** → Record check-out, update status (no navigation)
- **View History Button** → Navigate to `/attendance/history`
- **Calendar Date Click** → Show day details modal (no navigation)

### **14. Attendance History (`/attendance/history`)**
**Elements & Transitions**:
- **Date Range Picker** → Filter data (no navigation)
- **Export Button** → Download report (no navigation)
- **Back Button** → Navigate to `/attendance`

## 🏖️ Leave Management Flow

### **15. Leave Application (`/leave/apply`)**
**Elements & Transitions**:
- **Leave Type Dropdown** → Update balance display (no navigation)
- **Date Picker** → Calculate total days (no navigation)
- **Submit Button** → 
  - Success: Navigate to `/leave/history` with success message
  - Error: Show validation errors, stay on page
- **Cancel Button** → Navigate to `/leave`

### **16. Leave History (`/leave/history`)**
**Elements & Transitions**:
- **View Details Button** → Open details modal (no navigation)
- **Cancel Request Button** → Update status, refresh table (no navigation)
- **Apply New Leave Button** → Navigate to `/leave/apply`

## 💰 Payroll Flow

### **17. Payroll Dashboard (`/payroll`)**
**Elements & Transitions**:
- **Download Payslip Button** → Download PDF (no navigation)
- **View Details Button** → Navigate to `/payroll/payslip/:id`
- **Payroll History Table**:
  - Click Row → Navigate to `/payroll/payslip/:id`

### **18. Payslip View (`/payroll/payslip/:id`)**
**Elements & Transitions**:
- **Download PDF Button** → Download file (no navigation)
- **Print Button** → Open print dialog (no navigation)
- **Back Button** → Navigate to `/payroll`

## 📊 Performance Management Flow

### **19. Goals Dashboard (`/performance/goals`)**
**Elements & Transitions**:
- **Add Goal Button** → Navigate to `/performance/goals/new`
- **Goal Card Click** → Navigate to `/performance/goals/:id`
- **Update Progress Button** → Open progress modal (no navigation)

### **20. Performance Reviews (`/performance/reviews`)**
**Elements & Transitions**:
- **Start Review Button** → Navigate to `/performance/reviews/:id/form`
- **View Review Button** → Navigate to `/performance/reviews/:id`
- **Submit Review Button** → 
  - Success: Navigate to `/performance/reviews` with success message
  - Error: Show validation errors, stay on page

## 🤖 AI Features Flow

### **21. AI Chatbot (Global Widget)**
**Elements & Transitions**:
- **Chat Button (Floating)** → Open chat modal (no navigation)
- **Quick Action Buttons** → Navigate to respective screens
- **Close Button** → Close modal (no navigation)

### **22. Attrition Predictor (`/admin/ai/attrition`)**
**Elements & Transitions**:
- **Employee Row Click** → Navigate to `/admin/employees/:id`
- **View Recommendations Button** → Open recommendations modal (no navigation)
- **Export Report Button** → Download report (no navigation)

### **23. Smart Reports (`/reports/ai`)**
**Elements & Transitions**:
- **Generate Report Button** → Process report, update display (no navigation)
- **Export Button** → Download report (no navigation)
- **Schedule Report Button** → Open scheduling modal (no navigation)

## 🔄 Global Navigation Patterns

### **Sidebar Navigation (All Roles)**
- **Logo Click** → Navigate to role-based dashboard
- **Menu Item Click** → Navigate to respective screen
- **Collapse Button** → Toggle sidebar (no navigation)

### **Header Navigation (All Roles)**
- **Profile Dropdown** → 
  - View Profile → Navigate to `/profile`
  - Settings → Navigate to `/settings`
  - Logout → Navigate to `/login`
- **Notifications Bell** → Open notifications panel (no navigation)
- **Search Bar** → Open global search (no navigation)

### **Breadcrumb Navigation**
- **Breadcrumb Links** → Navigate to parent screens
- **Current Page** → No action (disabled)

## 📱 Mobile Navigation Adaptations

### **Mobile Menu**
- **Hamburger Button** → Open/close mobile menu (no navigation)
- **Menu Overlay** → Same navigation as desktop sidebar
- **Bottom Navigation** → Quick access to key features

### **Swipe Gestures**
- **Swipe Left** → Open sidebar (no navigation)
- **Swipe Right** → Close sidebar (no navigation)
- **Pull to Refresh** → Refresh current page data (no navigation)

## ⚠️ Error & Edge Cases

### **404 Not Found**
- **Go Home Button** → Navigate to role-based dashboard
- **Back Button** → Navigate to previous page

### **403 Unauthorized**
- **Login Button** → Navigate to `/login`
- **Contact Admin Button** → Open contact modal (no navigation)

### **Network Error**
- **Retry Button** → Refresh current page (no navigation)
- **Offline Mode** → Show cached data (no navigation)

## 🔄 **Navigation Clarifications Needed**

1. **Deep Linking**: Should all screens support direct URL access?
2. **Browser Back Button**: Custom handling for form pages?
3. **Session Timeout**: Automatic redirect behavior?
4. **Role Changes**: Real-time navigation updates when role changes?
5. **Maintenance Mode**: Special navigation during maintenance?
6. **Multi-tab Behavior**: Synchronization across browser tabs?

This navigation flow ensures intuitive user experience across all roles while maintaining security boundaries and providing efficient access to all features.
