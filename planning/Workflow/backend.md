# AI Agent Backend Development Rulebook 🛠️

## 📌 Purpose

These rules guide **multiple AI assistants** working **independently and in parallel** on a **Node.js** backend application using **JavaScript**, organized in a **modular microservices structure** without an ORM. Each AI agent can work on separate services without conflicts. Follow these exactly during backend development tasks.

## 🚀 Multi-Agent Development Philosophy

* **Independent Services:** Each service is completely self-contained
* **Parallel Development:** Multiple AI agents can work simultaneously
* **No Cross-Dependencies:** Services communicate via well-defined APIs
* **Isolated Testing:** Each service has its own test suite
* **Modular Deployment:** Services can be developed and tested independently

## 1. Project Context Reminder

* **Runtime:** Node.js (LTS)
* **Language:** JavaScript (ES2021+)
* **Architecture:** Modular Microservices with MVC pattern per service
* **No ORM:** Use raw SQL or query builder within shared `utils/db.js`
* **Multi-Agent Folder Structure:**

  ```
  backend/
  ├── app.js                          # Main application entry point
  ├── config/                         # Shared configuration
  │   ├── database.js                 # Database connection
  │   ├── jwt.js                      # JWT configuration
  │   └── environment.js              # Environment variables
  ├── shared/                         # Shared utilities (DO NOT MODIFY)
  │   ├── middleware/                 # Common middleware
  │   │   ├── auth.js                 # Authentication middleware
  │   │   ├── rbac.js                 # Role-based access control
  │   │   ├── validation.js           # Request validation
  │   │   └── errorHandler.js         # Global error handling
  │   ├── models/                     # Shared database models
  │   │   └── BaseModel.js            # Base model with common methods
  │   └── utils/                      # Shared utilities
  │       ├── response.js             # Standardized API responses
  │       ├── logger.js               # Logging utility
  │       └── constants.js            # Application constants
  ├── services/                       # INDEPENDENT SERVICES (Agent-specific)
  │   ├── auth-service/               # 🔐 Authentication Service
  │   ├── employee-service/           # 👥 Employee Management Service
  │   ├── attendance-service/         # ⏰ Attendance Service
  │   ├── leave-service/              # 🏖️ Leave Management Service
  │   ├── payroll-service/            # 💰 Payroll Service
  │   ├── performance-service/        # 📊 Performance Service
  │   ├── ai-service/                 # 🤖 AI Features Service
  │   └── reports-service/            # 📈 Reports Service
  └── tests/                          # Global test configuration
      ├── unit/
      ├── integration/
      └── fixtures/
  ```

## 2. Multi-Agent Development Workflow

### 🎯 **Agent Assignment Process**
1. **Service Selection:** Each AI agent is assigned to ONE specific service
2. **Service Context:** "I am building the [SERVICE-NAME] service independently"
3. **Isolation Check:** Verify no dependencies on other services being developed
4. **Plan in Pseudocode:** Outline service-specific logic, database access, and API endpoints
5. **Confirm Plan:** Await user approval before coding
6. **Independent Implementation:** Build service following modular structure
7. **Service Testing:** Test service in isolation using service-specific test suite
8. **Integration Ready:** Service is ready for integration with main app

### 🔧 **Service Independence Rules**
* **NO direct imports** from other services (except shared utilities)
* **NO shared state** between services
* **API-only communication** between services
* **Independent database models** per service
* **Separate test suites** per service

## 3. Service-Specific Folder Structure

### 📁 **Each Service Structure (Agent-Specific Workspace)**
```
services/[service-name]/
├── index.js                    # Service entry point & exports
├── routes.js                   # Route definitions for this service
├── controllers/
│   ├── [entity]Controller.js   # Business logic controllers
│   └── index.js                # Controller exports
├── models/
│   ├── [Entity].js             # Service-specific database models
│   └── index.js                # Model exports
├── middleware/
│   ├── validation.js           # Service-specific validations
│   └── [service]Middleware.js  # Service-specific middleware
├── services/
│   └── [service]Service.js     # Core business logic
├── utils/
│   └── [service]Utils.js       # Service-specific utilities
└── tests/
    ├── controllers/            # Controller tests
    ├── models/                 # Model tests
    ├── services/               # Service logic tests
    └── integration/            # Service integration tests
```

