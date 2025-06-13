# 👥 Employee & Manager Specific Screens v2 - Streamlined HRMS

## 📌 Assignment Context

This document provides detailed screen layouts and functionality for **Employee** and **Manager** roles in the streamlined 15-screen HRMS platform. Each role has different access levels and screen configurations.

## 🎯 Role-Based Screen Access

### **👤 Employee Role (6 Accessible Screens)**
1. Employee Dashboard
2. My Profile (own profile only)
3. Attendance Hub (personal view)
4. Leave Hub (personal view)
5. Payroll Hub (personal view)
6. Performance Hub (personal view)
7. AI Chatbot (global widget)

### **👨‍💼 Manager Role (7 Accessible Screens)**
1. Manager Dashboard
2. Employee List (team members only)
3. Employee Profile (team members only)
4. Attendance Hub (team view enabled)
5. Leave Hub (team calendar enabled)
6. Leave Approvals (manager-specific)
7. Performance Hub (team view enabled)
8. AI Hub (team-filtered insights)
9. AI Chatbot (global widget)

---

## 👤 EMPLOYEE ROLE SCREENS

### **1. Employee Dashboard (`/employee/dashboard`)**

```jsx
// Component: EmployeeDashboard.jsx
// Role: Employee Only
// Features: Personal overview, quick actions, AI assistance

┌─────────────────────────────────────────────────────────────────┐
│ 🏢 HRMS    👤 John Doe (Employee)  🔔 2  ⚙️  🚪               │
├─────────────────────────────────────────────────────────────────┤
│ 📊│                   Welcome back, John! 👋                   │
│ 👤│                Monday, January 15, 2024                    │
│ ⏰│                                                             │
│ 🏖️│ ┌─────────────────────────────────────────────────────────┐│
│ 💰│ │ 🕐 Today's Status                                       ││
│ 📊│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       ││
│ 🤖│ │ │ ✅ Checked  │ │ Working     │ │ Break Time  │       ││
│   │ │ │ In: 9:00 AM │ │ Hours: 8h30m│ │ 45 minutes  │       ││
│   │ │ └─────────────┘ └─────────────┘ └─────────────┘       ││
│   │ │                                                         ││
│   │ │ ┌─────────────────────────────────────────────────────┐ ││
│   │ │ │              [CHECK OUT]                            │ ││
│   │ │ └─────────────────────────────────────────────────────┘ ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│   │ │Leave Balance│ │This Month   │ │Next Payslip│           │
│   │ │             │ │Attendance   │ │             │           │
│   │ │Annual: 20   │ │             │ │Jan 31, 2024│           │
│   │ │Sick: 10     │ │ 📊 95%      │ │$4,750.00   │           │
│   │ │Emergency: 5 │ │ ✅ Excellent│ │[View Detail]│           │
│   │ └─────────────┘ └─────────────┘ └─────────────┘           │
│   │                                                             │
│   │ ┌─────────────────────────────────────────────────────────┐│
│   │ │ 🚀 Quick Actions                                        ││
│   │ │ [Apply Leave] [View Payslip] [Update Goals] [Time Off] ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────────────┐ ┌─────────────────────────────────┐│
│   │ │ 📋 Recent Activities│ │ 🤖 AI Assistant                ││
│   │ │ • Checked in 9:00AM │ │ Hi John! How can I help you    ││
│   │ │ • Goal updated      │ │ today?                          ││
│   │ │ • Payslip available │ │                                 ││
│   │ │ • Leave approved    │ │ [Ask Question] [Quick Actions]  ││
│   │ └─────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### **2. My Profile (`/admin/employees/:id` - Own Profile Only)**

```jsx
// Component: EmployeeProfile.jsx (Personal View)
// Role: Employee (can only view/edit own profile)
// Features: Personal info editing, view-only employment data

