# 🎨 HRMS Application Visualization Guide

## 📌 Purpose

This document provides visual representations of the AI-Enhanced HRMS application including user flows, screen layouts, navigation patterns, and system architecture.

## 🏗️ Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-Enhanced HRMS Platform                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Tailwind CSS v4 + ShadCN UI)               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Admin     │ │   Manager   │ │  Employee   │              │
│  │ Dashboard   │ │ Dashboard   │ │ Dashboard   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  Backend Services (Node.js + Express)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   Auth   │ │Employee  │ │Attendance│ │  Leave   │         │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Payroll  │ │Performance│ │    AI    │ │ Reports  │         │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  Database (MySQL)                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Core Tables │ │ AI Tables   │ │ Audit Tables│              │
│  │ (11 tables) │ │ (6 tables)  │ │ (Optional)  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  External AI Services                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Gemini API (Google AI)                        ││
│  │  • Chatbot Conversations  • Smart Feedback                ││
│  │  • Resume Parsing         • Report Insights               ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 User Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                         │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ Application │
    │   Starts    │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐     No      ┌─────────────┐
    │Check Token  │────────────▶│Login Screen │
    │   Valid?    │             │             │
    └──────┬──────┘             └──────┬──────┘
           │ Yes                       │
           ▼                           ▼
    ┌─────────────┐             ┌─────────────┐
    │ Role-Based  │             │ Authenticate│
    │ Dashboard   │◀────────────│   User      │
    └─────────────┘             └─────────────┘

Role-Based Redirects:
├── Admin    → /admin/dashboard
├── Manager  → /manager/dashboard
└── Employee → /employee/dashboard
```

## 👥 Role-Based Navigation Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                      Navigation Hierarchy                       │
└─────────────────────────────────────────────────────────────────┘

🔴 ADMIN ROLE
├── 📊 Dashboard
├── 👥 Employees
│   ├── Employee List
│   ├── Add Employee
│   └── Employee Profile
├── ⏰ Attendance
│   ├── Attendance Overview
│   └── Team Attendance
├── 🏖️ Leave Management
│   ├── Leave Approvals
│   └── Leave Reports
├── 💰 Payroll
│   ├── Process Payroll
│   └── Payroll Reports
├── 📊 Performance
│   ├── Performance Overview
│   └── Review Management
├── 🤖 AI Features
│   ├── Attrition Predictor
│   ├── Smart Reports
│   ├── Resume Parser
│   └── Anomaly Detection
└── 📈 Reports

🟡 MANAGER ROLE
├── 📊 Dashboard
├── 👥 My Team
├── ⏰ Team Attendance
├── 🏖️ Leave Approvals
├── 📊 Team Performance
├── 🤖 AI Insights
└── 📈 Team Reports

🟢 EMPLOYEE ROLE
├── 📊 Dashboard
├── 👤 My Profile
├── ⏰ My Attendance
├── 🏖️ My Leave
├── 💰 My Payroll
├── 📊 My Performance
└── 🤖 AI Chatbot
```

## 🖥️ Screen Layout Wireframes