### 🚫 **What Agents Should NOT Touch**
* **shared/** folder (common utilities - managed centrally)
* **config/** folder (shared configuration - managed centrally)  
* **app.js** (main entry point - managed centrally)
* **Other services** (each agent works on assigned service only)

### ✅ **Available Services for Agent Assignment**
* **auth-service** - Authentication, JWT, user management
* **employee-service** - Employee profiles, onboarding, management
* **attendance-service** - Time tracking, check-in/out, shifts
* **leave-service** - Leave applications, approvals, balances
* **payroll-service** - Salary processing, payslips, calculations
* **performance-service** - Reviews, goals, feedback
* **ai-service** - AI features (chatbot, predictions, analytics)
* **reports-service** - Reporting, analytics, dashboards

## 4. Service Development Standards

### 🏗️ **Service Entry Point (index.js)**
```javascript
// services/[service-name]/index.js
const routes = require('./routes');
const controllers = require('./controllers');
const models = require('./models');
const services = require('./services');

module.exports = {
  routes,
  controllers,
  models,
  services,
  name: '[service-name]',
  version: '1.0.0'
};
```

### 🛣️ **Service Routes (routes.js)**
```javascript
// services/[service-name]/routes.js
const express = require('express');
const { [Entity]Controller } = require('./controllers');
const { validate[Entity] } = require('./middleware/validation');
const { authenticateToken } = require('../../shared/middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Service-specific routes
router.get('/', [Entity]Controller.getAll);
router.get('/:id', [Entity]Controller.getById);
router.post('/', validate[Entity], [Entity]Controller.create);
router.put('/:id', validate[Entity], [Entity]Controller.update);
router.delete('/:id', [Entity]Controller.delete);

module.exports = router;
```

### 🎮 **Service Controller Pattern**
```javascript
// services/[service-name]/controllers/[Entity]Controller.js
const { [Entity]Service } = require('../services/[Entity]Service');
const { successResponse, errorResponse } = require('../../../shared/utils/response');

class [Entity]Controller {
  static async getAll(req, res) {
    try {
      const data = await [Entity]Service.getAll(req.query);
      return successResponse(res, data, 'Records retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async getById(req, res) {
    try {
      const data = await [Entity]Service.getById(req.params.id);
      if (!data) {
        return errorResponse(res, 'Record not found', 404);
      }
      return successResponse(res, data, 'Record retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  static async create(req, res) {
    try {
      const data = await [Entity]Service.create(req.body);
      return successResponse(res, data, 'Record created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async update(req, res) {
    try {
      const data = await [Entity]Service.update(req.params.id, req.body);
      return successResponse(res, data, 'Record updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  static async delete(req, res) {
    try {
      await [Entity]Service.delete(req.params.id);
      return successResponse(res, null, 'Record deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = [Entity]Controller;
```

## 5. Coding Standards & Naming

* **Use modern JavaScript:** `const`/`let`, arrow functions, async/await
* **Function Names:** Use `doAction` or `handleRequest` prefixes for clarity
* **Variable Names:** Descriptive, avoid abbreviations
* **Early Returns:** Validate inputs and return errors early
* **Service Naming:** Use PascalCase for classes, camelCase for methods
* **File Naming:** Use camelCase for files, PascalCase for classes

## 6. Database Access (No ORM)

* **Raw Queries:** Use parameterized queries to prevent SQL injection
* **Query Helpers:** In service `models/`, export functions that accept parameters and return Promise of results
* **Connection Pooling:** Use shared `config/database.js` connection pool
* **Error Handling:** Catch and wrap database errors with meaningful messages
* **Transactions:** Use database transactions for multi-table operations

## 7. Inter-Service Communication

### 🔗 **Service-to-Service API Calls**
```javascript
// Example: Employee service calling Auth service
const axios = require('axios');

class EmployeeService {
  static async validateUser(userId) {
    try {
      const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/api/auth/validate/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error('User validation failed');
    }
  }
}
```

### 📡 **Event-Based Communication (Optional)**
```javascript
// Using EventEmitter for loose coupling
const EventEmitter = require('events');
const serviceEvents = new EventEmitter();

// In Employee Service
serviceEvents.emit('employee.created', { employeeId, userId });

// In Payroll Service
serviceEvents.on('employee.created', (data) => {
  PayrollService.createEmployeePayrollRecord(data);
});
```

## 8. Testing Strategy

### 🧪 **Service-Level Testing**
```javascript
// services/[service-name]/tests/controllers/[Entity]Controller.test.js
const request = require('supertest');
const app = require('../../../../app');

describe('[Entity] Controller', () => {
  describe('GET /api/[service]', () => {
    it('should return all records', async () => {
      const response = await request(app)
        .get('/api/[service]')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
```

### 🔧 **Service Isolation Testing**
```bash
# Test individual service
cd services/auth-service
npm test

# Test service integration
npm run test:integration

# Test all services
npm run test:all
```

## 9. Error Handling & Security

* **Global Try/Catch:** Wrap async route handlers to forward errors to error middleware
* **Input Sanitization:** Clean and validate all inputs using service-specific validation
* **Prevent Injection:** Use parameterized queries for SQL; avoid `eval`
* **Hide Internal Errors:** Do not expose stack traces in production responses
* **Environment Variables:** Load via `dotenv`; never commit secrets
* **Rate Limiting:** Apply service-specific rate limiting
* **CORS:** Configure CORS for service endpoints

## 10. Performance & Scalability

* **Connection Pooling:** Reuse DB connections via shared pool
* **Avoid Blocking Code:** Do not use sync file or crypto operations in request handlers
* **Caching:** Implement service-specific caching strategies
* **Pagination & Limits:** Enforce limits on list endpoints
* **Async Processing:** Use queues for heavy operations

## 11. Documentation & Comments

* **JSDoc Comments:** For all public functions and classes
* **Service README:** Each service should have its own README.md
* **API Documentation:** Maintain service-specific API docs
* **Service Dependencies:** Document any external service dependencies

## 12. What to Avoid

* **Cross-Service Direct Imports:** Never import from other services directly
* **Shared State:** Avoid global variables or shared state between services
* **Mixing Business Logic:** Keep controllers thin, move logic to services
* **Unhandled Promise Rejections:** Always handle async errors
* **Writing SQL in Controllers:** Use service layer for database operations
* **Committing Secrets:** Never commit environment files or secrets

## 13. Multi-Agent Development Commands

### 🚀 **Development Workflow**
```bash
# Agent 1 works on auth-service
cd services/auth-service
npm test
npm run dev:auth

# Agent 2 works on employee-service
cd services/employee-service
npm test
npm run dev:employee

# Agent 3 works on ai-service
cd services/ai-service
npm test
npm run dev:ai

# No conflicts between agents
```

### 📊 **Service Health Checks**
```bash
# Check service health
curl http://localhost:3000/health

# Check specific service
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/employees/health
```

---

## 🎯 **Agent Assignment Guidelines**

When an AI agent is assigned to a service:

1. **Read this rulebook completely**
2. **Focus only on assigned service folder**
3. **Use shared utilities but don't modify them**
4. **Follow the service structure exactly**
5. **Test service in isolation**
6. **Document service-specific features**
7. **Communicate with other agents via API contracts only**

**Remember: Each service is a mini-application that can be developed independently!**

---

## 🔄 **Service Integration Process**

### **Phase 1: Independent Development**
- Each agent develops their assigned service in isolation
- Service follows the defined folder structure
- All tests pass for the individual service
- Service documentation is complete

### **Phase 2: API Contract Definition**
- Define clear API contracts between services
- Document request/response formats
- Specify authentication requirements
- Define error handling standards

### **Phase 3: Integration Testing**
- Test service-to-service communication
- Verify API contracts work as expected
- Test authentication and authorization flows
- Validate error handling across services

### **Phase 4: System Integration**
- Integrate all services into main app.js
- Configure routing and middleware
- Test complete system functionality
- Deploy and monitor services

---

## 📋 **Service Development Checklist**

Before marking a service as complete, ensure:

- [ ] Service follows the defined folder structure
- [ ] All routes are properly defined and tested
- [ ] Controllers handle errors appropriately
- [ ] Models use parameterized queries
- [ ] Service-specific validation is implemented
- [ ] Unit tests cover all major functionality
- [ ] Integration tests verify API endpoints
- [ ] Documentation is complete and up-to-date
- [ ] Service can run independently
- [ ] No direct dependencies on other services
- [ ] API contracts are well-defined
- [ ] Security measures are implemented
- [ ] Performance considerations are addressed

**This structure ensures that multiple AI agents can work on different services simultaneously without conflicts, enabling efficient parallel development of the HRMS backend system.**