┌─────────────────────────────────────────────────────────────────┐
│ 👤 My Profile - John Doe                                       │
├─────────────────────────────────────────────────────────────────┤
│ [Personal Info] [Employment] [My Attendance] [My Leave] [My Performance] [My Payroll]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PERSONAL INFO TAB (Editable):                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📸 Profile Photo                    [Edit Mode: ON]        │ │
│ │                                                             │ │
│ │ First Name: [John          ] Last Name: [Doe            ]  │ │
│ │ Email: [john@company.com                               ]    │ │
│ │ Phone: [+1234567890        ] Address: [123 Main St     ]   │ │
│ │                                                             │ │
│ │ Emergency Contact:                                          │ │
│ │ Name: [Jane Doe           ] Phone: [+1234567891        ]   │ │
│ │ Relationship: [Spouse     ]                                │ │
│ │                                                             │ │
│ │ [Cancel]                                      [Save Changes]│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ EMPLOYMENT TAB (View Only):                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Employee ID: EMP001                                         │ │
│ │ Department: Information Technology                          │ │
│ │ Position: Senior Developer                                  │ │
│ │ Manager: Jane Smith                                         │ │
│ │ Hire Date: January 15, 2023                                │ │
│ │ Employment Status: Active                                   │ │
│ │                                                             │ │
│ │ 📧 Contact manager for employment changes                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MY ATTENDANCE TAB:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 This Month Summary:                                      │ │
│ │ Working Days: 20 │ Present: 19 │ Absent: 1 │ Rate: 95%     │ │
│ │                                                             │ │
│ │ Recent Attendance:                                          │ │
│ │ Date       │ Check In │ Check Out │ Hours │ Status          │ │
│ │ 2024-01-15 │ 09:00    │ -         │ -     │ 🟢 Working     │ │
│ │ 2024-01-14 │ 09:15    │ 18:00     │ 8.75  │ ⚠️ Late        │ │
│ │ 2024-01-13 │ 09:00    │ 17:30     │ 8.5   │ ✅ Present     │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **3. Attendance Hub (`/attendance` - Personal View)**

```jsx
// Component: AttendanceHub.jsx (Employee View)
// Role: Employee (personal attendance only)
// Features: Personal check-in/out, history, no team view

┌─────────────────────────────────────────────────────────────────┐
│ ⏰ My Attendance                                                │
├─────────────────────────────────────────────────────────────────┤
│ [Today's Status] [My History] [Monthly Summary]                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TODAY'S STATUS TAB:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 Monday, January 15, 2024                                 │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ ✅ CHECKED IN                                           │ │ │
│ │ │ Time: 9:00 AM                                           │ │ │
│ │ │ Working Hours: 8h 30m                                   │ │ │
│ │ │ Break Time: 45 minutes                                  │ │ │
│ │ │                                                         │ │ │
│ │ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │ │
│ │ │ │ CHECK OUT   │ │ START BREAK │ │ END BREAK   │       │ │ │
│ │ │ └─────────────┘ └─────────────┘ └─────────────┘       │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ 📊 Today's Productivity:                                    │ │
│ │ Expected Hours: 8h │ Current: 8h 30m │ Status: ✅ On Track │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MY HISTORY TAB:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 Date Range: [This Month ▼] 🔍 Search                    │ │
│ │                                                             │ │
│ │ Date       │ Check In │ Check Out │ Hours │ Status │ Notes  │ │
│ │ 2024-01-15 │ 09:00    │ -         │ -     │Working │ -      │ │
│ │ 2024-01-14 │ 09:15    │ 18:00     │ 8.75  │Late    │Traffic │ │
│ │ 2024-01-13 │ 09:00    │ 17:30     │ 8.5   │Present │ -      │ │
│ │ 2024-01-12 │ 08:45    │ 18:15     │ 9.5   │Present │Overtime│ │
│ │                                                             │ │
│ │ [Export My Data] [Request Correction]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MONTHLY SUMMARY TAB:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 January 2024 Summary                                     │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│ │ │Total Days   │ │Present Days │ │Absent Days  │           │ │
│ │ │     20      │ │     19      │ │      1      │           │ │
│ │ │             │ │   ✅ 95%    │ │   ⚠️ 5%     │           │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│ │                                                             │ │
│ │ 📈 Attendance Trend: ████████████████████████████████████  │ │
│ │ Average Hours/Day: 8.2h │ Total Hours: 156h               │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **4. Leave Hub (`/leave` - Personal View)**

```jsx
// Component: LeaveHub.jsx (Employee View)
// Role: Employee (personal leave management)
// Features: Apply leave, view history, check balance