### **Login Screen Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│                         HRMS Login                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│    ┌─────────────────────────────────────────────────────┐     │
│    │                                                     │     │
│    │  🏢 AI-Enhanced HRMS                               │     │
│    │                                                     │     │
│    │  ┌─────────────────────────────────────────────┐   │     │
│    │  │ Email Address                               │   │     │
│    │  │ ┌─────────────────────────────────────────┐ │   │     │
│    │  │ │ user@company.com                        │ │   │     │
│    │  │ └─────────────────────────────────────────┘ │   │     │
│    │  └─────────────────────────────────────────────┘   │     │
│    │                                                     │     │
│    │  ┌─────────────────────────────────────────────┐   │     │
│    │  │ Password                                    │   │     │
│    │  │ ┌─────────────────────────────────────────┐ │   │     │
│    │  │ │ ••••••••••••                           👁│ │   │     │
│    │  │ └─────────────────────────────────────────┘ │   │     │
│    │  └─────────────────────────────────────────────┘   │     │
│    │                                                     │     │
│    │  ┌─────────────────────────────────────────────┐   │     │
│    │  │ Role Selection                              │   │     │
│    │  │ ┌─────────────────────────────────────────┐ │   │     │
│    │  │ │ Admin ▼                                 │ │   │     │
│    │  │ └─────────────────────────────────────────┘ │   │     │
│    │  └─────────────────────────────────────────────┘   │     │
│    │                                                     │     │
│    │  ☐ Remember Me                                     │     │
│    │                                                     │     │
│    │  ┌─────────────────────────────────────────────┐   │     │
│    │  │              LOGIN                          │   │     │
│    │  └─────────────────────────────────────────────┘   │     │
│    │                                                     │     │
│    └─────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### **Admin Dashboard Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 HRMS    👤 John Doe (Admin)  🔔 3  ⚙️  🚪                    │
├─────────────────────────────────────────────────────────────────┤
│ 📊│                    Admin Dashboard                          │
│ 👥│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│ ⏰│ │Total Employees│ │Active Today │ │Pending Leave│ │AI Alerts││
│ 🏖️│ │     150      │ │    142     │ │      8      │ │    3    ││
│ 💰│ │   📈 +5%     │ │   ✅ 95%   │ │   ⏳ Review │ │  ⚠️ High ││
│ 📊│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│ 🤖│                                                             │
│ 📈│ ┌─────────────────────────────────────────────────────────┐│
│   │ │              Attendance Overview Chart                  ││
│   │ │  📊 ████████████████████████████████████████████████   ││
│   │ │     Mon  Tue  Wed  Thu  Fri  Sat  Sun                  ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────────────┐ ┌─────────────────────────────────┐│
│   │ │ Pending Approvals   │ │ AI Insights                     ││
│   │ │ • John - Sick Leave │ │ • 3 High Attrition Risk        ││
│   │ │ • Sarah - Vacation  │ │ • 5 Attendance Anomalies       ││
│   │ │ • Mike - Emergency  │ │ • Performance Review Due: 12   ││
│   │ └─────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### **Employee Dashboard Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏢 HRMS    👤 Jane Smith (Employee)  🔔 1  ⚙️  🚪              │
├─────────────────────────────────────────────────────────────────┤
│ 📊│                   My Dashboard                              │
│ 👤│ ┌─────────────────────────────────────────────────────────┐│
│ ⏰│ │ Welcome back, Jane! 👋                                  ││
│ 🏖️│ │ Today: Monday, January 15, 2024                        ││
│ 💰│ └─────────────────────────────────────────────────────────┘│
│ 📊│                                                             │
│ 🤖│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│   │ │ Check In/Out│ │Leave Balance│ │This Month   │           │
│   │ │             │ │             │ │Attendance   │           │
│   │ │ ┌─────────┐ │ │Annual: 20   │ │             │           │
│   │ │ │CHECK IN │ │ │Sick: 10     │ │ 📊 95%      │           │
│   │ │ └─────────┘ │ │Emergency: 5 │ │ ✅ Excellent│           │
│   │ │             │ │             │ │             │           │
│   │ └─────────────┘ └─────────────┘ └─────────────┘           │
│   │                                                             │
│   │ ┌─────────────────────────────────────────────────────────┐│
│   │ │ Quick Actions                                           ││
│   │ │ [Apply Leave] [View Payslip] [Update Profile] [Goals]  ││
│   │ └─────────────────────────────────────────────────────────┘│
│   │                                                             │
│   │ ┌─────────────────────┐ ┌─────────────────────────────────┐│
│   │ │ Recent Activities   │ │ 🤖 AI Assistant                ││
│   │ │ • Checked in 9:00AM │ │ Hi Jane! How can I help you    ││
│   │ │ • Goal updated      │ │ today?                          ││
│   │ │ • Payslip available │ │ [Ask Question] [Quick Actions]  ││
│   │ └─────────────────────┘ └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🤖 AI Features Visualization

