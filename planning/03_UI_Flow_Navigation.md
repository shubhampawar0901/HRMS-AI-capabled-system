# 🔄 UI Flow & Navigation Mapping - AI-Enhanced HRMS

## Complete Screen-to-Screen Navigation Flow

---

## 🔐 **Authentication Flow**

### **Login Screen** → Navigation Targets:
- **"Login" button** → Dashboard (role-specific)
- **"Forgot Password" link** → Forgot Password Screen
- **"Remember Me" checkbox** → (state only, no navigation)

### **Forgot Password Screen** → Navigation Targets:
- **"Send Reset Link" button** → Login Screen (with success message)
- **"Back to Login" link** → Login Screen
- **Email link** → Reset Password Screen

### **Reset Password Screen** → Navigation Targets:
- **"Reset Password" button** → Login Screen (with success message)
- **"Back to Login" link** → Login Screen

---

## 🏠 **Dashboard Navigation** (Role-based)

### **Admin Dashboard** → Navigation Targets:
- **"Add Employee" button** → Add Employee Screen
- **"View All Employees" link** → Employee List Screen
- **"Payroll Management" card** → Payroll Management Screen
- **"AI Insights" card** → AI Insights Dashboard
- **"Reports" card** → Reports Dashboard
- **"Settings" gear icon** → System Settings Screen
- **Profile dropdown** → Profile Settings Screen
- **"Logout" option** → Login Screen

### **Manager Dashboard** → Navigation Targets:
- **"View Team" button** → Employee List Screen (filtered to team)
- **"Team Attendance" card** → Team Attendance Screen
- **"Leave Approvals" card** → Leave Approval Screen
- **"Team Performance" card** → Performance Review Screen
- **"AI Insights" card** → AI Insights Dashboard (team-specific)
- **Profile dropdown** → Profile Settings Screen
- **"Logout" option** → Login Screen

### **Employee Dashboard** → Navigation Targets:
- **"Check In/Out" button** → Attendance Dashboard
- **"Apply Leave" button** → Leave Application Screen
- **"View Payslip" card** → Payslip Screen
- **"My Goals" card** → Goals Dashboard
- **"HR Chatbot" icon** → HR Chatbot Interface
- **Profile dropdown** → Profile Settings Screen
- **"Logout" option** → Login Screen

---

## 👥 **Employee Management Flow**

### **Employee List Screen** → Navigation Targets:
- **"Add Employee" button** (Admin) → Add Employee Screen
- **Employee row click** → Employee Profile Screen
- **"Edit" icon** → Edit Employee Screen
- **"Export" button** → (file download, no navigation)
- **Search/Filter controls** → (same screen, filtered results)
- **Breadcrumb "Dashboard"** → Dashboard

### **Employee Profile Screen** → Navigation Targets:
- **"Edit" button** → Edit Employee Screen
- **"Upload Document" button** → File upload modal (same screen)
- **"View Attendance" link** → Attendance History Screen (filtered)
- **"View Leave History" link** → Leave History Screen (filtered)
- **"Performance Reviews" tab** → Review History Screen (filtered)
- **Breadcrumb navigation** → Employee List Screen → Dashboard

### **Add/Edit Employee Screen** → Navigation Targets:
- **"Save" button** → Employee Profile Screen (newly created/updated)
- **"Cancel" button** → Employee List Screen
- **"Upload Resume" button** → Resume Parser Screen
- **Breadcrumb navigation** → Employee List Screen → Dashboard

---

## ⏰ **Attendance Management Flow**

### **Attendance Dashboard** → Navigation Targets:
- **"Check In" button** → (same screen, updated status)
- **"Check Out" button** → (same screen, updated status)
- **"View History" link** → Attendance History Screen
- **Calendar date click** → Attendance History Screen (filtered date)
- **Breadcrumb "Dashboard"** → Dashboard

### **Attendance History Screen** → Navigation Targets:
- **Date range picker** → (same screen, filtered results)
- **"Export" button** → (file download, no navigation)
- **"Back" button** → Attendance Dashboard
- **Breadcrumb navigation** → Attendance Dashboard → Dashboard

### **Team Attendance Screen** (Manager) → Navigation Targets:
- **Employee name click** → Employee Profile Screen
- **"View Details" link** → Attendance History Screen (filtered employee)
- **"Export Report" button** → (file download, no navigation)
- **Breadcrumb "Dashboard"** → Dashboard

