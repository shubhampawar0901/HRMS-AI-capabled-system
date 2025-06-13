# 🎯 Final HRMS - Role-Based Functionality & Dashboard Views

## 🔑 **Authentication (Simple)**

### **Single Login Screen**:
- Email field
- Password field  
- Role dropdown: Admin / Manager / Employee
- Login button
- **No forgot password, no registration**

---

## 🏠 **ADMIN DASHBOARD**

### **Dashboard Overview**:
```
┌─────────────────────────────────────────────────────┐
│ ADMIN DASHBOARD                                     │
├─────────────────────────────────────────────────────┤
│ Quick Stats:                                        │
│ • Total Employees: 150                             │
│ • Active: 145 | Inactive: 5                        │
│ • Present Today: 142                               │
│ • AI Alerts: 3 High Risk, 2 Anomalies             │
├─────────────────────────────────────────────────────┤
│ Quick Actions:                                      │
│ [Add Employee] [Process Payroll] [AI Features]     │
└─────────────────────────────────────────────────────┘
```

### **Admin Navigation Menu**:
1. **Dashboard** (home)
2. **Employees** 
3. **Payroll**
4. **Reports**
5. **AI Features**

---

## 👥 **ADMIN - Employee Management**

### **Employee List Screen**:
**What Admin Sees**:
- Table with: Name, Department, Position, Status, Actions
- Search bar (by name)
- **Actions per employee**: View Profile, Edit, Deactivate

### **Add Employee Screen**:
**Form Fields**:
- Full Name, Email, Phone
- Department (dropdown), Position, Manager (dropdown)
- Basic Salary, Role (Admin/Manager/Employee)
- **AI Feature**: Upload Resume → Auto-fill form

### **Employee Profile Screen**:
**Admin View**:
- **Basic Info**: Personal and employment details (editable)
- **Salary Info**: Basic salary amount only
- **Performance**: Current goals and latest review
- **AI Insights**: Attrition risk score (if high risk)
- **Actions**: Edit, Deactivate, View Reports

### **Simple Org Chart**:
**Display Format**:
```
Engineering Department
├── Jane Smith (Manager)
│   ├── John Doe (Developer)
│   └── Mike Chen (Developer)

Sales Department  
├── Sarah Johnson (Manager)
│   └── Lisa Brown (Sales Rep)

HR Department
└── Admin User (HR Admin)
```

---

## 💰 **ADMIN - Payroll Management**

### **Payroll Dashboard**:
**What Admin Sees**:
- Current month processing status
- **Actions**: Process This Month, View Payslips
- Simple processing summary

### **Process Payroll Screen**:
**Simple Workflow**:
1. Click "Process This Month's Payroll" button
2. System auto-calculates all salaries (Basic × 0.9 = Net)
3. **AI Anomaly Check**: Flags unusual salary amounts
4. Shows "150 employees processed successfully"
5. Payslips automatically generated

### **Payslip View**:
**Simple Display**:
```
Employee: John Doe | Month: January 2024

Basic Salary:     ₹50,000
Tax Deduction:    ₹5,000
Net Salary:       ₹45,000

[Download PDF]
```

---

## 📊 **ADMIN - Reports**

### **Reports Dashboard**:
**Available Reports**:
1. **Attendance Report**: Employee attendance for date range
2. **Leave Report**: Leave applications by department
3. **Payroll Report**: Salary summary by department
4. **Performance Report**: Goal achievement summary

**Each Report Has**:
- Simple filters: Date range, Department
- Export options: CSV

---

## 🤖 **ADMIN - AI Features**

### **AI Features Dashboard**:
```
┌─────────────────────────────────────────────────────┐
│ AI INSIGHTS OVERVIEW                                │
├─────────────────────────────────────────────────────┤
│ • High Risk Employees: 3                           │
│ • Attendance Anomalies: 5                          │
│ • AI Feedback Generated: 15 this month             │
│ • Resume Parsed: 5 this month                      │
├─────────────────────────────────────────────────────┤
│ [Attrition Predictor] [Anomaly Detection]          │
│ [Resume Parser] [Smart Reports]                    │
└─────────────────────────────────────────────────────┘
```