### **AI Chatbot Interface**
```
┌─────────────────────────────────────────────────────────────────┐
│                      🤖 HR Assistant                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 🤖 Hi! I'm your AI HR Assistant. How can I help you today?     │
│                                                                 │
│ 👤 What's my leave balance?                                     │
│                                                                 │
│ 🤖 Your current leave balance:                                  │
│    • Annual Leave: 20 days remaining                           │
│    • Sick Leave: 10 days remaining                             │
│    • Emergency Leave: 5 days remaining                         │
│                                                                 │
│    Quick Actions:                                               │
│    [Apply for Leave] [View Leave History]                      │
│                                                                 │
│ 👤 How do I apply for leave?                                    │
│                                                                 │
│ 🤖 To apply for leave:                                          │
│    1. Click "Apply for Leave" button                           │
│    2. Select leave type and dates                              │
│    3. Add reason and submit                                     │
│    4. Your manager will be notified for approval               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Type your message...                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                    [Send] 📤   │
└─────────────────────────────────────────────────────────────────┘
```

### **Attrition Predictor Dashboard**
```
┌─────────────────────────────────────────────────────────────────┐
│                   🎯 Attrition Predictor                       │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│ │Total Employees│ │ High Risk   │ │Medium Risk  │ │  Low Risk   ││
│ │     150      │ │     12      │ │     25      │ │    113      ││
│ │              │ │   🔴 8%     │ │  🟡 17%     │ │  🟢 75%     ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Employee Risk Analysis                                      │ │
│ ├─────────────┬─────────────┬─────────┬─────────────────────┤ │
│ │ Employee    │ Department  │ Risk %  │ Key Factors         │ │
│ ├─────────────┼─────────────┼─────────┼─────────────────────┤ │
│ │ John Doe    │ Engineering │ 🔴 85%  │ No promotion, Low   │ │
│ │             │             │         │ engagement          │ │
│ ├─────────────┼─────────────┼─────────┼─────────────────────┤ │
│ │ Sarah Wilson│ Marketing   │ 🔴 78%  │ Salary below market,│ │
│ │             │             │         │ High workload       │ │
│ ├─────────────┼─────────────┼─────────┼─────────────────────┤ │
│ │ Mike Johnson│ Sales       │ 🟡 65%  │ Limited growth      │ │
│ │             │             │         │ opportunities       │ │
│ └─────────────┴─────────────┴─────────┴─────────────────────┘ │
│                                                                 │
│ [📊 Generate Report] [📧 Send Alerts] [🔄 Refresh Analysis]    │
└─────────────────────────────────────────────────────────────────┘
```

## 📱 Mobile Responsive Design

### **Mobile Navigation**
```
┌─────────────────────┐
│ ☰ HRMS    🔔 👤 🚪 │
├─────────────────────┤
│                     │
│ 📊 Dashboard        │
│                     │
│ ┌─────────────────┐ │
│ │ Quick Actions   │ │
│ │ ┌─────┐ ┌─────┐ │ │
│ │ │Check│ │Leave│ │ │
│ │ │ In  │ │Apply│ │ │
│ │ └─────┘ └─────┘ │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Today's Stats   │ │
│ │ ✅ Checked In   │ │
│ │ ⏰ 8h 30m       │ │
│ │ 🏖️ 20 days left │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 🤖 AI Assistant │ │
│ │ "How can I help │ │
│ │  you today?"    │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

## 🔄 Data Flow Visualization

### **Employee Check-in Flow**
```
Employee Action → Frontend → Backend → Database → Response

👤 Click "Check In"
    ↓
🖥️ LoginForm.jsx
    ↓ POST /api/attendance/checkin
🔧 attendance-service
    ↓ INSERT INTO attendance
🗄️ MySQL Database
    ↓ Success Response
🖥️ Update UI State
    ↓
👤 "Checked in successfully!"
```

### **AI Chatbot Query Flow**
```
User Question → Frontend → AI Service → Gemini API → Response

👤 "What's my leave balance?"
    ↓
🖥️ ChatWidget.jsx
    ↓ POST /api/ai/chatbot/query
