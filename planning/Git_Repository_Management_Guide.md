# 🔒 Git Repository Management & Precautions Guide

## 📋 **Overview**

This document provides **strict guidelines** for managing Git repositories across multiple VSCode instances with different AI agents. It ensures **zero code loss**, **conflict prevention**, and **proper coordination** during parallel development.

---

## 🚨 **CRITICAL PRECAUTIONS**

### **🚫 ABSOLUTE PROHIBITIONS FOR AI AGENTS**:

#### **1. NO GIT COMMITS ALLOWED**
```bash
# AI AGENTS MUST NEVER RUN THESE COMMANDS:
git commit -m "..."          # ❌ FORBIDDEN
git push origin ...          # ❌ FORBIDDEN  
git merge ...                # ❌ FORBIDDEN
git rebase ...               # ❌ FORBIDDEN
git reset --hard ...         # ❌ FORBIDDEN
git checkout main/develop    # ❌ FORBIDDEN
git pull origin main         # ❌ FORBIDDEN
```

#### **2. NO BRANCH SWITCHING**
```bash
# AI AGENTS MUST NEVER SWITCH BRANCHES:
git checkout develop         # ❌ FORBIDDEN
git checkout main           # ❌ FORBIDDEN
git checkout feature/...    # ❌ FORBIDDEN (except their own)
```

#### **3. NO REPOSITORY OPERATIONS**
```bash
# AI AGENTS MUST NEVER:
git clone ...              # ❌ FORBIDDEN
git init                   # ❌ FORBIDDEN
git remote add ...         # ❌ FORBIDDEN
git submodule ...          # ❌ FORBIDDEN
```

### **✅ ALLOWED GIT OPERATIONS FOR AI AGENTS**:
```bash
# ONLY THESE COMMANDS ARE PERMITTED:
git status                 # ✅ ALLOWED - Check file status
git add .                  # ✅ ALLOWED - Stage changes
git add [specific-file]    # ✅ ALLOWED - Stage specific files
git diff                   # ✅ ALLOWED - View changes
git log --oneline -10      # ✅ ALLOWED - View recent commits
git branch                 # ✅ ALLOWED - Check current branch
```

---

## 🏗️ **Repository Setup Strategy**

### **1. Master Repository Creation**:
```bash
# User creates main repository
git init
git remote add origin https://github.com/username/hrms-project.git
git checkout -b main
git checkout -b develop

# Initial commit with base structure
git add .
git commit -m "Initial project structure"
git push origin main
git push origin develop
```

### **2. Multiple Location Setup**:
```bash
# Location 1: Agent 1-4 (Foundation Services)
mkdir ~/hrms-agents-1-4
cd ~/hrms-agents-1-4
git clone https://github.com/username/hrms-project.git .
git checkout develop

# Location 2: Agent 5-8 (Business Services)  
mkdir ~/hrms-agents-5-8
cd ~/hrms-agents-5-8
git clone https://github.com/username/hrms-project.git .
git checkout develop

# Location 3: Agent 9-13 (Frontend Core)
mkdir ~/hrms-agents-9-13
cd ~/hrms-agents-9-13
git clone https://github.com/username/hrms-project.git .
git checkout develop

# Location 4: Agent 14-17 (Frontend Advanced)
mkdir ~/hrms-agents-14-17
cd ~/hrms-agents-14-17
git clone https://github.com/username/hrms-project.git .
git checkout develop
```

---

## 🎯 **Agent-Specific Branch Strategy**

### **Branch Creation (USER ONLY)**:
```bash
# User creates branches for each agent BEFORE agent starts work

# Backend Service Branches
git checkout develop
git checkout -b feature/auth-service-implementation
git checkout -b feature/employee-service-implementation  
git checkout -b feature/attendance-service-implementation
git checkout -b feature/leave-service-implementation
git checkout -b feature/payroll-service-implementation
git checkout -b feature/performance-service-implementation
git checkout -b feature/ai-service-implementation
git checkout -b feature/reports-service-implementation

# Frontend Module Branches
git checkout -b feature/auth-module-frontend
git checkout -b feature/dashboard-module-frontend
git checkout -b feature/employees-module-frontend
git checkout -b feature/attendance-module-frontend
git checkout -b feature/leave-module-frontend
git checkout -b feature/payroll-module-frontend
git checkout -b feature/performance-module-frontend
git checkout -b feature/ai-features-module-frontend
git checkout -b feature/reports-module-frontend

# Push all branches
git push origin --all
```

