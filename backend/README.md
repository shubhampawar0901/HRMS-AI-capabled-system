# HRMS Backend Foundation

## 🚀 Overview
This is the backend foundation for the HRMS (Human Resource Management System) project, built with a modular service architecture to enable parallel development by multiple AI agents.

## 📁 Project Structure
```
backend/
├── app.js                 # Main application entry point
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── config/
│   └── database.js       # Database configuration
├── shared/
│   ├── middleware/       # Shared middleware (auth, error, validation)
│   ├── models/          # Database models (Sequelize)
│   └── utils/           # Shared utilities
└── services/
    ├── auth-service/     # Authentication & authorization
    ├── employee-service/ # Employee management
    ├── attendance-service/ # Attendance tracking
    ├── leave-service/    # Leave management
    ├── payroll-service/  # Payroll processing
    ├── performance-service/ # Performance management
    ├── ai-service/       # AI features (6 AI capabilities)
    └── reports-service/  # Reports & analytics
```

## 🛠 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# - Database credentials
# - JWT secrets
# - Gemini API key
# - Other service configurations
```

### 3. Database Setup
```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE hrms_db;

# The application will auto-sync tables in development mode
```

### 4. Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🔧 Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## 🌐 API Endpoints

### Health Check
- `GET /health` - Application health status

### Service Routes
- `POST /api/auth/*` - Authentication endpoints
- `GET /api/employees/*` - Employee management
- `GET /api/attendance/*` - Attendance tracking
- `GET /api/leave/*` - Leave management
- `GET /api/payroll/*` - Payroll processing
- `GET /api/performance/*` - Performance management
- `GET /api/ai/*` - AI features
- `GET /api/reports/*` - Reports & analytics

## 🔐 Authentication
All API endpoints (except auth) require JWT authentication:
```
Authorization: Bearer <your_jwt_token>
```

## 🏗 Development Guidelines

### For Service Agents
Each service agent should:
1. Work only in their assigned `services/[service-name]/` folder
2. Use shared middleware from `shared/middleware/`
3. Use shared models from `shared/models/`
4. Follow the established API response format
5. Implement proper error handling

### Folder Ownership Rules
- ✅ **Foundation Agent**: `app.js`, `shared/`, `config/`
- ✅ **Service Agents**: Only their assigned `services/[service-name]/` folder
- ❌ **Never modify**: Other agents' service folders

## 📊 Database Models
The foundation includes Sequelize models for:
- User management
- Employee data
- Attendance tracking
- Leave management
- Payroll processing
- Performance management
- AI features data

## 🔧 Shared Utilities
- **Error Handling**: Standardized error responses
- **Authentication**: JWT token validation
- **Validation**: Request validation middleware
- **Response Helper**: Consistent API responses

## 🚦 Service Status
- ✅ **Foundation**: Complete
- ⏳ **Auth Service**: Ready for implementation
- ⏳ **Employee Service**: Ready for implementation
- ⏳ **Attendance Service**: Ready for implementation
- ⏳ **Leave Service**: Ready for implementation
- ⏳ **Payroll Service**: Ready for implementation
- ⏳ **Performance Service**: Ready for implementation
- ⏳ **AI Service**: Ready for implementation
- ⏳ **Reports Service**: Ready for implementation

## 🔗 Integration
This backend is designed to work with the React frontend located in the `frontend/` directory.

## 📝 Notes
- All services are designed to be independent and can be developed in parallel
- Shared resources are centralized to avoid conflicts
- Database models are shared across all services
- Authentication is handled centrally with role-based access control
