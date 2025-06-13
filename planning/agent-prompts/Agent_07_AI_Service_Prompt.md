# 🤖 AGENT 7 - AI FEATURES SERVICE DEVELOPMENT

## 📋 **YOUR ASSIGNMENT**
- **Agent ID**: Agent 7
- **Service**: AI Features Service
- **Workspace Folder**: `backend/services/ai-service/`
- **Git Branch**: `feature/ai-service-implementation`
- **Development Phase**: Phase 2 (Business Logic)
- **Priority**: HIGH (Critical AI Features)
- **Dependencies**: All Phase 1 services (Agents 1-4) must be completed first

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
- ✅ **WORK ONLY** in: `backend/services/ai-service/`
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
2. `planning/Backend_Agent_Tasks.md` (Agent 7 section)
3. `planning/AI_Features_Implementation_Logic.md` (CRITICAL - Complete AI specs)
4. `planning/API_Integration_Guide.md`

## 🎯 **YOUR SPECIFIC TASKS**

### **API Endpoints to Implement:**
```javascript
POST /api/ai/parse-resume           # Parse resume with LLM
GET  /api/ai/attrition-predictions  # Get attrition predictions
POST /api/ai/generate-feedback      # Generate AI feedback for reviews
GET  /api/ai/anomaly-detections     # Get anomaly detections
POST /api/ai/chatbot/query          # HR chatbot query
POST /api/ai/generate-report        # Generate smart reports
```

### **Required File Structure:**
```
backend/services/ai-service/
├── index.js                    # Service entry point
├── routes.js                   # Route definitions
├── controllers/
│   ├── ResumeParserController.js    # Resume parsing
│   ├── AttritionController.js       # Attrition prediction
│   ├── FeedbackController.js        # AI feedback generation
│   ├── AnomalyController.js         # Anomaly detection
│   ├── ChatbotController.js         # HR chatbot
│   └── ReportsController.js         # Smart reports
├── services/
│   ├── LLMService.js               # LLM integration
│   ├── ResumeParserService.js      # Resume processing
│   ├── AttritionService.js         # Attrition prediction
│   ├── AnomalyService.js           # Anomaly detection
│   ├── ChatbotService.js           # Chatbot logic
│   └── ReportsService.js           # Report generation
├── models/
│   ├── AttritionPrediction.js      # Attrition prediction model
│   ├── AnomalyDetection.js         # Anomaly detection model
│   ├── ChatbotConversation.js      # Chatbot conversation model
│   └── FeedbackGenerated.js        # Generated feedback model
├── utils/
│   ├── pdfParser.js                # PDF text extraction
│   └── vectorDatabase.js           # Vector DB for RAG
└── tests/
    ├── ai.test.js                  # Unit tests
    └── integration/
        └── ai.integration.test.js
```

### **Key Implementation Requirements:**

#### **1. LLMService.js - Core LLM Integration:**
```javascript
class LLMService {
  static async callLLM(prompt, options = {})     // Generic LLM call
  static async parseResumeWithLLM(pdfText)       // Resume parsing
  static async predictAttrition(employeeData)    // Attrition prediction
  static async generateFeedback(performanceData) // Feedback generation
  static async detectAnomalies(data)             // Anomaly detection
  static async processQuery(query, context)      // Chatbot query processing
  static async generateReport(data)              // Report generation
}
```

#### **2. ResumeParserService.js - Resume Processing:**
```javascript
class ResumeParserService {
  static async parseResume(fileBuffer)           // Main parsing function
  static async extractTextFromPDF(buffer)       // PDF text extraction
  static async structureResumeData(text)        // Structure extracted data
  static async validateParsedData(data)         // Validate parsed data
}
```

#### **3. AttritionService.js - Attrition Prediction:**
```javascript
class AttritionService {
  static async runAttritionAnalysis()            // Run analysis for all employees
  static async predictEmployeeAttrition(empId)  // Predict for specific employee
  static async gatherEmployeeData(empId)        // Gather data for prediction
  static async storePrediction(prediction)      // Store prediction results
}
```

#### **4. ChatbotService.js - HR Chatbot with RAG:**
```javascript
class ChatbotService {
  static async processQuery(employeeId, query)  // Process user query
  static async searchKnowledgeBase(query)       // Search policy documents
  static async getEmployeeContext(empId)        // Get employee context
  static async generateResponse(query, context) // Generate contextual response
  static async storeConversation(data)          // Store conversation
}
```

#### **5. AI Feature Implementations (Based on AI_Features_Implementation_Logic.md):**

**Resume Parser:**
- Extract text from PDF using pdf-parse
- Process with GPT-4 to structure data
- Return JSON with name, email, skills, experience
- No file storage - process and discard