### **1. Resume Parser**:
- Upload PDF → AI extracts data → Shows extracted info → Pre-fills employee form

### **2. Attrition Predictor**:
- **Auto-runs every time page is opened** (30-45 seconds loading)
- Simple table: Employee ID, Name, Risk %, Risk Level, Primary Factor
- Sorted by risk percentage (highest first) for easy prioritization

### **3. Attendance Anomaly Detection**:
- Table showing: Employee ID, Name, Anomaly Type, Severity, Description
- Focus on attendance patterns only (overtime, absences, late arrivals)
- Mark anomalies as resolved after investigation

### **4. Smart Reports**:
- Generate AI-powered insights
- Team performance analysis
- Attendance trend predictions

---

## 👨‍💼 **MANAGER DASHBOARD**

### **Dashboard Overview**:
```
┌─────────────────────────────────────────────────────┐
│ MANAGER DASHBOARD                                   │
├─────────────────────────────────────────────────────┤
│ My Team Overview:                                   │
│ • Team Size: 8                                     │
│ • Present Today: 7                                 │
│ • On Leave: 1                                      │
│ • Pending Approvals: 2                            │
├─────────────────────────────────────────────────────┤
│ Quick Actions:                                      │
│ [View Team] [Approve Leaves] [Team Performance]    │
└─────────────────────────────────────────────────────┘
```

### **Manager Navigation Menu**:
1. **Dashboard** (home)
2. **My Team**
3. **Leave Approvals**
4. **Performance**
5. **AI Insights**

---

## 👥 **MANAGER - Team Management**

### **My Team Screen**:
**What Manager Sees**:
- List of direct reports only
- Today's attendance status per team member
- Quick actions: View Profile, Set Goals

### **Team Member Profile**:
**Manager View** (Read-only):
- Basic employee information
- Current goals and progress
- Performance history
- Attendance summary

---

## 🏖️ **MANAGER - Leave Management**

