# 📊 AGENT 6 - PERFORMANCE MANAGEMENT SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 6
- **Service**: Performance Management Service
- **Workspace Folder**: `backend/services/performance-service/`
- **Git Branch**: `feature/performance-service-implementation`
- **Development Phase**: Phase 2 (Business Logic)
- **Priority**: MEDIUM (Business Service)
- **Dependencies**: Agent 2 (Employee Service) must be completed first

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
- ✅ **WORK ONLY** in: `backend/services/performance-service/`
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
2. `planning/Backend_Agent_Tasks.md` (Agent 6 section)
3. `planning/API_Integration_Guide.md`
4. `planning/01_Database_Schema_Design.md` (performance tables)

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
GET  /api/performance/reviews         # Get performance reviews
POST /api/performance/reviews         # Create performance review (Manager)
GET  /api/performance/reviews/:id     # Get specific review
PUT  /api/performance/reviews/:id     # Update review
GET  /api/performance/goals           # Get employee goals
POST /api/performance/goals           # Create goal
PUT  /api/performance/goals/:id       # Update goal progress
GET  /api/performance/feedback        # Get feedback
POST /api/performance/feedback        # Submit feedback
```

### **Required File Structure:**
```
backend/services/performance-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── ReviewController.js     # Performance review operations
│   ├── GoalController.js       # Goal management
│   └── FeedbackController.js   # Feedback management
├── services/
│   ├── PerformanceService.js   # Performance business logic
│   ├── ReviewService.js        # Review workflow
│   └── GoalService.js          # Goal tracking
├── models/
│   ├── PerformanceReview.js    # Performance review model
│   ├── EmployeeGoal.js         # Employee goal model
│   └── PerformanceFeedback.js  # Feedback model
├── middleware/
│   └── validation.js           # Input validation
└── tests/
    ├── performance.test.js     # Unit tests
    └── integration/
        └── performance.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. ReviewController.js - Core Methods:**
```javascript
class ReviewController {
  static async getReviews(req, res)       // Get performance reviews
  static async createReview(req, res)     // Create new review (Manager)
  static async getReviewById(req, res)    // Get specific review
  static async updateReview(req, res)     // Update review
  static async submitReview(req, res)     // Submit final review
  static async generateAIFeedback(req, res) // Generate AI feedback
}
```

#### **2. GoalController.js - Goal Management:**
```javascript
class GoalController {
  static async getGoals(req, res)         // Get employee goals
  static async createGoal(req, res)       // Create new goal
  static async updateGoal(req, res)       // Update goal
  static async updateProgress(req, res)   // Update goal progress
  static async deleteGoal(req, res)       // Delete goal
}
```

#### **3. PerformanceService.js - Business Logic:**
```javascript
class PerformanceService {
  static async createReview(data)                    // Create performance review
  static async canReviewEmployee(reviewerId, empId) // Check review authority
  static async calculateOverallRating(goals, feedback) // Calculate rating
  static async getPerformanceMetrics(employeeId)    // Get performance metrics
  static async generatePerformanceSummary(empId)    // Generate summary
}
```

#### **4. Goal Management System:**
```javascript
class GoalService {
  static async createGoal(goalData)           // Create employee goal
  static async updateGoalProgress(id, progress) // Update progress
  static async calculateGoalAchievement(goals) // Calculate achievement %
  static async getGoalsByEmployee(empId)     // Get employee goals
  static async getGoalsByPeriod(empId, period) // Get goals by period
}
```

#### **5. Performance Review Workflow:**
```javascript
// Review Process:
1. Manager initiates review for employee
2. Set review period and goals
3. Employee self-assessment (optional)
4. Manager evaluation and rating
5. AI-generated feedback integration
6. Final review submission
7. Employee acknowledgment
```

#### **6. Rating System:**
```javascript
// Performance Rating Scale (1-5):
1 = Below Expectations
2 = Partially Meets Expectations  
3 = Meets Expectations
4 = Exceeds Expectations
5 = Outstanding Performance

// Goal Achievement Scale (0-100%):
0-49% = Not Achieved
50-69% = Partially Achieved
70-89% = Mostly Achieved
90-100% = Fully Achieved
```

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('ReviewController', () => {
  test('create review with valid data')
  test('manager can review team members only')
  test('update review progress')
  test('submit final review')
  test('generate AI feedback integration')
})

describe('GoalController', () => {
  test('create goal with valid data')
  test('update goal progress')
  test('calculate goal achievement percentage')
  test('goal deadline tracking')
})

describe('PerformanceService', () => {
  test('overall rating calculation')
  test('performance metrics aggregation')
  test('review authority validation')
})
```

### **Integration Tests:**
```javascript
describe('Performance API Integration', () => {
  test('complete performance review cycle')
  test('goal creation and tracking workflow')
  test('feedback submission and retrieval')
  test('AI feedback generation integration')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Managers can only review their direct reports
- Employees can view their own reviews and goals
- Secure performance data access
- Audit trail for review changes
- Validate review authority
- Protect sensitive performance information

## 📋 **DATABASE INTEGRATION**
Use these tables from the database schema:
```sql
-- performance_reviews table
performance_reviews (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  reviewer_id UUID REFERENCES employees(id),
  review_period_start DATE,
  review_period_end DATE,
  overall_rating DECIMAL(3,2),
  goals_achievement_score DECIMAL(5,2),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_for_next_period TEXT,
  manager_comments TEXT,
  employee_comments TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  submitted_at TIMESTAMP,
  acknowledged_at TIMESTAMP
)

-- employee_goals table
employee_goals (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_date DATE,
  achievement_percentage DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES employees(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- performance_feedback table
performance_feedback (
  id UUID PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  feedback_from UUID REFERENCES employees(id),
  feedback_type VARCHAR(50),
  feedback_text TEXT,
  rating DECIMAL(3,2),
  feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 9 API endpoints implemented and working
- [ ] Performance review system functional
- [ ] Goal management system operational
- [ ] Feedback collection working
- [ ] Rating calculation accurate
- [ ] Review workflow complete
- [ ] Role-based access control implemented
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] AI feedback integration ready

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 6 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/performance-service/
🌿 **Branch**: feature/performance-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- Workflow Tests: [PASS/FAIL]

📚 **API Endpoints Implemented**:
- GET /api/performance/reviews: [✅/❌]
- POST /api/performance/reviews: [✅/❌]
- GET /api/performance/reviews/:id: [✅/❌]
- PUT /api/performance/reviews/:id: [✅/❌]
- GET /api/performance/goals: [✅/❌]
- POST /api/performance/goals: [✅/❌]
- PUT /api/performance/goals/:id: [✅/❌]
- GET /api/performance/feedback: [✅/❌]
- POST /api/performance/feedback: [✅/❌]

🔒 **Features Implemented**:
- Performance review system: [✅/❌]
- Goal management: [✅/❌]
- Feedback collection: [✅/❌]
- Rating calculations: [✅/❌]
- Review workflow: [✅/❌]

🔗 **Integration Notes**:
- Ready for AI feedback generation integration
- Performance data available for attrition prediction
- Review system ready for frontend interface

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- Complex performance calculation requirements
- Review workflow complications
- Role-based access implementation issues
- Integration with Employee Service problems
- AI feedback integration questions

**Report Format**: "🚨 URGENT: Agent 6 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, then create the service structure and implement the performance management system. Remember: **WORK ONLY in backend/services/performance-service/** and **NEVER commit code**.

This service provides critical data for AI attrition prediction! 🎯