🤖 ai-service
    ↓ Query user data + Gemini API
🧠 Google Gemini AI
    ↓ Formatted response
🖥️ Display AI response
    ↓
👤 See leave balance + quick actions
```

## 🎨 Color Scheme & Design System

### **Color Palette**
```
Primary Colors:
🔵 Primary Blue:   #3B82F6 (Buttons, Links)
🟢 Success Green:  #10B981 (Success states)
🔴 Error Red:      #EF4444 (Errors, High risk)
🟡 Warning Yellow: #F59E0B (Medium risk, Warnings)

Neutral Colors:
⚫ Text Dark:      #1F2937 (Primary text)
🔘 Text Medium:    #6B7280 (Secondary text)
⚪ Background:     #F9FAFB (Page background)
🔳 Border:         #E5E7EB (Borders, Dividers)

Role Colors:
🔴 Admin:          #DC2626 (Admin features)
🟡 Manager:        #D97706 (Manager features)
🟢 Employee:       #059669 (Employee features)
```

### **Typography Scale**
```
Headings:
H1: 2.25rem (36px) - Page titles
H2: 1.875rem (30px) - Section headers
H3: 1.5rem (24px) - Card titles
H4: 1.25rem (20px) - Subsections

Body Text:
Large: 1.125rem (18px) - Important content
Base: 1rem (16px) - Regular content
Small: 0.875rem (14px) - Captions, labels
Tiny: 0.75rem (12px) - Timestamps, metadata
```

## 📊 Feature-Specific Visualizations

### **Employee List with Filters**
```
┌─────────────────────────────────────────────────────────────────┐
│ 👥 Employee Management                                          │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ [+ Add Employee]│
│ │🔍 Search... │ │Department ▼ │ │Status ▼     │                 │
│ └─────────────┘ └─────────────┘ └─────────────┘                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Photo │ Name        │ ID     │ Dept    │ Position │ Status  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 👤    │ John Doe    │ EMP001 │ IT      │ Developer│ ✅ Active│ │
│ │ 👤    │ Jane Smith  │ EMP002 │ HR      │ Manager  │ ✅ Active│ │
│ │ 👤    │ Mike Wilson │ EMP003 │ Sales   │ Rep      │ ⏸️ Leave │ │
│ │ 👤    │ Sarah Davis │ EMP004 │ Marketing│ Lead    │ ✅ Active│ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Showing 1-20 of 150 employees    [◀ Previous] [1][2][3] [Next ▶]│
└─────────────────────────────────────────────────────────────────┘
```

### **Leave Application Form**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🏖️ Apply for Leave                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Leave Type *                                                │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Annual Leave ▼                                          │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────┐ │
│ │ Start Date *        │ │ End Date *          │ │ Total Days  │ │
│ │ ┌─────────────────┐ │ │ ┌─────────────────┐ │ │             │ │
│ │ │ 📅 2024-02-01   │ │ │ │ 📅 2024-02-05   │ │ │      5      │ │
│ │ └─────────────────┘ │ │ └─────────────────┘ │ │             │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Reason for Leave *                                          │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ Family vacation to celebrate anniversary...             │ │ │
│ │ │                                                         │ │ │
│ │ │                                                         │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📊 Your Leave Balance                                       │ │
│ │ Annual Leave: 20 days remaining                             │ │
│ │ After this request: 15 days remaining                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Cancel]                                          [Submit Leave]│
└─────────────────────────────────────────────────────────────────┘
```