### **Agent Branch Assignment**:
```bash
# Location 1: Foundation Services
# Agent 1: feature/auth-service-implementation
# Agent 2: feature/employee-service-implementation
# Agent 3: feature/attendance-service-implementation  
# Agent 4: feature/leave-service-implementation

# Location 2: Business Services
# Agent 5: feature/payroll-service-implementation
# Agent 6: feature/performance-service-implementation
# Agent 7: feature/ai-service-implementation
# Agent 8: feature/reports-service-implementation

# Location 3: Frontend Core
# Agent 9: feature/auth-module-frontend
# Agent 10: feature/dashboard-module-frontend
# Agent 11: feature/employees-module-frontend
# Agent 12: feature/attendance-module-frontend
# Agent 13: feature/leave-module-frontend

# Location 4: Frontend Advanced  
# Agent 14: feature/payroll-module-frontend
# Agent 15: feature/performance-module-frontend
# Agent 16: feature/ai-features-module-frontend
# Agent 17: feature/reports-module-frontend
```

---

## 📋 **Agent Work Instructions**

### **🎯 MANDATORY INSTRUCTIONS FOR EACH AI AGENT**:

#### **1. Agent Initialization (USER DOES THIS)**:
```bash
# User switches to agent's branch before starting agent
cd ~/hrms-agents-[group]
git checkout feature/[agent-service]-implementation
git pull origin feature/[agent-service]-implementation

# Then start VSCode and assign agent
code .
```

#### **2. Agent Work Rules**:
```markdown
**AGENT MUST FOLLOW THESE RULES STRICTLY:**

1. ✅ **WORK ONLY** in your assigned service/module folder
2. ✅ **STAGE CHANGES** with `git add .` when ready
3. ✅ **CHECK STATUS** with `git status` regularly
4. ✅ **VIEW CHANGES** with `git diff` before staging
5. ❌ **NEVER COMMIT** - User will handle all commits
6. ❌ **NEVER PUSH** - User will handle all pushes
7. ❌ **NEVER SWITCH BRANCHES** - Stay on assigned branch
8. ❌ **NEVER TOUCH** other agents' folders
9. ❌ **NEVER MODIFY** shared folders without permission
10. ❌ **NEVER MERGE** or rebase anything
```

#### **3. Agent Completion Protocol**:
```markdown
**WHEN AGENT COMPLETES WORK:**

1. Run `git add .` to stage all changes
2. Run `git status` to verify staged files
3. Report completion to user with status output
4. **DO NOT COMMIT** - Wait for user to commit
5. Provide summary of what was implemented
6. List any dependencies or integration notes
```

---

## 🔄 **User Commit Strategy**

### **Daily Commit Routine**:
```bash
# User checks each location daily

# Location 1: Check agents 1-4
cd ~/hrms-agents-1-4
git status
git add .
git commit -m "feat: [agent-name] - [specific-feature] implementation"
git push origin feature/[service]-implementation

# Location 2: Check agents 5-8  
cd ~/hrms-agents-5-8
git status
git add .
git commit -m "feat: [agent-name] - [specific-feature] implementation"
git push origin feature/[service]-implementation

# Location 3: Check agents 9-13
cd ~/hrms-agents-9-13
git status  
git add .
git commit -m "feat: [agent-name] - [specific-feature] implementation"
git push origin feature/[module]-frontend

# Location 4: Check agents 14-17
cd ~/hrms-agents-14-17
git status
git add .
git commit -m "feat: [agent-name] - [specific-feature] implementation"  
git push origin feature/[module]-frontend
```

### **Commit Message Convention**:
```bash
# Backend Services
git commit -m "feat(auth): implement JWT authentication service"
git commit -m "feat(employee): add employee CRUD operations"
git commit -m "feat(attendance): implement check-in/out functionality"
git commit -m "feat(leave): add leave application workflow"
git commit -m "feat(payroll): implement salary calculation logic"
git commit -m "feat(performance): add performance review system"
git commit -m "feat(ai): implement resume parser with LLM"
git commit -m "feat(reports): add dashboard statistics API"

# Frontend Modules
git commit -m "feat(auth-ui): implement login form and auth state"
git commit -m "feat(dashboard-ui): add role-based dashboard layouts"
git commit -m "feat(employee-ui): implement employee management interface"
git commit -m "feat(attendance-ui): add check-in/out interface"
git commit -m "feat(leave-ui): implement leave application forms"
git commit -m "feat(payroll-ui): add payslip viewer component"
git commit -m "feat(performance-ui): implement review interface"
git commit -m "feat(ai-ui): add chatbot and AI features interface"
git commit -m "feat(reports-ui): implement report generation interface"

# Bug fixes
git commit -m "fix(auth): resolve token refresh issue"
git commit -m "fix(employee-ui): fix form validation errors"

# Tests
git commit -m "test(auth): add unit tests for authentication service"
git commit -m "test(employee-ui): add component tests for employee forms"

# Documentation
git commit -m "docs(api): update API documentation for leave service"
```