### **Leave Approvals Screen**:
**Pending Requests Display**:
```
┌─────────────────────────────────────────────────────┐
│ PENDING LEAVE APPROVALS                             │
├─────────────────────────────────────────────────────┤
│ John Doe                                            │
│ Annual Leave: Feb 15-17, 2024 (3 days)            │
│ Reason: Family vacation                             │
│ Balance: 22 days remaining                          │
│ [Approve] [Reject]                                  │
├─────────────────────────────────────────────────────┤
│ Sarah Smith                                         │
│ Sick Leave: Feb 20, 2024 (1 day)                  │
│ Reason: Medical appointment                         │
│ Balance: 10 days remaining                          │
│ [Approve] [Reject]                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📈 **MANAGER - Performance Management**

### **Team Performance Screen**:
**What Manager Sees**:
- List of team members with review status
- **Actions**: Set Goals,  Conduct Review

### **Goal Setting**:
**Simple Form**:
- Employee: (dropdown of team members)
- Goal Title: (text field)
- Target: (text field)
- Due Date: (date picker)

### **Performance Review**:
**Review Form**:
- Employee goals achievement (auto-populated)
- Overall rating (1-5 scale)
- Strengths (text area)
- Areas for improvement (text area)
- **AI Feature**: Generate Feedback button → AI suggests comments

---

## 🤖 **MANAGER - AI Features**

### **AI Insights for Team**:
- **Team Attrition Risk**: If any team member is high risk
- **Team Performance Summary**: AI-generated monthly insights
- **HR Chatbot**: Team-specific queries

### **HR Chatbot Queries**:
- "Show my team's attendance today"
- "Who has pending leave requests?"
- "What's my team's average performance rating?"

---

## 👤 **EMPLOYEE DASHBOARD**

### **Dashboard Overview**:
```
┌─────────────────────────────────────────────────────┐
│ EMPLOYEE DASHBOARD                                  │
├─────────────────────────────────────────────────────┤
│ Today's Status:                                     │
│ • Attendance: Checked In at 9:00 AM               │
│ • Leave Balance: Annual: 22, Sick: 10, Personal: 5 │
│ • Next Review: March 15, 2024                      │
├─────────────────────────────────────────────────────┤
│ Quick Actions:                                      │
│ [Check Out] [Apply Leave] [View Payslip] [HR Bot]  │
└─────────────────────────────────────────────────────┘
```

### **Employee Navigation Menu**:
1. **Dashboard** (home)
2. **Attendance**
3. **Leave**
4. **Payslip**
5. **Performance**
6. **HR Chatbot**

---

## ⏰ **EMPLOYEE - Attendance**

### **Attendance Screen**:
**What Employee Sees**:
- **Today's Status**: Check-in time, total hours
- **Actions**: Check In / Check Out buttons
- **This Month**: Present days, total hours, attendance percentage
- **View History**: Simple table of past attendance

---

## 🏖️ **EMPLOYEE - Leave Management**

### **Leave Balance Screen**:
```
┌─────────────────────────────────────────────────────┐
│ LEAVE BALANCE 2024                                  │
├─────────────────────────────────────────────────────┤
│ Annual Leave:   22 days remaining (out of 30)      │
│ Sick Leave:     10 days remaining (out of 12)      │
│ Personal Leave:  5 days remaining (out of 5)       │
├─────────────────────────────────────────────────────┤
│ [Apply for Leave]                                   │
└─────────────────────────────────────────────────────┘
```

### **Apply Leave Screen**:
**Simple Form**:
- Leave Type: Annual / Sick / Personal (dropdown)
- Start Date: (date picker)
- End Date: (date picker)
- Reason: (text area)
- **Shows**: Total days, remaining balance after leave

### **Leave History**:
- Table showing: Date, Type, Days, Status, Manager Comments

---

## 💰 **EMPLOYEE - Payslip**

### **Payslip Screen**:
**What Employee Sees**:
- Month/Year selector
- **Simple Payslip Display**:
```
January 2024 Payslip
Basic Salary: ₹50,000
Tax Deduction: ₹5,000
Net Salary: ₹45,000
```
- **Actions**: Download PDF, View Previous Month

---

## 📈 **EMPLOYEE - Performance**

### **My Performance Screen**:
**What Employee Sees**:
- **Current Goals**: List with progress bars
- **Update Progress**: Click goal → Update achievement percentage
- **Latest Review**: Manager feedback and ratings
- **Performance History**: Past review scores

---

## 🤖 **EMPLOYEE - HR Chatbot**

### **Chatbot Interface**:
**Common Employee Queries**:
- "What's my leave balance?"
- "How many hours did I work this week?"
- "When is my next performance review?"
- "What's the company leave policy?"
- "Show my latest payslip"

**Chatbot Features**:
- Natural language input
- Quick action buttons
- Personalized responses using employee data
- **Available 24/7**

---

## 🔒 **Access Control Summary**

| Feature | Admin | Manager | Employee |
|---------|-------|---------|----------|
| Employee Management | Full CRUD | View Team Only | View Self Only |
| Payroll Processing | Full Access | No Access | View Own Payslip |
| Leave Approvals | Override All | Team Only | Apply Only |
| Performance Reviews | All Reviews | Team Reviews | Self Only |
| AI Resume Parser | Full Access | No Access | No Access |
| AI Attrition Predictor | Full Access | Team Alerts | No Access |
| AI Attendance Anomaly Detection | Full Access | No Access | No Access |
| AI Smart Reports | Full Access | Team Reports | No Access |
| AI Feedback Generator | Full Access | Limited Use | No Access |
| HR Chatbot | Full Context | Team Context | Personal Context |
| Reports & Export | All Reports | Team Reports | Personal Reports |

---

## 🎯 **Key Simplifications**

### **What We Kept Simple**:
- **Single login screen** with role selection
- **Basic employee deactivation** instead of complex offboarding
- **Simple grouped org chart** instead of fancy visualization
- **Single tax deduction line** instead of complex compliance
- **Manager-only reviews** instead of 360-degree feedback
- **Pre-defined reports** instead of custom report builder
- **Essential navigation** (5-6 menu items max per role)

### **Focus Areas**:
- **AI features are prominent** and easily accessible
- **Core HRMS workflow** works end-to-end
- **Role-specific dashboards** show relevant information only
- **Minimal clicks** to reach important features
- **Clean, uncluttered interface** with essential actions only

This document provides a clear, simple view of what each role sees and can do, focusing on essential functionality while highlighting the AI features that make this HRMS special.