---

## 🏖️ **Leave Management Flow**

### **Leave Application Screen** → Navigation Targets:
- **"Submit" button** → Leave History Screen (with success message)
- **"Save Draft" button** → (same screen, saved state)
- **"Cancel" button** → Dashboard
- **Calendar date selection** → (same screen, updated dates)
- **Leave type dropdown** → (same screen, updated balance display)

### **Leave History Screen** → Navigation Targets:
- **"Apply New Leave" button** → Leave Application Screen
- **Leave record click** → Leave details modal (same screen)
- **"Cancel" button** (pending leaves) → Confirmation modal → (same screen, updated)
- **Status filter** → (same screen, filtered results)
- **Breadcrumb "Dashboard"** → Dashboard

### **Leave Approval Screen** (Manager) → Navigation Targets:
- **"Approve" button** → (same screen, updated list)
- **"Reject" button** → Rejection modal → (same screen, updated list)
- **Employee name click** → Employee Profile Screen
- **"View Team Calendar" button** → Team calendar modal (same screen)
- **Leave request click** → Leave details modal (same screen)
- **Breadcrumb "Dashboard"** → Dashboard

### **Leave Balance Screen** → Navigation Targets:
- **"Apply Leave" button** → Leave Application Screen
- **"View History" link** → Leave History Screen
- **Leave type card click** → Leave History Screen (filtered type)
- **Breadcrumb "Dashboard"** → Dashboard

---

## 💰 **Payroll Flow**

### **Payslip Screen** → Navigation Targets:
- **Month/Year selector** → (same screen, different payslip)
- **"Download PDF" button** → (file download, no navigation)
- **"View Previous" button** → (same screen, previous month)
- **Breadcrumb "Dashboard"** → Dashboard

### **Payroll Management Screen** (Admin) → Navigation Targets:
- **"Process Payroll" button** → Processing modal → (same screen, updated status)
- **Employee row click** → Salary Structure Screen
- **"Generate Reports" button** → Reports Dashboard
- **"Review Anomalies" link** → Anomaly Detection Screen
- **Breadcrumb "Dashboard"** → Dashboard

### **Salary Structure Screen** (Admin) → Navigation Targets:
- **"Update" button** → (same screen, saved state)
- **"View History" tab** → (same screen, history view)
- **Employee selector** → (same screen, different employee)
- **"Back" button** → Payroll Management Screen
- **Breadcrumb navigation** → Payroll Management → Dashboard

---

## 📊 **Performance Management Flow**

### **Goals Dashboard** → Navigation Targets:
- **"Add Goal" button** → Add goal modal (same screen)
- **Goal card click** → Goal details modal (same screen)
- **"Update Progress" button** → Progress update modal (same screen)
- **"View All Reviews" link** → Review History Screen
- **Breadcrumb "Dashboard"** → Dashboard

### **Performance Review Screen** → Navigation Targets:
- **"Save Draft" button** → (same screen, saved state)
- **"Submit Review" button** → Review History Screen (with success message)
- **"Generate AI Feedback" button** → (same screen, AI suggestions displayed)
- **Employee selector** (Manager) → (same screen, different employee)
- **"Back" button** → Goals Dashboard or Dashboard

### **Review History Screen** → Navigation Targets:
- **Review card click** → Performance Review Screen (view mode)
- **"Compare Periods" button** → Comparison modal (same screen)
- **"New Review" button** → Performance Review Screen (edit mode)
- **Breadcrumb navigation** → Goals Dashboard → Dashboard

---

## 🤖 **AI Features Flow**

### **AI Insights Dashboard** → Navigation Targets:
- **Attrition alert click** → Employee Profile Screen (at-risk employee)
- **Anomaly card click** → Anomaly Detection Screen
- **"View All Insights" button** → (same screen, expanded view)
- **"Take Action" button** → Relevant action screen (context-dependent)
- **Breadcrumb "Dashboard"** → Dashboard

### **HR Chatbot Interface** → Navigation Targets:
- **Quick action buttons** → Relevant screens (Apply Leave, View Payslip, etc.)
- **"Upload File" button** → File upload modal (same screen)
- **"Clear History" button** → (same screen, cleared chat)
- **Chat close button** → Previous screen or Dashboard