┌─────────────────────────────────────────────────────────────────┐
│ 🏖️ My Leave Management                                          │
├─────────────────────────────────────────────────────────────────┤
│ [Apply Leave] [My Applications] [Leave Balance] [Company Calendar]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ APPLY LEAVE TAB:                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📝 New Leave Application                                    │ │
│ │                                                             │ │
│ │ Leave Type: ┌─────────────────────────────────────────────┐ │ │
│ │             │ Annual Leave ▼                              │ │ │
│ │             └─────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐           │ │
│ │ │ Start Date          │ │ End Date            │           │ │
│ │ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │           │ │
│ │ │ │ 📅 2024-02-01   │ │ │ │ 📅 2024-02-05   │ │           │ │
│ │ │ └─────────────────┘ │ │ └─────────────────┘ │           │ │
│ │ └─────────────────────┘ └─────────────────────┘           │ │
│ │                                                             │ │
│ │ Total Days: 5 business days                                │ │
│ │                                                             │ │
│ │ Reason: ┌─────────────────────────────────────────────────┐ │ │
│ │         │ Family vacation to celebrate wedding           │ │ │
│ │         │ anniversary. Will be available for urgent      │ │ │
│ │         │ matters via phone.                              │ │ │
│ │         └─────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ 📊 Impact on Leave Balance:                                 │ │
│ │ Current Annual Leave: 20 days                               │ │
│ │ After this request: 15 days remaining                       │ │
│ │                                                             │ │
│ │ [Cancel]                              [Submit Application] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MY APPLICATIONS TAB:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📋 My Leave Applications                                    │ │
│ │                                                             │ │
│ │ Status Filter: [All ▼] Date Range: [This Year ▼]          │ │
│ │                                                             │ │
│ │ Date Range    │ Type    │ Days │ Status    │ Actions        │ │
│ │ Feb 1-5, 2024 │ Annual  │  5   │ 🟡 Pending│ [Cancel]      │ │
│ │ Dec 20-31,'23 │ Annual  │ 10   │ ✅ Approved│ [View]        │ │
│ │ Nov 15,'23    │ Sick    │  1   │ ✅ Approved│ [View]        │ │
│ │ Oct 10-12,'23 │ Annual  │  3   │ ✅ Approved│ [View]        │ │
│ │                                                             │ │
│ │ [Export History] [Print Summary]                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **5. Payroll Hub (`/payroll` - Personal View)**