### **Performance Review Interface**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📊 Performance Review - John Doe (Q4 2024)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Overall Rating                                              │ │
│ │ ⭐⭐⭐⭐⭐ (4/5) Exceeds Expectations                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🎯 Goals Achievement                                        │ │
│ │ ✅ Complete React Training (100%)                           │ │
│ │ ✅ Lead 2 Projects (100%)                                   │ │
│ │ 🔄 Improve Team Collaboration (80%)                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🤖 AI-Generated Feedback                                    │ │
│ │ "John consistently delivers high-quality work and shows    │ │
│ │ excellent technical skills. His leadership in the React    │ │
│ │ migration project was outstanding. Recommend focusing on   │ │
│ │ cross-team communication for continued growth."            │ │
│ │                                                             │ │
│ │ [✅ Approve] [✏️ Edit] [❌ Regenerate]                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Manager Comments                                            │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ I agree with the AI assessment. John has been          │ │ │
│ │ │ exceptional this quarter...                             │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [Save Draft]                                    [Submit Review] │
└─────────────────────────────────────────────────────────────────┘
```

## 🎭 Animation & Interaction Patterns

### **Button Hover States**
```
Normal State:     [  Login  ]
Hover State:      [🔄 Login  ] (with subtle glow)
Loading State:    [⏳ Logging in...]
Success State:    [✅ Success!]
```

### **Card Hover Effects**
```
Normal:           ┌─────────────┐
                  │   Content   │
                  └─────────────┘

Hover:            ┌─────────────┐ ← Subtle shadow
                  │   Content   │ ← Slight scale up
                  └─────────────┘ ← Smooth transition
```

### **Loading States**
```
Data Loading:     ┌─────────────────┐
                  │ ⏳ Loading...   │
                  │ ████████████    │ (Progress bar)
                  └─────────────────┘

Skeleton Loading: ┌─────────────────┐
                  │ ▓▓▓▓▓▓▓▓        │ (Shimmer effect)
                  │ ▓▓▓▓▓▓          │
                  │ ▓▓▓▓▓▓▓▓▓▓      │
                  └─────────────────┘
```

## 📐 Responsive Breakpoints

### **Desktop (1024px+)**
```
┌─────────────────────────────────────────────────────────────────┐
│ [Sidebar] [                Main Content Area                  ] │
│ [       ] [                                                   ] │
│ [       ] [  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                 ] │
│ [       ] [  │Card │ │Card │ │Card │ │Card │                 ] │
│ [       ] [  └─────┘ └─────┘ └─────┘ └─────┘                 ] │
│ [       ] [                                                   ] │
└─────────────────────────────────────────────────────────────────┘
```

### **Tablet (768px - 1023px)**
```
┌─────────────────────────────────────────────────────────────────┐
│ [☰] [              Main Content Area                         ] │
│     [                                                         ] │
│     [  ┌─────────┐ ┌─────────┐                               ] │
│     [  │  Card   │ │  Card   │                               ] │
│     [  └─────────┘ └─────────┘                               ] │
│     [  ┌─────────┐ ┌─────────┐                               ] │
│     [  │  Card   │ │  Card   │                               ] │
│     [  └─────────┘ └─────────┘                               ] │
└─────────────────────────────────────────────────────────────────┘
```

### **Mobile (320px - 767px)**
```
┌─────────────────────┐
│ [☰] [Header] [🔔👤] │
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │      Card       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      Card       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │      Card       │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ [🏠][👥][⏰][🤖][👤] │ ← Bottom nav
└─────────────────────┘
```

## 🔄 State Management Visualization

### **Application State Flow**
```
┌─────────────────────────────────────────────────────────────────┐
│                    React Context State                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ AuthContext          │ EmployeeContext      │ UIContext         │
│ ├── user             │ ├── employees        │ ├── theme         │
│ ├── token            │ ├── currentEmployee  │ ├── sidebar       │
│ ├── role             │ ├── departments      │ ├── loading       │
│ └── isAuthenticated  │ └── filters          │ └── notifications │
│                      │                      │                   │
│ AttendanceContext    │ LeaveContext         │ AIContext         │
│ ├── todayAttendance  │ ├── applications     │ ├── chatHistory   │
│ ├── history          │ ├── balances         │ ├── predictions   │
│ ├── isCheckedIn      │ ├── approvals        │ ├── insights      │
│ └── workingHours     │ └── leaveTypes       │ └── isProcessing  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This comprehensive visualization guide provides a complete picture of how the AI-Enhanced HRMS application will look, feel, and function across all devices and user interactions.
