# HRMS Test Suite Organization

This directory contains all test-related files organized by category for better maintainability and clarity.

## 📁 Directory Structure

```
tests/
├── api/                    # API endpoint tests
├── database/              # Database-related tests and utilities
├── integration/           # Integration tests
├── unit/                  # Unit tests
└── utils/                 # Test utilities and helpers
```

## 🧪 Test Categories

### 📡 API Tests (`/api/`)
Tests for API endpoints, authentication, and external service integrations.

**Files:**
- `api-test-master.js` - Master API testing suite
- `debug-frontend-api-call.js` - Frontend API call debugging
- `debug-stats-queries.js` - Statistics API debugging
- `debug-frontend-auth.js` - Authentication debugging
- `final-curl-test.js` - cURL-based API tests
- `test-attrition-api.js` - Attrition prediction API tests

### 🗄️ Database Tests (`/database/`)
Database schema, data integrity, and database utility tests.

**Files:**
- `check-admin-users.js` - Admin user verification
- `create-anomaly-test-data.js` - Anomaly detection test data creation
- `fix-database-schema.js` - Database schema fixes
- `verify-data-status.js` - Data integrity verification

### 🔗 Integration Tests (`/integration/`)
End-to-end tests that verify complete workflows and system integration.

**Files:**
- `test-simplified-anomaly-integration.js` - Anomaly detection integration tests
- `test-anomaly-detection-comprehensive.js` - Comprehensive anomaly detection tests
- `test-anomaly-detection.js` - Basic anomaly detection tests
- `test-ai-anomaly-detection.js` - AI-powered anomaly detection tests
- `test-ai-service-directly.js` - Direct AI service tests
- `test-performance-api.js` - Performance management API tests
- `test-resume-parser.js` - Resume parser integration tests
- `test-resume-parser-fix.js` - Resume parser fixes
- `test-smart-reports-fix.js` - Smart reports integration tests
- `run-comprehensive-tests.js` - Master test runner

### 🧩 Unit Tests (`/unit/`)
Individual component and function tests.

**Files:**
- `simple-test.js` - Basic unit tests
- `test_month_filter.js` - Month filter functionality tests
- `test.js` - General unit tests
- `test-simple-anomaly.js` - Simple anomaly detection unit tests
- `test-simple.js` - Simple functionality tests

### 🛠️ Test Utils (`/utils/`)
Utilities, helpers, and test data management.

**Files:**
- `add-real-employee-names.js` - Employee name data utility

## 🚀 Running Tests

### Prerequisites
```bash
cd HRMS-AI-capabled-system
npm install
```

### Running Individual Test Categories

**API Tests:**
```bash
node tests/api/api-test-master.js
node tests/api/test-attrition-api.js
```

**Database Tests:**
```bash
node tests/database/check-admin-users.js
node tests/database/verify-data-status.js
```

**Integration Tests:**
```bash
node tests/integration/test-simplified-anomaly-integration.js
node tests/integration/run-comprehensive-tests.js
```

**Unit Tests:**
```bash
node tests/unit/simple-test.js
node tests/unit/test_month_filter.js
```

### Running All Tests
```bash
node tests/integration/run-comprehensive-tests.js
```

## 📋 Test Naming Convention

- **API Tests**: `test-[feature]-api.js` or `debug-[component].js`
- **Database Tests**: `check-[entity].js`, `create-[data-type].js`, `verify-[aspect].js`
- **Integration Tests**: `test-[feature]-integration.js` or `test-[feature]-comprehensive.js`
- **Unit Tests**: `test-[component].js` or `simple-test.js`
- **Utils**: `[action]-[entity].js`

## 🔧 Test Environment Setup

### Environment Variables
Ensure these are set in your `.env` file:
```
NODE_ENV=test
DB_HOST=your-test-db-host
DB_USER=your-test-db-user
DB_PASSWORD=your-test-db-password
DB_NAME=hrms_test_db
```

### Test Database
- Use a separate test database to avoid affecting production data
- Run database migrations before testing
- Clean up test data after test runs

## 📊 Test Coverage Areas

### ✅ Covered Areas
- Authentication & Authorization
- Employee Management
- Attendance Tracking
- Anomaly Detection
- Performance Management
- Resume Parser
- Smart Reports
- Database Operations

### 🔄 Areas for Expansion
- Leave Management
- Payroll Processing
- Department Management
- Role-based Access Control
- File Upload/Download
- Email Notifications

## 🐛 Debugging Tests

### Common Issues
1. **Database Connection**: Check environment variables
2. **Authentication**: Verify admin credentials
3. **API Endpoints**: Ensure backend server is running
4. **Test Data**: Run data creation scripts first

### Debug Commands
```bash
# Check database connection
node tests/database/check-admin-users.js

# Verify API endpoints
node tests/api/debug-frontend-api-call.js

# Test authentication
node tests/api/debug-frontend-auth.js
```

## 📝 Adding New Tests

1. **Choose appropriate category** (api/database/integration/unit/utils)
2. **Follow naming convention**
3. **Include proper error handling**
4. **Add documentation**
5. **Update this README**

## 🎯 Best Practices

- **Isolation**: Each test should be independent
- **Cleanup**: Clean up test data after each test
- **Assertions**: Use clear, descriptive assertions
- **Documentation**: Comment complex test logic
- **Environment**: Use test-specific configurations
- **Data**: Use realistic but safe test data

---

**Last Updated**: June 2025  
**Maintained By**: HRMS Development Team