```jsx
// Component: PayrollHub.jsx (Employee View)
// Role: Employee (personal payroll information)
// Features: View payslips, salary breakdown, tax info

┌─────────────────────────────────────────────────────────────────┐
│ 💰 My Payroll                                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Current Payroll] [My Payslips] [Tax Information] [YTD Summary]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CURRENT PAYROLL TAB:                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 January 2024 Payroll                                    │ │
│ │                                                             │ │
│ │ ┌─────────────────────┐ ┌─────────────────────┐           │ │
│ │ │ 💵 Gross Salary     │ │ 💸 Net Salary       │           │ │
│ │ │    $6,000.00        │ │    $4,750.00        │           │ │
│ │ └─────────────────────┘ └─────────────────────┘           │ │
│ │                                                             │ │
│ │ 📋 Salary Breakdown:                                        │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Basic Salary:           $5,000.00                       │ │ │
│ │ │ Performance Bonus:      $1,000.00                       │ │ │
│ │ │ ─────────────────────────────────                       │ │ │
│ │ │ Gross Total:            $6,000.00                       │ │ │
│ │ │                                                         │ │ │
│ │ │ Deductions:                                             │ │ │
│ │ │ • Federal Tax:          $900.00                         │ │ │
│ │ │ • State Tax:            $200.00                         │ │ │
│ │ │ • Social Security:      $100.00                         │ │ │
│ │ │ • Health Insurance:     $50.00                          │ │ │
│ │ │ ─────────────────────────────────                       │ │ │
│ │ │ Total Deductions:       $1,250.00                       │ │ │
│ │ │                                                         │ │ │
│ │ │ NET PAY:                $4,750.00                       │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ 📅 Pay Date: January 31, 2024                              │ │
│ │ 🏦 Direct Deposit: ****1234 (Checking)                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ MY PAYSLIPS TAB:                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 Payslip History                                          │ │
│ │                                                             │ │
│ │ Year: [2024 ▼] Month: [All ▼]                              │ │
│ │                                                             │ │
│ │ Pay Period    │ Gross    │ Net      │ Status │ Actions      │ │
│ │ Jan 2024      │ $6,000   │ $4,750   │ ✅ Paid│ [View][PDF]  │ │
│ │ Dec 2023      │ $5,500   │ $4,400   │ ✅ Paid│ [View][PDF]  │ │
│ │ Nov 2023      │ $5,500   │ $4,400   │ ✅ Paid│ [View][PDF]  │ │
│ │ Oct 2023      │ $5,500   │ $4,400   │ ✅ Paid│ [View][PDF]  │ │
│ │                                                             │ │
│ │ [Download All] [Email Payslips] [Print Summary]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

---

## 👨‍💼 MANAGER ROLE SCREENS

### **1. Manager Dashboard (`/manager/dashboard`)**

```jsx
// Component: ManagerDashboard.jsx
// Role: Manager Only
// Features: Team overview, approvals, team insights

┌─────────────────────────────────────────────────────────────────┐
│ 🏢 HRMS    👤 Jane Smith (Manager)  🔔 5  ⚙️  🚪              │
├─────────────────────────────────────────────────────────────────┤
│ 📊│                   Team Dashboard                            │
│ 👥│                Monday, January 15, 2024                    │
│ ⏰│                                                             │
│ 🏖️│ ┌─────────────────────────────────────────────────────────┐│
│ 📊│ │ 👥 Team Overview                                        ││
│ 🤖│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       ││
│   │ │ │ Team Size   │ │Present Today│ │ On Leave    │       ││
│   │ │ │     12      │ │     11      │ │      1      │       ││
│   │ │ │ employees   │ │   ✅ 92%    │ │  🏖️ Sarah   │       ││
│   │ │ └─────────────┘ └─────────────┘ └─────────────┘       ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────────────────────────────────────────────────┐│
│   │ │ ⚠️ Pending Approvals (5)                                ││
│   │ │ ┌─────────────────────────────────────────────────────┐ ││
│   │ │ │ 🏖️ John Doe - Annual Leave (Feb 1-5)              │ ││
│   │ │ │ 🏖️ Mike Wilson - Sick Leave (Jan 16)              │ ││
│   │ │ │ 📊 Sarah Davis - Performance Review Due            │ ││
│   │ │ │ ⏰ Bob Johnson - Overtime Request (15 hrs)         │ ││
│   │ │ │ 🏖️ Lisa Brown - Emergency Leave (Jan 17)          │ ││
│   │ │ └─────────────────────────────────────────────────────┘ ││
│   │ │ [View All Approvals] [Bulk Actions]                    ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│   │ │Team Attendance│ │Team Performance│ │AI Insights  │       │
│   │ │             │ │             │ │             │           │
│   │ │This Week:   │ │Avg Rating:  │ │⚠️ 2 High    │           │
│   │ │📊 94%       │ │⭐ 4.2/5     │ │Attrition    │           │
│   │ │✅ Excellent │ │✅ Strong    │ │Risks        │           │
│   │ │[View Details]│ │[View Details]│ │[View Details]│         │
│   │ └─────────────┘ └─────────────┘ └─────────────┘           │
│   │                                                             │
│   │ ┌─────────────────────────────────────────────────────────┐│
│   │ │ 🚀 Quick Actions                                        ││
│   │ │ [Approve Leaves] [Team Report] [Schedule 1:1s] [Reviews]││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────────────┐ ┌─────────────────────────────────┐│
│   │ │ 📋 Team Activities  │ │ 🤖 AI Team Insights             ││
│   │ │ • John: Checked in  │ │ Team productivity up 15% this  ││
│   │ │ • Mike: On sick leave│ │ quarter. Consider recognizing  ││
│   │ │ • Sarah: Annual leave│ │ top performers: John, Lisa.    ││
│   │ │ • Lisa: Working     │ │                                 ││
│   │ │ • Bob: Late arrival │ │ [View Full Analysis]            ││
│   │ └─────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### **2. Employee List (`/admin/employees` - Team Members Only)**

