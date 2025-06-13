# 💰 AGENT 5 - PAYROLL SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 5
- **Service**: Payroll Service
- **Workspace Folder**: `backend/services/payroll-service/`
- **Git Branch**: `feature/payroll-service-implementation`
- **Development Phase**: Phase 2 (Business Logic)
- **Priority**: MEDIUM (Business Service)
- **Dependencies**: Agents 2 (Employee) & 3 (Attendance) must be completed first

## 🚨 **CRITICAL RULES - MUST FOLLOW EXACTLY**

### **🚫 ABSOLUTE PROHIBITIONS:**
```bash
# NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN  
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
git checkout [other-branch]  # ❌ FORBIDDEN
git pull origin main         # ❌ FORBIDDEN
```

### **✅ ALLOWED GIT OPERATIONS:**
```bash
git status                   # ✅ Check file status
git add .                    # ✅ Stage your changes
git diff                     # ✅ View changes
git branch                   # ✅ Check current branch
git log --oneline -10        # ✅ View recent commits
```

### **📁 WORKSPACE BOUNDARIES:**
- ✅ **WORK ONLY** in: `backend/services/payroll-service/`
- ❌ **NEVER TOUCH**: 
  - `backend/shared/` folder
  - `backend/config/` folder
  - `backend/app.js`
  - Other service folders
  - Package.json files
  - .env files

