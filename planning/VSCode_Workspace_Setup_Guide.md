# 💻 VSCode Workspace Setup Guide - Multi-Agent Development

## 📋 **Overview**

This guide provides detailed VSCode workspace configuration for each development location to ensure optimal development environment and prevent conflicts between agents.

---

## 🏗️ **Workspace Directory Structure**

### **Location 1: Foundation Services (Agents 1-4)**
```
~/hrms-agents-1-4/
├── .vscode/
│   ├── settings.json
│   ├── tasks.json
│   ├── launch.json
│   └── extensions.json
├── backend/
│   └── services/
│       ├── auth-service/          # Agent 1 workspace
│       ├── employee-service/      # Agent 2 workspace
│       ├── attendance-service/    # Agent 3 workspace
│       └── leave-service/         # Agent 4 workspace
├── planning/                      # Reference documentation
└── README-AGENTS-1-4.md          # Location-specific instructions
```

### **Location 2: Business Services (Agents 5-8)**
```
~/hrms-agents-5-8/
├── .vscode/
├── backend/
│   └── services/
│       ├── payroll-service/       # Agent 5 workspace
│       ├── performance-service/   # Agent 6 workspace
│       ├── ai-service/           # Agent 7 workspace
│       └── reports-service/      # Agent 8 workspace
├── planning/
└── README-AGENTS-5-8.md
```

### **Location 3: Frontend Core (Agents 9-13)**
```
~/hrms-agents-9-13/
├── .vscode/
├── frontend/
│   └── src/
│       └── modules/
│           ├── auth/             # Agent 9 workspace
│           ├── dashboard/        # Agent 10 workspace
│           ├── employees/        # Agent 11 workspace
│           ├── attendance/       # Agent 12 workspace
│           └── leave/           # Agent 13 workspace
├── planning/
└── README-AGENTS-9-13.md
```

### **Location 4: Frontend Advanced (Agents 14-17)**
```
~/hrms-agents-14-17/
├── .vscode/
├── frontend/
│   └── src/
│       └── modules/
│           ├── payroll/          # Agent 14 workspace
│           ├── performance/      # Agent 15 workspace
│           ├── ai-features/      # Agent 16 workspace
│           └── reports/         # Agent 17 workspace
├── planning/
└── README-AGENTS-14-17.md
```

---

## ⚙️ **VSCode Configuration Files**

### **1. Workspace Settings (.vscode/settings.json)**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "git.enableSmartCommit": false,
  "git.confirmSync": false,
  "git.autofetch": false,
  "git.showPushSuccessNotification": true,
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "terminal.integrated.defaultProfile.osx": "zsh",
  "terminal.integrated.defaultProfile.linux": "bash",
  "explorer.fileNesting.enabled": true,
  "explorer.fileNesting.patterns": {
    "*.js": "${capture}.js.map, ${capture}.min.js, ${capture}.d.ts",
    "*.jsx": "${capture}.js",
    "*.ts": "${capture}.js, ${capture}.d.ts.map, ${capture}.d.ts, ${capture}.js.map",
    "*.tsx": "${capture}.ts, ${capture}.js",
    "package.json": "package-lock.json, yarn.lock, pnpm-lock.yaml"
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/coverage": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/dist": true,
    "**/build": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

### **2. Tasks Configuration (.vscode/tasks.json)**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Install Backend Dependencies",
      "type": "shell",
      "command": "npm install",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Install Frontend Dependencies",
      "type": "shell",
      "command": "npm install",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "build"
    },
    {
      "label": "Start Backend Dev Server",
      "type": "shell",
      "command": "npm run dev",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "isBackground": true
    },
    {
      "label": "Start Frontend Dev Server",
      "type": "shell",
      "command": "npm start",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "build",
      "isBackground": true
    },
    {
      "label": "Run Backend Tests",
      "type": "shell",
      "command": "npm test",
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "test"
    },
    {
      "label": "Run Frontend Tests",
      "type": "shell",
      "command": "npm test",
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "group": "test"
    },
    {
      "label": "Git Status",
      "type": "shell",
      "command": "git status",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "shared"
      }
    },
    {
      "label": "Git Add All",
      "type": "shell",
      "command": "git add .",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": true,
        "panel": "shared"
      }
    }
  ]
}
```

### **3. Debug Configuration (.vscode/launch.json)**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/app.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "node",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Debug Frontend",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### **4. Recommended Extensions (.vscode/extensions.json)**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-jest",
    "humao.rest-client",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-markdown",
    "yzhang.markdown-all-in-one",
    "ms-vscode.vscode-git-graph",
    "eamodio.gitlens"
  ]
}
```