---

## 🔍 **Conflict Prevention Strategy**

### **File Ownership Matrix**:
```markdown
**STRICT FILE OWNERSHIP - NO OVERLAPS ALLOWED**

Backend Services (Agents 1-8):
- Agent 1: backend/services/auth-service/** (ONLY)
- Agent 2: backend/services/employee-service/** (ONLY)
- Agent 3: backend/services/attendance-service/** (ONLY)
- Agent 4: backend/services/leave-service/** (ONLY)
- Agent 5: backend/services/payroll-service/** (ONLY)
- Agent 6: backend/services/performance-service/** (ONLY)
- Agent 7: backend/services/ai-service/** (ONLY)
- Agent 8: backend/services/reports-service/** (ONLY)

Frontend Modules (Agents 9-17):
- Agent 9: frontend/src/modules/auth/** (ONLY)
- Agent 10: frontend/src/modules/dashboard/** (ONLY)
- Agent 11: frontend/src/modules/employees/** (ONLY)
- Agent 12: frontend/src/modules/attendance/** (ONLY)
- Agent 13: frontend/src/modules/leave/** (ONLY)
- Agent 14: frontend/src/modules/payroll/** (ONLY)
- Agent 15: frontend/src/modules/performance/** (ONLY)
- Agent 16: frontend/src/modules/ai-features/** (ONLY)
- Agent 17: frontend/src/modules/reports/** (ONLY)

FORBIDDEN AREAS FOR ALL AGENTS:
- backend/shared/** (User manages only)
- backend/config/** (User manages only)
- backend/app.js (User manages only)
- frontend/src/shared/** (User manages only)
- package.json files (User manages only)
- .env files (User manages only)
- README.md files (User manages only)
```

---

## 📊 **Progress Tracking System**

### **Agent Status Reporting**:
```markdown
**DAILY AGENT REPORT FORMAT:**

Agent: [Agent Number/Name]
Branch: feature/[service]-implementation
Status: [In Progress/Completed/Blocked]
Files Modified: [List of files]
Completion: [X]% 
Next Steps: [What's planned next]
Blockers: [Any issues]
Ready for Commit: [Yes/No]

**Example:**
Agent: Agent 1 (Auth Service)
Branch: feature/auth-service-implementation  
Status: Completed
Files Modified:
- backend/services/auth-service/controllers/AuthController.js
- backend/services/auth-service/services/AuthService.js
- backend/services/auth-service/models/User.js
- backend/services/auth-service/tests/auth.test.js
Completion: 100%
Next Steps: Ready for integration testing
Blockers: None
Ready for Commit: Yes
```

---

## 🚨 **Emergency Procedures**

### **Code Recovery Procedures**:
```bash
# If agent accidentally modifies wrong files
cd ~/hrms-agents-[group]
git status                    # Check what was modified
git checkout -- [filename]   # Restore specific file
git checkout -- .           # Restore all unstaged changes

# If agent is on wrong branch
git status                   # Check current branch
# DO NOT SWITCH - Report to user immediately

# If repository gets corrupted
# DO NOT ATTEMPT TO FIX - Report to user immediately
```

### **Backup Strategy**:
```bash
# User creates daily backups
cd ~/hrms-agents-1-4
cp -r . ~/backups/hrms-backup-$(date +%Y%m%d)-location1/

cd ~/hrms-agents-5-8
cp -r . ~/backups/hrms-backup-$(date +%Y%m%d)-location2/

cd ~/hrms-agents-9-13
cp -r . ~/backups/hrms-backup-$(date +%Y%m%d)-location3/

cd ~/hrms-agents-14-17
cp -r . ~/backups/hrms-backup-$(date +%Y%m%d)-location4/
```

---

## 🔧 **Integration Management**

### **Service Integration Protocol**:
```bash
# When backend service is complete (User only)
cd ~/hrms-agents-1-4
git checkout develop
git pull origin develop
git merge feature/auth-service-implementation
git push origin develop

# Update other locations
cd ~/hrms-agents-5-8
git checkout develop
git pull origin develop

cd ~/hrms-agents-9-13
git checkout develop
git pull origin develop

cd ~/hrms-agents-14-17
git checkout develop
git pull origin develop
```