## 📚 **MANDATORY READING**
Before starting, read these documents:
1. `planning/Workflow/backend.md`
2. `planning/Backend_Agent_Tasks.md` (Agent 5 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (payroll tables)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
GET  /api/payroll/payslips        # Get payslips for current user
GET  /api/payroll/payslips/:id    # Get specific payslip
POST /api/payroll/process         # Process payroll (Admin only)
GET  /api/payroll/summary         # Get payroll summary
PUT  /api/payroll/salary-components/:id # Update salary components
GET  /api/payroll/tax-settings    # Get tax settings
PUT  /api/payroll/tax-settings    # Update tax settings (Admin)
```

### **Required File Structure:**
```
backend/services/payroll-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── PayrollController.js    # Payroll operations
│   ├── PayslipController.js    # Payslip management
│   └── SalaryController.js     # Salary components
├── services/
│   ├── PayrollService.js       # Payroll business logic
│   ├── SalaryCalculationService.js # Salary calculations
│   └── TaxCalculationService.js # Tax calculations
├── models/
│   ├── PayrollRecord.js        # Payroll record model
│   └── SalaryComponent.js      # Salary component model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── payroll.test.js         # Unit tests
    └── integration/
        └── payroll.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. PayrollController.js - Core Methods:**
```javascript
class PayrollController {
  static async getPayslips(req, res)      // Get user's payslips
  static async getPayslipById(req, res)   // Get specific payslip
  static async processPayroll(req, res)   // Process monthly payroll
  static async getSummary(req, res)       // Get payroll summary
}
```

#### **2. SalaryCalculationService.js - Calculation Logic:**
```javascript
class SalaryCalculationService {
  static calculateBasicSalary(employee, attendance)    // Calculate basic salary
  static calculateAllowances(basicSalary)              // Calculate allowances
  static calculateOvertimePay(overtimeHours, hourlyRate) // Calculate overtime
  static calculateGrossSalary(components)               // Calculate gross salary
  static calculateDeductions(grossSalary, employee)    // Calculate deductions
  static calculateNetSalary(gross, deductions)         // Calculate net salary
}
```

#### **3. TaxCalculationService.js - Tax Logic:**
```javascript
class TaxCalculationService {
  static calculateIncomeTax(grossSalary)     // Calculate income tax
  static calculatePF(basicSalary)           // Calculate PF deduction
  static calculateESI(grossSalary)          // Calculate ESI (if applicable)
  static calculateProfessionalTax()         // Calculate professional tax
}
```

#### **4. Payroll Processing Workflow:**
```javascript
// Monthly payroll processing steps:
1. Get all active employees
2. Fetch attendance data for the month
3. Calculate salary components for each employee
4. Apply tax calculations
5. Generate payroll records
6. Create payslips
7. Update employee salary history
```

#### **5. Salary Components (Simplified):**
```javascript
// Earnings
- Basic Salary (from employee record)
- HRA (40% of basic salary)
- Transport Allowance (Fixed ₹2000)
- Overtime Pay (1.5x hourly rate)

// Deductions  
- PF (12% of basic salary)
- Income Tax (simplified slab-based)
- Professional Tax (₹200 if gross > ₹21,000)

// Net Salary = Gross Salary - Total Deductions
```

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('SalaryCalculationService', () => {
  test('basic salary calculation based on attendance')
  test('allowances calculation')
  test('overtime pay calculation')
  test('gross salary calculation')
  test('net salary calculation')
})

describe('TaxCalculationService', () => {
  test('income tax calculation for different slabs')
  test('PF calculation (12% of basic)')
  test('professional tax calculation')
})

describe('PayrollController', () => {
  test('payroll processing for multiple employees')
  test('payslip generation')
  test('payroll summary calculation')
})
```

### **Integration Tests:**
```javascript
describe('Payroll API Integration', () => {
  test('complete payroll processing workflow')
  test('payslip retrieval and viewing')
  test('salary component management')
  test('integration with attendance data')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Secure payroll data access (employees see only their data)
- Admin-only access for payroll processing
- Encrypt sensitive salary information
- Audit trail for payroll changes
- Validate calculation accuracy
- Prevent unauthorized salary modifications

## 📋 **DATABASE INTEGRATION**
Use the `payroll_records` and `salary_components` tables:
```sql
-- payroll_records table
payroll_records (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(12,2),
  hra DECIMAL(12,2),
  transport_allowance DECIMAL(12,2),
  overtime_pay DECIMAL(12,2),
  gross_salary DECIMAL(12,2),
  pf_deduction DECIMAL(12,2),
  tax_deduction DECIMAL(12,2),
  other_deductions DECIMAL(12,2),
  total_deductions DECIMAL(12,2),
  net_salary DECIMAL(12,2),
  working_days INTEGER,
  present_days INTEGER,
  overtime_hours DECIMAL(4,2),
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- salary_components table (for custom components)
salary_components (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  component_name VARCHAR(100),
  component_type VARCHAR(20), -- 'earning' or 'deduction'
  amount DECIMAL(12,2),
  is_percentage BOOLEAN DEFAULT false,
  percentage_of VARCHAR(50), -- 'basic_salary', 'gross_salary'
  is_active BOOLEAN DEFAULT true
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 7 API endpoints implemented and working
- [ ] Payroll processing system functional
- [ ] Salary calculation logic accurate
- [ ] Tax calculation working correctly
- [ ] Payslip generation operational
- [ ] Integration with attendance data working
- [ ] Security measures implemented
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Error handling comprehensive

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 5 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/payroll-service/
🌿 **Branch**: feature/payroll-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- Calculation Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- GET /api/payroll/payslips: [✅/❌]
- GET /api/payroll/payslips/:id: [✅/❌]
- POST /api/payroll/process: [✅/❌]
- GET /api/payroll/summary: [✅/❌]
- PUT /api/payroll/salary-components/:id: [✅/❌]
- GET /api/payroll/tax-settings: [✅/❌]
- PUT /api/payroll/tax-settings: [✅/❌]

🔒 **Features Implemented**:
- Payroll processing: [✅/❌]
- Salary calculations: [✅/❌]
- Tax calculations: [✅/❌]
- Payslip generation: [✅/❌]
- Attendance integration: [✅/❌]

🔗 **Integration Notes**:
- Successfully integrated with Employee Service
- Successfully integrated with Attendance Service
- Ready for frontend payroll module
- Payroll data ready for AI anomaly detection

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Complex tax calculation requirements
- Integration issues with Employee/Attendance services
- Salary calculation edge cases
- Security implementation questions
- Performance issues with large datasets

**Report Format**: "🚨 URGENT: Agent 5 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the payroll system. Remember: **WORK ONLY in backend/services/payroll-service/** and **NEVER commit code**.

This service provides critical data for AI anomaly detection! 🎯