---

## 📋 **Location-Specific README Files**

### **README-AGENTS-1-4.md (Foundation Services)**
```markdown
# 🏗️ Foundation Services Development Location

## Assigned Agents:
- **Agent 1**: Authentication Service (`backend/services/auth-service/`)
- **Agent 2**: Employee Management Service (`backend/services/employee-service/`)
- **Agent 3**: Attendance Service (`backend/services/attendance-service/`)
- **Agent 4**: Leave Management Service (`backend/services/leave-service/`)

## Current Branch Status:
- Agent 1: `feature/auth-service-implementation`
- Agent 2: `feature/employee-service-implementation`
- Agent 3: `feature/attendance-service-implementation`
- Agent 4: `feature/leave-service-implementation`

## Critical Rules:
1. ❌ **NO COMMITS** - Only stage with `git add .`
2. ❌ **NO PUSHES** - User handles all pushes
3. ❌ **NO BRANCH SWITCHING** - Stay on assigned branch
4. ✅ **WORK ONLY** in your assigned service folder
5. ✅ **REPORT COMPLETION** with git status output

## Quick Commands:
```bash
# Check status
git status

# Stage changes
git add .

# View changes
git diff

# Check current branch
git branch
```

## Dependencies:
- Agent 2 depends on Agent 1 (Auth Service)
- Agent 3 depends on Agent 2 (Employee Service)
- Agent 4 depends on Agent 2 (Employee Service)
```

### **README-AGENTS-5-8.md (Business Services)**
```markdown
# 💼 Business Services Development Location

## Assigned Agents:
- **Agent 5**: Payroll Service (`backend/services/payroll-service/`)
- **Agent 6**: Performance Management Service (`backend/services/performance-service/`)
- **Agent 7**: AI Features Service (`backend/services/ai-service/`)
- **Agent 8**: Reports Service (`backend/services/reports-service/`)

## Prerequisites:
- Foundation Services (Agents 1-4) must be completed
- Database schema must be implemented
- Basic authentication must be working

## Dependencies:
- Agent 5 depends on Employee + Attendance services
- Agent 6 depends on Employee service
- Agent 7 depends on all Phase 1 services
- Agent 8 depends on all services for reporting
```

### **README-AGENTS-9-13.md (Frontend Core)**
```markdown
# 🎨 Frontend Core Development Location

## Assigned Agents:
- **Agent 9**: Authentication Module (`frontend/src/modules/auth/`)
- **Agent 10**: Dashboard Module (`frontend/src/modules/dashboard/`)
- **Agent 11**: Employee Management Module (`frontend/src/modules/employees/`)
- **Agent 12**: Attendance Module (`frontend/src/modules/attendance/`)
- **Agent 13**: Leave Management Module (`frontend/src/modules/leave/`)

## Prerequisites:
- Corresponding backend services must be completed
- API endpoints must be available and tested
- Shared components must be implemented

## Frontend Stack:
- React 18+ with functional components
- Redux Toolkit for state management
- ShadCN UI for components
- Tailwind CSS for styling
- React Router for navigation
```

### **README-AGENTS-14-17.md (Frontend Advanced)**
```markdown
# 🚀 Frontend Advanced Development Location

## Assigned Agents:
- **Agent 14**: Payroll Module (`frontend/src/modules/payroll/`)
- **Agent 15**: Performance Module (`frontend/src/modules/performance/`)
- **Agent 16**: AI Features Module (`frontend/src/modules/ai-features/`)
- **Agent 17**: Reports Module (`frontend/src/modules/reports/`)

## Prerequisites:
- All backend services completed
- Core frontend modules (Agents 9-13) completed
- AI service APIs available and tested
- Shared UI components available
```

This workspace setup ensures each agent has an optimal development environment with proper tooling and clear boundaries.