**Attrition Predictor:**
- Auto-run when admin opens page
- Gather employee performance, attendance, leave data
- Use LLM to analyze risk factors
- Return risk score, level, and recommendations

**Smart Feedback Generator:**
- Triggered by manager during review
- Gather employee performance data
- Generate professional feedback using LLM
- Return structured feedback for manager to edit

**Anomaly Detection (Attendance Only):**
- Daily automated analysis
- Detect unusual attendance patterns
- Use LLM to categorize anomaly types
- Alert for excessive overtime, irregular hours

**HR Chatbot:**
- RAG system with policy documents
- Employee context-aware responses
- Quick action buttons
- Role-based access control

**Smart Reports:**
- Generate executive summaries
- Analyze team performance data
- Provide insights and recommendations
- Web display only (no PDF generation)

## 🧪 **TESTING REQUIREMENTS**

### **Unit Tests (>90% coverage):**
```javascript
describe('LLMService', () => {
  test('LLM API integration')
  test('prompt formatting')
  test('response parsing')
  test('error handling')
})

describe('ResumeParserService', () => {
  test('PDF text extraction')
  test('resume data structuring')
  test('data validation')
})

describe('AttritionService', () => {
  test('employee data gathering')
  test('risk score calculation')
  test('prediction storage')
})

describe('ChatbotService', () => {
  test('query processing')
  test('context retrieval')
  test('response generation')
})
```

### **Integration Tests:**
```javascript
describe('AI API Integration', () => {
  test('complete resume parsing flow')
  test('attrition prediction workflow')
  test('feedback generation process')
  test('chatbot conversation flow')
})
```

## 🔒 **SECURITY REQUIREMENTS**
- Secure LLM API key management
- Role-based access for AI features
- Data privacy for employee information
- Secure handling of sensitive data in prompts
- Audit trail for AI operations
- Rate limiting for LLM calls

## 📋 **LLM CONFIGURATION**
```javascript
// Use Gemini API (as per user preference)
const llmConfig = {
  model: "gemini-1.5-pro", // Better than gemini-pro
  temperature: 0.1,        // Low for consistency
  maxTokens: 1000,
  apiKey: process.env.GEMINI_API_KEY
}
```

## 🎯 **SUCCESS CRITERIA**
- [ ] All 6 AI API endpoints implemented and working
- [ ] Resume parser with LLM integration functional
- [ ] Attrition prediction system operational
- [ ] Smart feedback generation working
- [ ] Attendance anomaly detection functional
- [ ] HR chatbot with RAG system working
- [ ] Smart reports generation operational
- [ ] LLM integration secure and efficient
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing

## 📋 **COMPLETION PROTOCOL**

### **When You Complete Your Work:**
1. **Stage Changes**: Run `git add .`
2. **Check Status**: Run `git status`
3. **Report Completion** with this format:

```markdown
🤖 **AGENT 7 COMPLETION REPORT**

✅ **Status**: COMPLETED
📁 **Workspace**: backend/services/ai-service/
🌿 **Branch**: feature/ai-service-implementation
📝 **Files Modified**: 
[Paste output of 'git status']

🧪 **Tests**: 
- Unit Tests: [PASS/FAIL] - [X]% coverage
- Integration Tests: [PASS/FAIL]
- LLM Integration Tests: [PASS/FAIL]

📚 **AI Features Implemented**:
- Resume Parser: [✅/❌]
- Attrition Predictor: [✅/❌]
- Smart Feedback Generator: [✅/❌]
- Anomaly Detection: [✅/❌]
- HR Chatbot: [✅/❌]
- Smart Reports: [✅/❌]

🔒 **LLM Integration**:
- Gemini API integration: [✅/❌]
- Secure API key handling: [✅/❌]
- Rate limiting: [✅/❌]
- Error handling: [✅/❌]

🔗 **Integration Notes**:
- All AI features ready for frontend integration
- LLM service available for other services
- RAG system operational for chatbot

⚠️ **Issues Encountered**: [None/List any issues]

🚀 **Ready for User Commit**: [YES/NO]
```

## 🆘 **EMERGENCY PROTOCOL**
**STOP IMMEDIATELY and report if you encounter:**
- LLM API integration issues
- Complex AI logic requirements
- Performance issues with LLM calls
- Data privacy concerns
- Vector database setup problems

**Report Format**: "🚨 URGENT: Agent 7 needs assistance - [brief issue description]"

## 🚀 **START COMMAND**
Begin by reading the mandatory documentation, especially `AI_Features_Implementation_Logic.md`, then create the service structure and implement the AI features. Remember: **WORK ONLY in backend/services/ai-service/** and **NEVER commit code**.

This is the core AI service - critical for the project's AI capabilities! 🎯
