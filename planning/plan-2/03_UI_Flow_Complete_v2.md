# 🔄 Complete UI Flow Navigation v2 - Streamlined AI-Enhanced HRMS

## 📌 Assignment Context

This document maps the complete screen-to-screen navigation for the **streamlined 15-screen** HRMS platform, covering all user roles and transitions with consolidated workflows.

## 🚀 Application Entry Points

### **Initial Load**
- **URL**: `/` 
- **Logic**: Check authentication status
- **Authenticated**: Redirect to role-based dashboard
- **Unauthenticated**: Redirect to `/login`

## 🔐 Authentication Flow (1 Screen)

### **1. Login Screen (`/login`)**
**Elements & Transitions**:
- **Email Input** → Focus to Password Input (Tab/Enter)
- **Password Input** → Focus to Role Selector (Tab/Enter)
- **Role Selector** → Focus to Login Button (Tab/Enter)
- **Login Button** → 
  - Success: Navigate to role-based dashboard
  - Error: Show error message, stay on login
- **Remember Me** → Toggle state (no navigation)

## 👑 Admin Role Navigation Flow (8 Accessible Screens)

### **2. Admin Dashboard (`/admin/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/admin/dashboard`
  - Employees → Navigate to `/admin/employees`
  - Attendance → Navigate to `/attendance`
  - Leave → Navigate to `/leave`
  - Payroll → Navigate to `/payroll`
  - Performance → Navigate to `/performance`
  - AI Features → Navigate to `/admin/ai`
- **Quick Action Cards**:
  - Add Employee → Open modal (no navigation)
  - Process Payroll → Navigate to `/payroll` (Management tab)
  - View AI Insights → Navigate to `/admin/ai`
- **Header Elements**:
  - Profile Dropdown → Settings modal (no navigation)
  - Notifications → Notifications panel (no navigation)
  - Logout → Navigate to `/login`

### **3. Employee List (`/admin/employees`)**
**Elements & Transitions**:
- **Add Employee Button** → Open Add Employee modal (no navigation)
- **Employee Row Click** → Navigate to `/admin/employees/:id`
- **Quick Edit Button** → Open Edit modal (no navigation)
- **Search/Filter** → Update table data (no navigation)
- **Export Button** → Download file (no navigation)

### **4. Employee Profile (`/admin/employees/:id`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - Personal Info, Employment, Attendance, Leave, Performance, Payroll
- **Edit Button** → Toggle edit mode (no navigation)
- **Save Changes** → Update data, stay on page
- **Back Button** → Navigate to `/admin/employees`
- **Generate Report** → Download report (no navigation)

### **5. Attendance Hub (`/attendance`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - Today's Status, History, Team View, Reports
- **Check In/Out** → Update status (no navigation)
- **Date Range Picker** → Filter data (no navigation)
- **Export Report** → Download file (no navigation)
- **Employee Link** → Navigate to `/admin/employees/:id`

### **6. Leave Hub (`/leave`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - Apply Leave, My History, Balance, Team Calendar
- **Apply Leave Form** → Submit application (no navigation)
- **View Application** → Open details modal (no navigation)
- **Cancel Request** → Update status (no navigation)

### **7. Leave Approvals (`/manager/leave/approvals`)**
**Elements & Transitions**:
- **Approve Button** → Update status, refresh list (no navigation)
- **Reject Button** → Open rejection modal (no navigation)
- **View Details** → Open application modal (no navigation)
- **Bulk Actions** → Process multiple requests (no navigation)

### **8. Payroll Hub (`/payroll`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - My Payroll, Payslips, Management, Reports
- **View Payslip** → Open payslip modal (no navigation)
- **Process Payroll** → Start processing (no navigation)
- **Download Report** → Download file (no navigation)

### **9. Performance Hub (`/performance`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - Goals, Reviews, History, Analytics
- **Add Goal** → Open goal modal (no navigation)
- **Create Review** → Open review form (no navigation)
- **View History** → Filter and display data (no navigation)

### **10. AI Hub (`/admin/ai`)**
**Elements & Transitions**:
- **Tab Navigation** → Switch between tabs (no navigation)
  - Attrition Predictor, Resume Parser, Anomaly Detection, Insights
- **Upload Resume** → Process file (no navigation)
- **View Employee Risk** → Navigate to `/admin/employees/:id`
- **Resolve Anomaly** → Update status (no navigation)
- **Export Analysis** → Download report (no navigation)