```jsx
// Component: EmployeeList.jsx (Manager View)
// Role: Manager (team members only)
// Features: View team, limited editing, performance tracking

┌─────────────────────────────────────────────────────────────────┐
│ 👥 My Team Members                                              │
├─────────────────────────────────────────────────────────────────┤
│ 🔍 Search: [john...] 📊 Department: [IT ▼] Status: [All ▼]    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Team Summary: 12 members │ 11 active │ 1 on leave        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │Photo│Name        │Position    │Status   │Performance│Actions││
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 👤  │John Doe    │Sr Developer│✅ Present│⭐ 4.5/5   │[View] ││
│ │ 👤  │Mike Wilson │Developer   │🏥 Sick  │⭐ 4.0/5   │[View] ││
│ │ 👤  │Sarah Davis │QA Lead     │🏖️ Leave │⭐ 4.8/5   │[View] ││
│ │ 👤  │Lisa Brown  │Developer   │✅ Present│⭐ 4.2/5   │[View] ││
│ │ 👤  │Bob Johnson │Jr Developer│⚠️ Late  │⭐ 3.8/5   │[View] ││
│ │ 👤  │Amy Chen    │Designer    │✅ Present│⭐ 4.6/5   │[View] ││
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Team Analytics                                           │ │
│ │ Average Performance: ⭐ 4.3/5                               │ │
│ │ Attendance Rate: 94% (This Month)                           │ │
│ │ Active Goals: 28 │ Completed: 45 │ Overdue: 3              │ │
│ │                                                             │ │
│ │ [Export Team Report] [Schedule Team Meeting] [Bulk Actions] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 🔒 Manager Note: You can view and manage your direct reports   │
│    only. Contact HR for other employee information.            │
└─────────────────────────────────────────────────────────────────┘
```

### **3. Attendance Hub (`/attendance` - Team View Enabled)**