### **Resume Parser Screen** (Admin) → Navigation Targets:
- **"Upload Resume" button** → File upload → (same screen, parsing results)
- **"Edit Parsed Data" button** → (same screen, edit mode)
- **"Save to Employee" button** → Add Employee Screen (pre-filled)
- **"Parse Another" button** → (same screen, reset)
- **Breadcrumb navigation** → Employee Management → Dashboard

### **Anomaly Detection Screen** (Admin) → Navigation Targets:
- **Anomaly row click** → Anomaly details modal (same screen)
- **"Investigate" button** → Investigation modal (same screen)
- **"Resolve" button** → Resolution modal (same screen)
- **"View Source" link** → Source record screen (Payslip, Attendance, etc.)
- **Breadcrumb "Dashboard"** → Dashboard

---

## 📈 **Reports Flow**

### **Reports Dashboard** → Navigation Targets:
- **Report category card** → Custom Report Builder (pre-configured)
- **"Generate Report" button** → Report generation modal → (file download)
- **"Custom Report Builder" button** → Custom Report Builder Screen
- **Recent report click** → Report viewer modal (same screen)
- **Breadcrumb "Dashboard"** → Dashboard

### **Custom Report Builder** → Navigation Targets:
- **"Generate" button** → Report preview modal (same screen)
- **"Save Report" button** → (same screen, saved state)
- **"Export" button** → (file download, no navigation)
- **"Back" button** → Reports Dashboard

---

## ⚙️ **Settings Flow**

### **Profile Settings Screen** → Navigation Targets:
- **"Update Profile" button** → (same screen, saved state)
- **"Change Password" button** → Password change modal (same screen)
- **"Upload Photo" button** → File upload modal (same screen)
- **"Back" button** → Dashboard

### **System Settings Screen** (Admin) → Navigation Targets:
- **Settings tabs** → (same screen, different sections)
- **"Save Configuration" button** → (same screen, saved state)
- **"Reset to Default" button** → Confirmation modal → (same screen, reset)
- **Breadcrumb "Dashboard"** → Dashboard

---

## 📱 **Mobile Navigation Patterns**

### **Mobile Menu** (Hamburger) → Navigation Targets:
- **Dashboard** → Dashboard
- **Attendance** → Attendance Dashboard
- **Leave** → Leave History Screen
- **Payslip** → Payslip Screen
- **Profile** → Profile Settings Screen
- **Logout** → Login Screen

### **Bottom Navigation** (Mobile):
- **Home icon** → Dashboard
- **Clock icon** → Attendance Dashboard
- **Calendar icon** → Leave History Screen
- **Chat icon** → HR Chatbot Interface
- **Profile icon** → Profile Settings Screen

---

## 🔄 **Global Navigation Elements**

### **Header Navigation** (All Screens):
- **Logo/Company Name** → Dashboard
- **Breadcrumb navigation** → Parent screens
- **Notification bell** → Notifications dropdown (same screen)
- **Profile dropdown** → Profile Settings, Logout
- **Search bar** (global) → Search results overlay

### **Sidebar Navigation** (Desktop):
- **Module sections** → Respective dashboard screens
- **Collapse/Expand toggle** → (same screen, layout change)
- **Quick actions** → Relevant screens

---

## ⚠️ **Error & Edge Case Navigation**

### **Error Scenarios**:
- **403 Forbidden** → Dashboard (with error message)
- **404 Not Found** → Dashboard (with error message)
- **500 Server Error** → Error page with "Back to Dashboard" button
- **Network Error** → Retry modal with "Back" option

### **Session Management**:
- **Session Timeout** → Login Screen (with timeout message)
- **Unauthorized Access** → Login Screen (with permission message)

This comprehensive navigation flow ensures smooth user experience across all screens while maintaining clear hierarchical relationships and intuitive user journeys.

---

## 🎯 **Key Navigation Principles**

### **Consistency**:
- Breadcrumb navigation on all screens
- Consistent header/sidebar across modules
- Uniform button placement and styling

### **User Context**:
- Role-based navigation visibility
- Context-aware quick actions
- Personalized dashboard content

### **Accessibility**:
- Keyboard navigation support
- Screen reader compatibility
- Clear focus indicators

### **Performance**:
- Lazy loading for heavy screens
- Optimistic UI updates
- Smooth transitions between screens