## 👨‍💼 Manager Role Navigation Flow (7 Accessible Screens)

### **Manager Dashboard (`/manager/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/manager/dashboard`
  - My Team → Navigate to `/admin/employees` (filtered)
  - Attendance → Navigate to `/attendance` (Team View tab)
  - Leave Approvals → Navigate to `/manager/leave/approvals`
  - Performance → Navigate to `/performance`
  - AI Insights → Navigate to `/admin/ai` (team-filtered)
- **Quick Actions**:
  - Approve Leaves → Navigate to `/manager/leave/approvals`
  - Team Report → Navigate to `/attendance` (Reports tab)
  - Schedule 1:1 → Open scheduling modal (no navigation)

**Accessible Screens**: Dashboard, Employee List (team), Attendance Hub, Leave Hub, Leave Approvals, Performance Hub, AI Hub (limited)

## 👤 Employee Role Navigation Flow (6 Accessible Screens)

### **Employee Dashboard (`/employee/dashboard`)**
**Navigation Elements**:
- **Sidebar Menu Items**:
  - Dashboard → Stay on `/employee/dashboard`
  - My Profile → Navigate to `/admin/employees/:id` (own profile)
  - Attendance → Navigate to `/attendance` (personal view)
  - Leave → Navigate to `/leave`
  - Payroll → Navigate to `/payroll` (personal view)
  - Performance → Navigate to `/performance` (personal view)
- **Quick Actions**:
  - Check In/Out → Update attendance (no navigation)
  - Apply Leave → Navigate to `/leave` (Apply tab)
  - View Payslip → Navigate to `/payroll` (Payslips tab)
  - Update Goals → Navigate to `/performance` (Goals tab)

**Accessible Screens**: Dashboard, Own Profile, Attendance Hub, Leave Hub, Payroll Hub, Performance Hub

## 🤖 Global AI Features

### **AI Chatbot (Global Widget)**
**Elements & Transitions**:
- **Floating Chat Button** → Open chat modal (no navigation)
- **Quick Action Buttons** → Navigate to respective screens
- **Close Button** → Close modal (no navigation)
- **File Upload** → Process resume (no navigation)

## 📱 Mobile Navigation Patterns

### **Bottom Navigation (Mobile)**
**Navigation Elements**:
- **Home Icon** → Navigate to role-based dashboard
- **Attendance Icon** → Navigate to `/attendance`
- **Leave Icon** → Navigate to `/leave`
- **AI Chat Icon** → Open chatbot modal (no navigation)
- **Profile Icon** → Navigate to own profile

### **Swipe Gestures**
- **Swipe Left** → Open sidebar (no navigation)
- **Swipe Right** → Close sidebar (no navigation)
- **Pull to Refresh** → Refresh current page data (no navigation)

## 🔄 Tab Navigation Patterns

### **Within-Screen Navigation**
All consolidated screens use consistent tab navigation:
- **Tab Click** → Switch content area (no route change)
- **Tab State** → Persisted in URL hash for bookmarking
- **Tab Access** → Role-based tab visibility
- **Tab Loading** → Individual tab content loading

### **Tab URL Structure**
```
/attendance#today          → Today's Status tab
/attendance#history        → History tab
/attendance#team           → Team View tab
/attendance#reports        → Reports tab

/leave#apply              → Apply Leave tab
/leave#history            → My History tab
/leave#balance            → Balance tab
/leave#calendar           → Team Calendar tab

/performance#goals        → Goals tab
/performance#reviews      → Reviews tab
/performance#history      → History tab
/performance#analytics    → Analytics tab
```

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

## 🎯 Navigation Benefits

### **Reduced Navigation Complexity**
- ✅ **50% fewer route changes** - Most actions within current screen
- ✅ **Contextual workflows** - Related features grouped together
- ✅ **Faster task completion** - Less clicking between screens
- ✅ **Better mobile experience** - Fewer navigation levels

### **Improved User Experience**
- ✅ **Consistent patterns** - Similar navigation across features
- ✅ **Reduced cognitive load** - Fewer screens to remember
- ✅ **Better performance** - Fewer full page loads
- ✅ **Enhanced productivity** - Streamlined workflows

This streamlined navigation flow ensures intuitive user experience across all roles while maintaining security boundaries and providing efficient access to all features through consolidated screens.