```jsx
// Component: AttendanceHub.jsx (Manager View)
// Role: Manager (team attendance monitoring)
// Features: Team attendance, individual tracking, alerts

┌─────────────────────────────────────────────────────────────────┐
│ ⏰ Team Attendance Management                                   │
├─────────────────────────────────────────────────────────────────┤
│ [My Attendance] [Team Overview] [Team History] [Attendance Reports]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TEAM OVERVIEW TAB:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 Today - Monday, January 15, 2024                        │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│ │ │Team Present │ │ On Leave    │ │ Late/Absent │           │ │
│ │ │     11      │ │      1      │ │      1      │           │ │
│ │ │   ✅ 92%    │ │  🏖️ Sarah   │ │  ⚠️ Bob     │           │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│ │                                                             │ │
│ │ 👥 Team Status:                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │Employee    │Status    │Check In│Working│Location │Actions││ │
│ │ │John Doe    │✅ Present│09:00   │8h 30m │Office   │[View] ││ │
│ │ │Mike Wilson │🏥 Sick   │-       │-      │Home     │[View] ││ │
│ │ │Sarah Davis │🏖️ Leave  │-       │-      │-        │[View] ││ │
│ │ │Lisa Brown  │✅ Present│08:45   │8h 45m │Office   │[View] ││ │
│ │ │Bob Johnson │⚠️ Late   │09:30   │8h 00m │Office   │[Alert]││ │
│ │ │Amy Chen    │✅ Present│09:00   │8h 30m │Remote   │[View] ││ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ 🚨 Alerts & Actions:                                        │ │
│ │ • Bob Johnson: Consistently late this week                  │ │
│ │ • Mike Wilson: 3rd sick day this month                      │ │ │
│ │                                                             │ │
│ │ [Send Attendance Reminder] [Schedule 1:1] [Export Report]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TEAM HISTORY TAB:                                              │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Team Attendance Trends                                   │ │
│ │                                                             │ │
│ │ Date Range: [This Month ▼] Employee: [All ▼]               │ │
│ │                                                             │ │
│ │ 📈 Attendance Chart:                                        │ │
│ │ ████████████████████████████████████████████████████████    │ │
│ │ Week 1: 95% │ Week 2: 92% │ Week 3: 94% │ Week 4: 96%      │ │
│ │                                                             │ │
│ │ 📋 Individual Performance:                                  │ │
│ │ Employee    │ Present │ Late │ Absent │ Rate │ Trend        │ │
│ │ John Doe    │   19    │  1   │   0    │ 95%  │ ↗️ Improving │ │
│ │ Mike Wilson │   17    │  0   │   3    │ 85%  │ ↘️ Declining │ │
│ │ Sarah Davis │   18    │  1   │   1    │ 90%  │ ➡️ Stable    │ │
│ │                                                             │ │
│ │ [Individual Reports] [Team Comparison] [Export Data]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **4. Leave Approvals (`/manager/leave/approvals`)**

```jsx
// Component: LeaveApprovals.jsx
// Role: Manager Only
// Features: Approve/reject team leave requests, calendar view