### **Dependency Management**:
```markdown
**DEPENDENCY CHAIN:**

Phase 1 (Independent):
- Auth Service (Agent 1) → No dependencies
- Employee Service (Agent 2) → Depends on Auth Service
- Attendance Service (Agent 3) → Depends on Employee Service
- Leave Service (Agent 4) → Depends on Employee Service

Phase 2 (Dependent on Phase 1):
- Payroll Service (Agent 5) → Depends on Employee + Attendance
- Performance Service (Agent 6) → Depends on Employee Service
- AI Service (Agent 7) → Depends on all Phase 1 services
- Reports Service (Agent 8) → Depends on all services

Phase 3 (Frontend - Depends on Backend):
- All Frontend Agents (9-17) → Depend on corresponding backend services
```

---

## 📋 **Quality Control Checklist**

### **Pre-Commit Checklist (User)**:
```markdown
**BEFORE EACH COMMIT, USER MUST VERIFY:**

□ Agent worked only in assigned folder
□ No modifications to shared/config files
□ No package.json changes without approval
□ No .env file modifications
□ All tests pass (npm test)
□ Code follows project standards
□ No console.log statements left in code
□ No hardcoded values or secrets
□ Documentation updated if needed
□ Agent reported completion properly
```

### **Integration Checklist (User)**:
```markdown
**BEFORE MERGING TO DEVELOP:**

□ All unit tests pass
□ Integration tests pass
□ No merge conflicts
□ Code review completed
□ API documentation updated
□ Database migrations tested
□ Environment variables documented
□ Service runs independently
□ No breaking changes to existing APIs
□ Performance benchmarks met
```

---

## 🎯 **Agent Communication Protocol**

### **Mandatory Agent Instructions**:
```markdown
**EVERY AI AGENT MUST BE GIVEN THESE INSTRUCTIONS:**

"You are Agent [X] working on [Service/Module Name].

CRITICAL RULES:
1. Work ONLY in your assigned folder: [specific path]
2. NEVER commit code - only stage with 'git add .'
3. NEVER push code - user handles all pushes
4. NEVER switch branches - stay on your assigned branch
5. NEVER modify shared folders or config files
6. Report completion with 'git status' output
7. Ask for help if you need to modify anything outside your folder

Your assigned folder: [specific path]
Your branch: feature/[service]-implementation

When complete, run 'git add .' and 'git status', then report completion."
```

### **Status Reporting Template**:
```markdown
**AGENT COMPLETION REPORT:**

🤖 Agent: [Agent Number] - [Service/Module Name]
📁 Folder: [Assigned folder path]
🌿 Branch: [Branch name]
✅ Status: COMPLETED
📝 Files Modified: [List from git status]
🧪 Tests: [Pass/Fail status]
📚 Documentation: [Updated/Not needed]
🔗 Dependencies: [Any integration notes]
⚠️ Issues: [Any problems encountered]

Ready for user commit: YES/NO
```

---

## 🔒 **Security Considerations**

### **Environment Variables Protection**:
```bash
# .env files should NEVER be committed
# User must manage these manually

# backend/.env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/hrms_dev
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
OPENAI_API_KEY=your_openai_key_here

# Add to .gitignore (User only)
echo "*.env" >> .gitignore
echo "*.env.local" >> .gitignore
echo "*.env.production" >> .gitignore
```

### **Sensitive Data Guidelines**:
```markdown
**AGENTS MUST NEVER:**
- Hardcode API keys or secrets
- Commit .env files
- Include real database credentials
- Add personal information in code
- Include production URLs or endpoints

**AGENTS MUST ALWAYS:**
- Use environment variables for sensitive data
- Use placeholder values in examples
- Document required environment variables
- Follow security best practices
```

---

## 📞 **Emergency Contact Protocol**

### **When to Stop and Report**:
```markdown
**AGENTS MUST IMMEDIATELY STOP AND REPORT IF:**

1. Git commands fail or show errors
2. Asked to modify files outside assigned folder
3. Need to install new dependencies
4. Encounter merge conflicts
5. Need to modify shared configuration
6. Database schema changes required
7. API contract changes needed
8. Security-related modifications required
9. Performance issues detected
10. Integration with other services needed

**REPORT FORMAT:**
"🚨 URGENT: Agent [X] needs assistance
Issue: [Brief description]
Location: [File/folder path]
Error: [Exact error message if any]
Action needed: [What needs to be done]"
```

This comprehensive guide ensures **absolute code safety** and **perfect coordination** across all development locations with **zero risk of code loss or conflicts**.
