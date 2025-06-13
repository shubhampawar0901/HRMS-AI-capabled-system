# 📋 All Agent Prompts Summary - Quick Reference

## 🚨 **CRITICAL: BACKEND ARCHITECTURE UPDATED**

**ALL BACKEND AGENTS (1-8) MUST READ**: `BACKEND_AGENTS_ARCHITECTURE_UPDATE.md` before starting work.

### **⚠️ MAJOR CHANGES:**
- ✅ **Use develop branch** (not feature branches)
- ✅ **Plain SQL** (no Sequelize)
- ✅ **Global folder structure** (no shared folder)
- ✅ **Update existing files** (don't create new ones)

## 🎯 **Agent Prompt Files Created**

### **✅ Backend Services (Phase 1 & 2) - COMPLETED**
1. **Agent 1**: `Agent_01_Auth_Service_Prompt.md` - Authentication Service
2. **Agent 2**: `Agent_02_Employee_Service_Prompt.md` - Employee Management Service
3. **Agent 3**: `Agent_03_Attendance_Service_Prompt.md` - Attendance Service
4. **Agent 4**: `Agent_04_Leave_Service_Prompt.md` - Leave Management Service
5. **Agent 5**: `Agent_05_Payroll_Service_Prompt.md` - Payroll Service
6. **Agent 6**: `Agent_06_Performance_Service_Prompt.md` - Performance Management Service
7. **Agent 7**: `Agent_07_AI_Service_Prompt.md` - AI Features Service
8. **Agent 8**: `Agent_08_Reports_Service_Prompt.md` - Reports Service

### **✅ Frontend Modules (Phase 3 & 4) - COMPLETED**
9. **Agent 9**: `Agent_09_Auth_Module_Prompt.md` - Authentication Module
10. **Agent 10**: `Agent_10_Dashboard_Module_Prompt.md` - Dashboard Module
11. **Agent 11**: `Agent_11_Employee_Module_Prompt.md` - Employee Management Module
12. **Agent 12**: `Agent_12_Attendance_Module_Prompt.md` - Attendance Module
13. **Agent 13**: `Agent_13_Leave_Module_Prompt.md` - Leave Management Module
14. **Agent 14**: `Agent_14_Payroll_Module_Prompt.md` - Payroll Module
15. **Agent 15**: `Agent_15_Performance_Module_Prompt.md` - Performance Module
16. **Agent 16**: `Agent_16_AI_Features_Module_Prompt.md` - AI Features Module
17. **Agent 17**: `Agent_17_Reports_Module_Prompt.md` - Reports Module

### **🎉 ALL AGENT PROMPTS COMPLETED!**

---

## 🚀 **Quick Agent Assignment Reference**

### **Phase 1: Foundation Services (Agents 1-4)**
```
Location: ~/hrms-agents-1-4/
- Agent 1: backend/services/auth-service/
- Agent 2: backend/services/employee-service/
- Agent 3: backend/services/attendance-service/
- Agent 4: backend/services/leave-service/
```

### **Phase 2: Business Services (Agents 5-8)**
```
Location: ~/hrms-agents-5-8/
- Agent 5: backend/services/payroll-service/
- Agent 6: backend/services/performance-service/
- Agent 7: backend/services/ai-service/
- Agent 8: backend/services/reports-service/
```

### **Phase 3: Frontend Core (Agents 9-13)**
```
Location: ~/hrms-agents-9-13/
- Agent 9: frontend/src/modules/auth/
- Agent 10: frontend/src/modules/dashboard/
- Agent 11: frontend/src/modules/employees/
- Agent 12: frontend/src/modules/attendance/
- Agent 13: frontend/src/modules/leave/
```

### **Phase 4: Frontend Advanced (Agents 14-17)**
```
Location: ~/hrms-agents-14-17/
- Agent 14: frontend/src/modules/payroll/
- Agent 15: frontend/src/modules/performance/
- Agent 16: frontend/src/modules/ai-features/
- Agent 17: frontend/src/modules/reports/
```

---

## 📋 **Standard Prompt Template Structure**

Each agent prompt follows this structure:
1. **Assignment Details** (Agent ID, workspace, branch, dependencies)
2. **Critical Rules** (Git prohibitions and allowed operations)
3. **Workspace Boundaries** (Strict folder restrictions)
4. **Mandatory Reading** (Required documentation)
5. **Specific Tasks** (Detailed implementation requirements)
6. **Testing Requirements** (Unit and integration tests)
7. **Security Requirements** (Security measures)
8. **Success Criteria** (Completion checklist)
9. **Completion Protocol** (Reporting format)
10. **Emergency Protocol** (When to stop and ask for help)

---

## 🔧 **Common Elements Across All Prompts**

### **🚫 Universal Prohibitions:**
```bash
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN  
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
git checkout [other-branch]  # ❌ FORBIDDEN
```

### **✅ Universal Allowed Operations:**
```bash
git status                   # ✅ Check file status
git add .                    # ✅ Stage changes
git diff                     # ✅ View changes
git branch                   # ✅ Check current branch
```

### **📚 Universal Mandatory Reading:**
- `planning/Workflow/backend.md` OR `planning/Workflow/frontend.md`
- `planning/Backend_Agent_Tasks.md` OR `planning/Frontend_Agent_Tasks.md`
- `planning/API_Integration_Guide.md`
- Service/module-specific documentation

### **🎯 Universal Success Criteria:**
- All assigned tasks completed
- Tests passing (>90% coverage for backend)
- Code follows project standards
- No modifications outside assigned folder
- Proper error handling implemented
- Documentation updated
- Ready for integration

---

## 📞 **Universal Emergency Protocol**

**All agents must STOP and report if they encounter:**
- Git errors or conflicts
- Need to modify files outside assigned folder
- Need to install dependencies
- Database schema changes required
- API contract changes needed
- Security-related modifications required
- Integration with other services needed

**Report Format**: "🚨 URGENT: Agent [X] needs assistance - [brief issue description]"

---

## 🎯 **Next Steps for Completion**

### **✅ ALL PROMPTS COMPLETED:**
All individual prompt files have been created for Agents 10-17:

1. **Agent 10 - Dashboard Module**: ✅ Role-based dashboards, statistics widgets
2. **Agent 11 - Employee Module**: ✅ Employee management interface, CRUD operations
3. **Agent 12 - Attendance Module**: ✅ Check-in/out interface, attendance tracking
4. **Agent 13 - Leave Module**: ✅ Leave application forms, approval interface
5. **Agent 14 - Payroll Module**: ✅ Payslip viewer, salary information
6. **Agent 15 - Performance Module**: ✅ Review interface, goal management
7. **Agent 16 - AI Features Module**: ✅ Chatbot, AI predictions, smart features
8. **Agent 17 - Reports Module**: ✅ Report generation, data visualization

### **Template for Remaining Prompts:**
Each frontend prompt should include:
- React component specifications
- Redux state management
- ShadCN UI component usage
- Tailwind CSS styling
- API integration details
- Responsive design requirements
- Animation and transition specs
- Testing requirements

---

## 🚀 **READY FOR COMPLETE MULTI-AGENT DEVELOPMENT**

With ALL agent prompts completed (Agents 1-17), you can immediately start full parallel development:

1. **Phase 1**: Deploy Agents 1-4 for foundation services ✅
2. **Phase 2**: Deploy Agents 5-8 for business services ✅
3. **Phase 3**: Deploy Agents 9-13 for core frontend modules ✅
4. **Phase 4**: Deploy Agents 14-17 for advanced frontend modules ✅

**🎉 ALL 17 AGENTS READY FOR DEPLOYMENT!**

The comprehensive documentation ensures each agent has clear, specific instructions with no conflicts or overlaps! 🎯