┌─────────────────────────────────────────────────────────────────┐
│ 🏖️ Leave Approvals                                              │
├─────────────────────────────────────────────────────────────────┤
│ [Pending Requests] [Approved Leaves] [Team Calendar] [History] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ PENDING REQUESTS TAB:                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Requires Your Approval (5 requests)                      │ │
│ │                                                             │ │
│ │ Priority: [High First ▼] Type: [All ▼] [Bulk Actions ▼]   │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔴 HIGH PRIORITY                                        │ │ │
│ │ │ John Doe - Emergency Leave                              │ │ │
│ │ │ Date: Jan 17, 2024 (Tomorrow)                          │ │ │
│ │ │ Reason: Family emergency - father hospitalized         │ │ │
│ │ │ Duration: 1 day                                         │ │ │
│ │ │ Impact: Critical project deadline this week             │ │ │
│ │ │                                                         │ │ │
│ │ │ [✅ Approve] [❌ Reject] [💬 Request More Info]        │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🟡 MEDIUM PRIORITY                                      │ │ │
│ │ │ Mike Wilson - Annual Leave                              │ │ │
│ │ │ Date: Feb 1-5, 2024 (2 weeks notice)                   │ │ │
│ │ │ Reason: Family vacation - pre-planned                   │ │ │
│ │ │ Duration: 5 days                                        │ │ │
│ │ │ Impact: No critical deadlines affected                  │ │ │
│ │ │ Coverage: Lisa Brown (confirmed)                        │ │ │
│ │ │                                                         │ │ │
│ │ │ [✅ Approve] [❌ Reject] [📝 Add Comments]             │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🟢 LOW PRIORITY                                         │ │ │
│ │ │ Sarah Davis - Sick Leave                                │ │ │
│ │ │ Date: Jan 16, 2024 (Today)                             │ │ │
│ │ │ Reason: Flu symptoms                                    │ │ │
│ │ │ Duration: 1 day                                         │ │ │
│ │ │ Impact: Minimal - can work from home if needed         │ │ │
│ │ │                                                         │ │ │
│ │ │ [✅ Auto-Approve] [❌ Reject] [💬 Check-in]            │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ TEAM CALENDAR TAB:                                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 February 2024 - Team Leave Calendar                     │ │
│ │                                                             │ │
│ │ Mon  Tue  Wed  Thu  Fri  Sat  Sun                          │ │
│ │                  1🏖️  2🏖️  3    4                          │ │
│ │  5🏖️  6🏖️  7    8    9   10   11                          │ │
│ │ 12   13   14🏥 15   16   17   18                          │ │
│ │ 19   20   21   22   23   24   25                          │ │
│ │ 26   27   28   29                                          │ │
│ │                                                             │ │
│ │ Legend: 🏖️ Annual Leave │ 🏥 Sick Leave │ ⚠️ Pending       │ │
│ │                                                             │ │
│ │ Team Coverage Analysis:                                     │ │
│ │ • Feb 1-5: Mike on leave, Lisa covering                    │ │
│ │ • Feb 14: Sarah sick, no coverage needed                   │ │
│ │ • ⚠️ Potential conflict: 3 people requesting same week     │ │
│ │                                                             │ │
│ │ [Export Calendar] [Print Schedule] [Send Team Update]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### **5. AI Hub (`/admin/ai` - Team-Filtered Insights)**

