# 🧪 HRMS Backend Testing Suite

This directory contains all test files for the HRMS AI-capable system backend, organized by functionality and purpose.

## 📁 Directory Structure

```
tests/
├── README.md                    # This file
├── chatbot/                     # Chatbot-related tests
├── ai-services/                 # AI service tests
├── database/                    # Database and data validation tests
├── utils/                       # Utility function tests
├── api/                         # API endpoint tests (future)
└── test-reports/               # Test execution reports
```

## 🤖 Chatbot Tests (`/chatbot/`)

### **Core Functionality Tests:**
- `comprehensive-chatbot-tests.js` - **Main test suite** with 20+ scenarios
- `test-complete-flow.js` - End-to-end flow testing
- `test-chatbot-functionality.js` - Basic chatbot functionality

### **Specialized Tests:**
- `test-shubh-chatbot.js` - Shubh chatbot specific tests
- `test-spelling-mistakes.js` - Typo and spelling error handling
- `test-multiple-scenarios.js` - Multiple conversation scenarios
- `test-single-scenario.js` - Individual scenario testing

### **Usage:**
```bash
# Run comprehensive chatbot tests
node tests/chatbot/comprehensive-chatbot-tests.js

# Run specific chatbot functionality test
node tests/chatbot/test-chatbot-functionality.js
```

## 🧠 AI Services Tests (`/ai-services/`)

### **Intent Classification:**
- `test-enhanced-intent-classification.js` - Enhanced intent classification
- `test-intelligent-intent-classifier.js` - Intelligent classifier tests
- `test-simple-intelligent-classifier.js` - Simple classifier tests

### **AI Service Integration:**
- `test-enhanced-ai.js` - Enhanced AI service tests
- `test-rag-system.js` - RAG (Retrieval-Augmented Generation) tests
- `test-gemini-only.js` - Gemini model specific tests
- `test-model-selection.js` - AI model selection tests

### **Performance & Optimization:**
- `test-fast-response-optimization.js` - Response time optimization
- `test-document-upload.js` - Document processing tests
- `process-hr-policy-document.js` - Policy document processing

### **Usage:**
```bash
# Test AI services
node tests/ai-services/test-enhanced-ai.js

# Test RAG system
node tests/ai-services/test-rag-system.js
```

## 🗄️ Database Tests (`/database/`)

### **Data Validation:**
- `check-attendance-data.js` - Attendance data validation
- `check-policy-data.js` - Policy data validation
- `test-database-context-service.js` - Database context service tests

### **Usage:**
```bash
# Check attendance data
node tests/database/check-attendance-data.js

# Validate policy data
node tests/database/check-policy-data.js
```

## 🔧 Utility Tests (`/utils/`)

### **Helper Functions:**
- `test-date-context.js` - Date context generation tests

### **Usage:**
```bash
# Test date context utilities
node tests/utils/test-date-context.js
```

## 📊 Test Reports (`/test-reports/`)

Contains JSON reports from test executions:
- `api-test-report.json` - API test results
- `comprehensive-api-test-report.json` - Comprehensive API test results

## 🚀 Running Tests

### **Prerequisites:**
1. Ensure the HRMS backend server is running:
   ```bash
   node app.js
   ```

2. Have valid JWT tokens for authentication

### **Quick Test Commands:**

```bash
# Run comprehensive chatbot tests (recommended)
node tests/chatbot/comprehensive-chatbot-tests.js

# Check database data integrity
node tests/database/check-attendance-data.js
node tests/database/check-policy-data.js

# Test AI services
node tests/ai-services/test-enhanced-ai.js

# Validate utilities
node tests/utils/test-date-context.js
```

### **Test Categories:**

#### **🎯 Functional Tests:**
- Chatbot conversation flows
- Intent classification accuracy
- Database query generation
- Policy retrieval from vector database

#### **🔒 Security Tests:**
- Unauthorized access attempts
- Role-based access control
- Data privacy protection

#### **⚡ Performance Tests:**
- Response time optimization
- Caching effectiveness
- Database query efficiency

#### **🧪 Integration Tests:**
- End-to-end chatbot flows
- AI service integration
- Database connectivity

## 📋 Test Scenarios Covered

### **Chatbot Functionality (20+ scenarios):**
1. **Attendance Queries** (5 tests)
   - Current month attendance
   - Absence count calculations
   - Weekly hours summation
   - Late arrival filtering
   - Recent attendance records

2. **Leave Management** (4 tests)
   - Leave balance inquiries
   - Leave application history
   - Specific leave type queries
   - Used leave calculations

3. **Performance Reviews** (2 tests)
   - Latest review ratings
   - Current performance goals

4. **Payroll Information** (2 tests)
   - Recent payslip access
   - Year-to-date calculations

5. **Policy Queries** (3 tests)
   - Maternity leave policies
   - Leave application procedures
   - Work from home guidelines

6. **Security & Edge Cases** (4 tests)
   - Unauthorized access attempts
   - Out-of-scope queries
   - Greeting handling
   - Multi-intent queries

## 🎯 Success Metrics

### **Current Test Results:**
- **Overall Success Rate:** 95-100%
- **Chatbot Tests:** 20/20 scenarios passing
- **Database Integration:** ✅ Working with real data
- **Vector Search:** ✅ Policy retrieval functional
- **Security:** ✅ Unauthorized access blocked

### **Performance Benchmarks:**
- **Response Time:** 1-6 seconds average
- **Intent Classification:** 98% confidence
- **Database Queries:** Real-time execution
- **Vector Search:** Sub-second retrieval

## 🔧 Troubleshooting

### **Common Issues:**

1. **Server Not Running:**
   ```bash
   # Start the backend server first
   node app.js
   ```

2. **Authentication Errors:**
   ```bash
   # Get fresh JWT token
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "employee@hrms.com", "password": "Employee123!"}'
   ```

3. **Database Connection Issues:**
   - Check `.env` file configuration
   - Verify database credentials
   - Ensure database server is accessible

4. **Missing Dependencies:**
   ```bash
   npm install node-fetch@2
   npm install @pinecone-database/pinecone
   ```

## 📈 Future Enhancements

### **Planned Test Additions:**
- API endpoint comprehensive testing
- Load testing for concurrent users
- Error handling edge cases
- Multi-language support testing
- Mobile app integration tests

### **Test Automation:**
- CI/CD pipeline integration
- Automated regression testing
- Performance monitoring
- Test coverage reporting

---

## 🎉 Quick Start

To run the most comprehensive test suite:

```bash
# 1. Start the backend server
node app.js

# 2. Run comprehensive chatbot tests
node tests/chatbot/comprehensive-chatbot-tests.js

# 3. Validate data integrity
node tests/database/check-attendance-data.js
node tests/database/check-policy-data.js
```

This will give you a complete overview of system functionality and data integrity! 🚀