```jsx
// Component: AIHub.jsx (Manager View)
// Role: Manager (team-specific AI insights)
// Features: Team attrition risks, performance insights, recommendations

┌─────────────────────────────────────────────────────────────────┐
│ 🤖 AI Team Insights                                             │
├─────────────────────────────────────────────────────────────────┤
│ [Team Attrition] [Performance AI] [Team Anomalies] [Recommendations]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TEAM ATTRITION TAB:                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Team Attrition Risk Analysis                             │ │
│ │                                                             │ │
│ │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│ │ │ High Risk   │ │Medium Risk  │ │  Low Risk   │           │ │
│ │ │      2      │ │      3      │ │      7      │           │ │
│ │ │   🔴 17%    │ │  🟡 25%     │ │  🟢 58%     │           │ │
│ │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│ │                                                             │ │
│ │ 🚨 Immediate Action Required:                               │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔴 Mike Wilson - 78% Risk                               │ │ │
│ │ │ Factors: Salary below market, limited growth           │ │ │
│ │ │ Last promotion: 18 months ago                           │ │ │
│ │ │ Recent feedback: Seeking new challenges                 │ │ │
│ │ │                                                         │ │ │
│ │ │ 💡 AI Recommendations:                                  │ │ │
│ │ │ • Schedule career development discussion                │ │ │
│ │ │ • Consider promotion/salary review                      │ │ │
│ │ │ • Assign challenging project leadership role           │ │ │
│ │ │                                                         │ │ │
│ │ │ [Schedule 1:1] [Request Salary Review] [Assign Project]│ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                             │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 🔴 Bob Johnson - 72% Risk                               │ │ │
│ │ │ Factors: Performance concerns, attendance issues        │ │ │
│ │ │ Recent pattern: Late arrivals, missed deadlines        │ │ │
│ │ │ Team feedback: Struggling with current workload        │ │ │
│ │ │                                                         │ │ │
│ │ │ 💡 AI Recommendations:                                  │ │ │
│ │ │ • Immediate performance improvement plan                │ │ │
│ │ │ • Additional training/mentoring support                │ │ │
│ │ │ • Workload redistribution consideration                 │ │ │
│ │ │                                                         │ │ │
│ │ │ [Create PIP] [Assign Mentor] [Schedule Training]       │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ PERFORMANCE AI TAB:                                            │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 AI-Powered Team Performance Analysis                     │ │
│ │                                                             │ │
│ │ 🏆 Top Performers (Recommended for Recognition):           │ │
│ │ • Sarah Davis - Consistently exceeds goals, team leader    │ │
│ │ • John Doe - High quality work, mentors junior developers  │ │
│ │ • Lisa Brown - Innovative solutions, great collaboration   │ │
│ │                                                             │ │
│ │ 📈 Team Trends:                                             │ │
│ │ • Overall performance improved 15% this quarter            │ │
│ │ • Code quality metrics up 22%                              │ │
│ │ • Team collaboration score: 4.6/5                          │ │
│ │                                                             │ │
│ │ 🎯 AI-Generated Team Goals:                                 │ │
│ │ • Reduce average bug resolution time by 20%                │ │
│ │ • Increase cross-training participation to 80%             │ │
│ │ • Improve client satisfaction scores to 4.8/5              │ │
│ │                                                             │ │
│ │ [Implement Goals] [Send Recognition] [Team Meeting]        │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Role-Based Feature Comparison

### **Feature Access Matrix**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Feature Access by Role                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Feature                │ Employee │ Manager │ Admin             │
│ ─────────────────────────────────────────────────────────────── │
│ Personal Dashboard     │    ✅    │   ✅    │   ✅              │
│ Own Profile Edit       │    ✅    │   ✅    │   ✅              │
│ Team Member Profiles   │    ❌    │   ✅    │   ✅              │
│ All Employee Profiles  │    ❌    │   ❌    │   ✅              │
│ Personal Attendance    │    ✅    │   ✅    │   ✅              │
│ Team Attendance View   │    ❌    │   ✅    │   ✅              │
│ All Attendance Data    │    ❌    │   ❌    │   ✅              │
│ Apply for Leave        │    ✅    │   ✅    │   ✅              │
│ Approve Team Leaves    │    ❌    │   ✅    │   ✅              │
│ All Leave Management   │    ❌    │   ❌    │   ✅              │
│ Personal Payroll       │    ✅    │   ✅    │   ✅              │
│ Team Payroll View      │    ❌    │   ❌    │   ✅              │
│ Payroll Processing     │    ❌    │   ❌    │   ✅              │
│ Personal Performance   │    ✅    │   ✅    │   ✅              │
│ Team Performance       │    ❌    │   ✅    │   ✅              │
│ Performance Reviews    │    ✅    │   ✅    │   ✅              │
│ AI Chatbot             │    ✅    │   ✅    │   ✅              │
│ Team AI Insights       │    ❌    │   ✅    │   ✅              │
│ Full AI Hub            │    ❌    │   ❌    │   ✅              │
│ Resume Parser          │    ❌    │   ❌    │   ✅              │
│ System Reports         │    ❌    │   ❌    │   ✅              │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Differences Summary

### **👤 Employee Experience**
- ✅ **Personal-focused** interface
- ✅ **Self-service** capabilities
- ✅ **Limited data access** (own information only)
- ✅ **Simplified navigation** (6 screens)
- ✅ **AI assistance** for personal queries

### **👨‍💼 Manager Experience**
- ✅ **Team-focused** interface
- ✅ **Approval workflows** for team requests
- ✅ **Team analytics** and insights
- ✅ **Performance management** tools
- ✅ **AI-powered** team recommendations
- ✅ **Moderate complexity** (7-8 screens)

### **🔒 Security & Access Control**
- ✅ **Role-based data filtering** at API level
- ✅ **UI elements** hidden based on permissions
- ✅ **Contextual navigation** based on role
- ✅ **Audit trails** for manager actions
- ✅ **Data isolation** between teams/departments

This comprehensive role-based design ensures each user type gets an optimized experience tailored to their responsibilities and access levels while maintaining security and data privacy.
```
