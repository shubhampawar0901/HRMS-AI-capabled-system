# 🔮 Attrition Predictor Frontend Implementation Plan

## 📋 Document Overview

This document provides a comprehensive implementation plan for the Attrition Predictor feature in the HRMS system. The feature will be accessible through an expandable AI Features section in the sidebar navigation.

---

## 🎯 UI Navigation Structure

### **Sidebar Navigation Enhancement**
The current sidebar has a single "AI Features" button. We need to modify it to be expandable:

**Current Structure:**
```
├── Dashboard
├── Employees (Admin only)
├── Attendance
├── Leave
├── Payroll
├── Performance
├── Smart Reports (Admin/Manager)
├── AI Chatbot (Employee only)
└── AI Features (All roles) ← MODIFY THIS
```

**New Structure:**
```
└── AI Features (All roles) ← EXPANDABLE
    ├── 🤖 AI Chatbot (Employee only)
    ├── 📊 Smart Reports (Admin/Manager)
    ├── 🔮 Attrition Predictor (Admin only) ← NEW
    ├── 📄 Resume Parser (Admin/Manager)
    └── 🔍 Anomaly Detection (Admin/Manager)
```

### **Navigation Implementation Details**
- **Expand Icon**: Use `ChevronDown` / `ChevronUp` from Lucide React
- **Expand Behavior**: Click to toggle sub-menu visibility
- **Active State**: Highlight both parent and active child
- **Role-Based Access**: Show only relevant sub-items based on user role
- **Mobile Responsive**: Collapsible behavior maintained on mobile

---

## 🎨 Frontend UI Specifications

### **Page Layout: `/admin/attrition-predictor`**

#### **1. Header Section**
```jsx
<div className="mb-6">
  <h1 className="text-3xl font-bold text-foreground">Attrition Predictor</h1>
  <p className="text-muted-foreground mt-2">
    AI-powered employee attrition risk analysis and predictions
  </p>
</div>
```

#### **2. Summary Cards Row**
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-red-600 text-sm font-medium">Critical Risk</p>
        <p className="text-3xl font-bold text-red-700">{criticalCount}</p>
      </div>
      <AlertTriangle className="h-8 w-8 text-red-500" />
    </div>
  </Card>
  
  <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-orange-600 text-sm font-medium">High Risk</p>
        <p className="text-3xl font-bold text-orange-700">{highCount}</p>
      </div>
      <TrendingUp className="h-8 w-8 text-orange-500" />
    </div>
  </Card>
  
  <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-yellow-600 text-sm font-medium">Medium Risk</p>
        <p className="text-3xl font-bold text-yellow-700">{mediumCount}</p>
      </div>
      <Users className="h-8 w-8 text-yellow-500" />
    </div>
  </Card>
  
  <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-green-600 text-sm font-medium">Low Risk</p>
        <p className="text-3xl font-bold text-green-700">{lowCount}</p>
      </div>
      <Shield className="h-8 w-8 text-green-500" />
    </div>
  </Card>
</div>
```

#### **3. Controls Section**
```jsx
<div className="flex flex-col sm:flex-row gap-4 mb-6">
  <div className="flex-1">
    <Select value={riskThreshold} onValueChange={setRiskThreshold}>
      <SelectTrigger>
        <SelectValue placeholder="Risk Threshold" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0.3">Low Risk (0.3+)</SelectItem>
        <SelectItem value="0.5">Medium Risk (0.5+)</SelectItem>
        <SelectItem value="0.7">High Risk (0.7+)</SelectItem>
        <SelectItem value="0.9">Critical Risk (0.9+)</SelectItem>
      </SelectContent>
    </Select>
  </div>
  
  <div className="flex-1">
    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Filter by Department" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Departments</SelectItem>
        {departments.map(dept => (
          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  
  <Button onClick={generatePredictions} disabled={loading}>
    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
    Generate Predictions
  </Button>
  
  <Button variant="outline" onClick={exportReport}>
    <Download className="h-4 w-4 mr-2" />
    Export Report
  </Button>
</div>
```

#### **4. Predictions Table**
```jsx
<Card className="mb-8">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Users className="h-5 w-5" />
      Employee Attrition Risk Analysis
    </CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Risk Score</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Key Factors</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {predictions.map((prediction) => (
          <TableRow key={prediction.employeeId}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{prediction.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{prediction.employeeName}</p>
                  <p className="text-sm text-muted-foreground">ID: {prediction.employeeId}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{prediction.department}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress value={prediction.riskScore * 100} className="w-16" />
                <span className="text-sm font-medium">{(prediction.riskScore * 100).toFixed(1)}%</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getRiskVariant(prediction.riskLevel)}>
                {prediction.riskLevel.toUpperCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {prediction.factors.slice(0, 2).map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {factor.replace('_', ' ')}
                  </Badge>
                ))}
                {prediction.factors.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{prediction.factors.length - 2} more
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => viewDetails(prediction)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => generateReport(prediction)}>
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

#### **5. Employee Detail Modal**
```jsx
<Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <User className="h-5 w-5" />
        Attrition Risk Analysis: {selectedEmployee?.name}
      </DialogTitle>
    </DialogHeader>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Risk Score</span>
              <div className="flex items-center gap-2">
                <Progress value={selectedEmployee?.riskScore * 100} className="w-24" />
                <span className="font-bold">{(selectedEmployee?.riskScore * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Risk Level</span>
              <Badge variant={getRiskVariant(selectedEmployee?.riskLevel)}>
                {selectedEmployee?.riskLevel?.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Prediction Date</span>
              <span>{formatDate(selectedEmployee?.predictionDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Contributing Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contributing Factors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedEmployee?.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{formatFactor(factor)}</span>
                <Badge variant="outline" className="text-xs">
                  {getFactorImpact(factor)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedEmployee?.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{formatRecommendation(rec)}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {getRecommendationDescription(rec)}
                </p>
                <Button size="sm" variant="outline">
                  Take Action
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DialogContent>
</Dialog>
```

---

## 🔐 Role-Based Access Control

### **Admin Role (Full Access)**
- **Permissions**: Complete access to all attrition predictor functionality
- **Features Available**:
  - View all employee attrition predictions
  - Generate predictions for any employee
  - Access detailed risk analysis
  - Export comprehensive reports
  - Modify risk thresholds
  - View historical prediction data
  - Access AI recommendations and action items

### **Manager Role (Limited Access)**
- **Permissions**: Access restricted to team members only
- **Features Available**:
  - View attrition predictions for direct reports only
  - Generate predictions for team members
  - Access basic risk analysis for team
  - Export team-specific reports
  - View recommendations for team members
- **Restrictions**:
  - Cannot view organization-wide data
  - Cannot access other managers' team data
  - Limited historical data access

### **Employee Role (No Access)**
- **Permissions**: No access to attrition predictor
- **Reason**: Sensitive HR data that could impact employee morale
- **Alternative**: Employees can access general AI features like chatbot

---

## 🔧 Technical Implementation Details

### **Component Structure**
```
src/
├── components/
│   └── attrition/
│       ├── AttritionDashboard.jsx          # Main dashboard component
│       ├── AttritionSummaryCards.jsx       # Risk summary cards
│       ├── AttritionTable.jsx              # Predictions table
│       ├── AttritionDetailModal.jsx        # Employee detail modal
│       ├── AttritionFilters.jsx            # Filter controls
│       └── AttritionExport.jsx             # Export functionality
├── pages/
│   └── attrition/
│       └── AttritionPredictorPage.jsx      # Main page wrapper
├── hooks/
│   ├── useAttritionPredictions.js          # Data fetching hook
│   └── useAttritionFilters.js              # Filter state management
└── services/
    └── attritionService.js                 # API service layer
```

### **Enhanced State Management Strategy**

#### **Server State Management (React Query)**
```javascript
// Primary predictions query with enhanced caching
const {
  data: rawPredictions,
  isLoading,
  error,
  refetch,
  isFetching
} = useQuery({
  queryKey: ['attrition-predictions', filters],
  queryFn: () => attritionService.getPredictions(filters),
  staleTime: 5 * 60 * 1000,  // 5 minutes - data considered fresh
  cacheTime: 10 * 60 * 1000, // 10 minutes - cache retention
  refetchOnWindowFocus: false, // Prevent unnecessary refetches
  retry: 3, // Retry failed requests
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

  // Transform data immediately after fetch
  select: (data) => transformPredictionData(data),

  // Enable background updates
  refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
});

// Derived state for summary cards
const summaryData = useMemo(() => {
  if (!rawPredictions) return { critical: 0, high: 0, medium: 0, low: 0 };

  return rawPredictions.reduce((acc, prediction) => {
    acc[prediction.riskLevel] = (acc[prediction.riskLevel] || 0) + 1;
    return acc;
  }, { critical: 0, high: 0, medium: 0, low: 0 });
}, [rawPredictions]);

// Individual prediction generation mutation
const generatePredictionMutation = useMutation({
  mutationFn: attritionService.generatePrediction,
  onSuccess: (data) => {
    // Optimistically update the cache
    queryClient.setQueryData(['attrition-predictions', filters], (oldData) => {
      if (!oldData) return oldData;
      return [...oldData, transformSinglePrediction(data.data.prediction)];
    });

    toast.success('Prediction generated successfully');
  },
  onError: (error) => {
    toast.error(error.response?.data?.message || 'Failed to generate prediction');
  }
});
```

#### **Local UI State Management**
```javascript
// Modal and interaction states
const [selectedEmployee, setSelectedEmployee] = useState(null);
const [showDetailModal, setShowDetailModal] = useState(false);
const [selectedRows, setSelectedRows] = useState(new Set());
const [expandedRows, setExpandedRows] = useState(new Set());

// Filter state with URL synchronization
const [filters, setFilters] = useSearchParams({
  riskThreshold: '0.7',
  sortBy: 'riskScore',
  sortOrder: 'desc',
  page: '1',
  limit: '10'
});

// Computed filter object
const filterObject = useMemo(() => ({
  riskThreshold: parseFloat(filters.get('riskThreshold')) || 0.7,
  sortBy: filters.get('sortBy') || 'riskScore',
  sortOrder: filters.get('sortOrder') || 'desc',
  page: parseInt(filters.get('page')) || 1,
  limit: parseInt(filters.get('limit')) || 10
}), [filters]);

// Filter update handler with URL sync
const updateFilters = useCallback((newFilters) => {
  setFilters(prev => {
    const updated = new URLSearchParams(prev);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        updated.delete(key);
      } else {
        updated.set(key, value.toString());
      }
    });
    return updated;
  });
}, [setFilters]);
```

#### **Data Processing and Caching Strategy**
```javascript
// Memoized data processing for performance
const processedPredictions = useMemo(() => {
  if (!rawPredictions) return [];

  let processed = [...rawPredictions];

  // Apply client-side sorting (backup for server-side sorting)
  processed.sort((a, b) => {
    const aValue = a[filterObject.sortBy];
    const bValue = b[filterObject.sortBy];

    if (filterObject.sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });

  // Apply client-side pagination (if server doesn't handle it)
  const startIndex = (filterObject.page - 1) * filterObject.limit;
  const endIndex = startIndex + filterObject.limit;

  return processed.slice(startIndex, endIndex);
}, [rawPredictions, filterObject]);

// Cache employee details for modal
const employeeDetailsCache = useRef(new Map());

const getEmployeeDetails = useCallback(async (employeeId) => {
  if (employeeDetailsCache.current.has(employeeId)) {
    return employeeDetailsCache.current.get(employeeId);
  }

  try {
    const details = await employeeService.getById(employeeId);
    employeeDetailsCache.current.set(employeeId, details);
    return details;
  } catch (error) {
    console.error('Failed to fetch employee details:', error);
    return null;
  }
}, []);
```

### **API Integration Points**

#### **1. Get Attrition Predictions**
```javascript
// Endpoint: GET /api/ai/attrition-predictions
// Authorization: Bearer <token> (Admin/Manager only)
// Query Parameters: ?riskThreshold=0.7

// REQUEST STRUCTURE
const getPredictions = async (filters = {}) => {
  const params = new URLSearchParams();

  // Available Query Parameters:
  if (filters.riskThreshold) {
    params.append('riskThreshold', filters.riskThreshold); // 0.0-1.0 range
  }
  // Note: departmentId filtering handled by backend based on user role

  const response = await axiosInstance.get(
    `${API_ENDPOINTS.AI.ATTRITION_PREDICTIONS}?${params.toString()}`
  );
  return response.data;
};

// EXPECTED RESPONSE STRUCTURE (Verified from backend)
{
  "success": true,
  "message": "Attrition predictions retrieved successfully",
  "data": {
    "predictions": [
      {
        "employeeId": 123,
        "employeeName": "John Doe",           // ✅ Available for UI display
        "riskScore": 0.85,                    // ✅ Float 0.0-1.0 for progress bars
        "riskLevel": "high",                  // ✅ String: low|medium|high|critical
        "factors": [                          // ✅ Array of contributing factors
          "low_satisfaction",
          "high_workload"
        ],
        "recommendations": [                  // ✅ Array of AI recommendations
          "workload_adjustment",
          "career_development"
        ]
        // ❌ MISSING: department, position, predictionDate, modelVersion
      }
    ]
  }
}

// DATA UTILIZATION IN UI:
// - employeeName → Table display, modal header
// - riskScore → Progress bars (multiply by 100 for percentage)
// - riskLevel → Badge colors and summary card counts
// - factors → Factor chips/badges in table and detailed modal
// - recommendations → Action items in modal
```

#### **2. Generate Individual Prediction**
```javascript
// Endpoint: POST /api/ai/attrition-predictions
// Authorization: Bearer <token> (Admin/Manager only)

// REQUEST STRUCTURE
const generatePrediction = async (employeeId) => {
  const requestBody = {
    employeeId: employeeId  // ✅ Required integer
  };

  const response = await axiosInstance.post(
    API_ENDPOINTS.AI.ATTRITION_PREDICTIONS,
    requestBody
  );
  return response.data;
};

// EXPECTED RESPONSE STRUCTURE (Verified from backend)
{
  "success": true,
  "message": "Attrition prediction generated successfully",
  "data": {
    "prediction": {
      "employeeId": 123,
      "riskScore": 0.75,                     // ✅ Float 0.0-1.0
      "riskLevel": "medium",                 // ✅ String: low|medium|high|critical
      "factors": ["workload", "satisfaction"], // ✅ Array of factors
      "recommendations": ["training", "mentoring"] // ✅ Array of recommendations
      // ❌ MISSING: employeeName, department, predictionDate
    }
  }
}

// DATA UTILIZATION IN UI:
// - Immediately update predictions table with new data
// - Show success toast with generated prediction
// - Refresh summary cards with updated counts
// - Optionally open detail modal for the new prediction
```

#### **3. Missing API Endpoints (Need Backend Enhancement)**
```javascript
// ❌ MISSING: Get Employee Details for Prediction Context
// Endpoint: GET /api/employees/:id (exists but need department info)
// Need: department name, position, hire date for better UI context

// ❌ MISSING: Export Attrition Report
// Endpoint: GET /api/ai/attrition-predictions/export
// Query Parameters: ?format=pdf&riskThreshold=0.7
// Response: File download or base64 data

// ❌ MISSING: Historical Predictions
// Endpoint: GET /api/ai/attrition-predictions/history/:employeeId
// Response: Array of past predictions for trend analysis

// ❌ MISSING: Bulk Prediction Generation
// Endpoint: POST /api/ai/attrition-predictions/bulk
// Request Body: { employeeIds: [123, 456, 789] }
// Response: Array of generated predictions
```

### **Enhanced Data Flow Analysis**

#### **Request Data Transformation**
```javascript
// Frontend Filter State → API Query Parameters
const transformFiltersToQuery = (filters) => {
  const queryParams = {};

  // Risk threshold (0.0-1.0 range)
  if (filters.riskThreshold && filters.riskThreshold !== 'all') {
    queryParams.riskThreshold = parseFloat(filters.riskThreshold);
  }

  // Department filtering (handled by backend role-based logic)
  // Admin: sees all departments
  // Manager: sees only their team (automatic backend filtering)

  // Sorting and pagination (if needed)
  if (filters.sortBy) queryParams.sortBy = filters.sortBy;
  if (filters.sortOrder) queryParams.sortOrder = filters.sortOrder;

  return queryParams;
};
```

#### **Response Data Transformation**
```javascript
// API Response → UI Display Format
const transformPredictionData = (apiResponse) => {
  if (!apiResponse.success || !apiResponse.data?.predictions) {
    throw new Error(apiResponse.message || 'Invalid response format');
  }

  return apiResponse.data.predictions.map(prediction => ({
    // Core data from API
    employeeId: prediction.employeeId,
    employeeName: prediction.employeeName,
    riskScore: prediction.riskScore,
    riskLevel: prediction.riskLevel,
    factors: prediction.factors || [],
    recommendations: prediction.recommendations || [],

    // Computed fields for UI
    riskPercentage: Math.round(prediction.riskScore * 100),
    riskColor: getRiskColor(prediction.riskLevel),
    riskVariant: getRiskVariant(prediction.riskLevel),
    factorCount: prediction.factors?.length || 0,
    recommendationCount: prediction.recommendations?.length || 0,

    // Missing fields (need backend enhancement)
    department: 'N/A', // TODO: Get from employee API
    position: 'N/A',   // TODO: Get from employee API
    predictionDate: new Date().toISOString(), // TODO: Get from API

    // UI state
    isExpanded: false,
    isSelected: false
  }));
};

// Risk level to UI variant mapping
const getRiskVariant = (riskLevel) => {
  const variants = {
    low: 'success',
    medium: 'warning',
    high: 'destructive',
    critical: 'destructive'
  };
  return variants[riskLevel] || 'secondary';
};

// Risk level to color mapping
const getRiskColor = (riskLevel) => {
  const colors = {
    low: '#10b981',     // green-500
    medium: '#f59e0b',  // amber-500
    high: '#ef4444',    // red-500
    critical: '#dc2626' // red-600
  };
  return colors[riskLevel] || '#6b7280';
};
```

### **Data Flow Diagram**
```
User Interaction → Component State → Custom Hook → Service Layer → API Call
       ↓               ↓               ↓              ↓            ↓
   Filter Change → Update Filters → useQuery Trigger → HTTP Request → Backend
       ↓               ↓               ↓              ↓            ↓
   Loading State → Show Skeleton → Cache Management → Process Data → AI Analysis
       ↑               ↑               ↑              ↑            ↑
   Update UI ← Transform Data ← React Query ← API Response ← Database Result

// Specific Flow for Summary Cards:
API Response → Transform Data → Calculate Counts → Update Card States → Animate Changes
     ↓              ↓               ↓                ↓                ↓
Raw Predictions → Group by Risk → Count per Level → Card Components → Number Animation

// Specific Flow for Table:
API Response → Transform Data → Apply Sorting → Pagination → Table Rows → Interactive Elements
     ↓              ↓              ↓             ↓            ↓             ↓
Raw Predictions → UI Format → Sort by Risk → Page Split → Row Components → Click Handlers
```

### **Error Handling**
```javascript
// Service layer error handling
const handleApiError = (error) => {
  if (error.response?.status === 403) {
    toast.error('Access denied. Admin privileges required.');
    navigate('/dashboard');
  } else if (error.response?.status === 404) {
    toast.error('Employee not found.');
  } else if (error.response?.status >= 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.error(error.response?.data?.message || 'An error occurred.');
  }
};

// Component error boundaries
<ErrorBoundary fallback={<AttritionErrorFallback />}>
  <AttritionDashboard />
</ErrorBoundary>
```

### **Loading States**
```javascript
// Skeleton loading for table
{isLoading ? (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-8 w-[100px]" />
        <Skeleton className="h-8 w-[80px]" />
      </div>
    ))}
  </div>
) : (
  <AttritionTable predictions={predictions} />
)}
```

---

## 📊 Data Visualization Requirements

### **Risk Score Visualization**
- **Progress Bars**: Show risk scores as percentage bars with color coding
- **Color Scheme**:
  - 🟢 Green (0-30%): Low Risk
  - 🟡 Yellow (31-60%): Medium Risk  
  - 🟠 Orange (61-80%): High Risk
  - 🔴 Red (81-100%): Critical Risk

### **Charts and Graphs**
- **Risk Distribution Chart**: Pie chart showing distribution across risk levels
- **Department Risk Comparison**: Bar chart comparing average risk by department
- **Trend Analysis**: Line chart showing risk trends over time
- **Factor Impact Analysis**: Horizontal bar chart showing factor contributions

### **Interactive Elements**
- **Hover Effects**: Show detailed tooltips on chart elements
- **Click Actions**: Navigate to detailed views from chart elements
- **Zoom/Pan**: Allow interaction with time-series charts
- **Export Options**: Save charts as PNG/PDF

---

## 🎨 UI/UX Enhancements

### **Smooth Animations**
```css
/* Smooth transitions for all interactive elements */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Card hover effects */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

/* Button hover animations */
.button-hover:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### **Gradient Backgrounds**
```css
/* Subtle gradient backgrounds for cards */
.gradient-red {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
}

.gradient-yellow {
  background: linear-gradient(135deg, #fefce8 0%, #fde047 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
}
```

### **Three.js Integration**
```javascript
// 3D visualization for risk analysis
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';

const RiskVisualization3D = ({ predictions }) => {
  return (
    <Canvas className="h-64 w-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RiskSpheres predictions={predictions} />
    </Canvas>
  );
};

const RiskSpheres = ({ predictions }) => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
  });
  
  return (
    <group ref={meshRef}>
      {predictions.map((pred, index) => (
        <mesh
          key={pred.employeeId}
          position={[
            (index % 5) * 2 - 4,
            Math.floor(index / 5) * 2 - 2,
            0
          ]}
        >
          <sphereGeometry args={[pred.riskScore, 32, 32]} />
          <meshStandardMaterial 
            color={getRiskColor(pred.riskLevel)}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};
```

---

## 🎨 Enhanced AI Features UI Theme

### **Design Philosophy**
- **Base Theme**: Follow existing HRMS design system
- **AI Enhancement**: Elevated visual experience with premium feel
- **Color Palette**: Cool blues, purples, and teals with subtle gradients
- **Shadows**: Multi-layered shadows for depth and modern look
- **Animations**: Smooth, fluid transitions with easing curves

### **AI-Specific Color Scheme**
```css
:root {
  /* AI Feature Colors */
  --ai-primary: #3b82f6;      /* Blue 500 */
  --ai-secondary: #8b5cf6;    /* Purple 500 */
  --ai-accent: #06b6d4;       /* Cyan 500 */
  --ai-gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --ai-gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --ai-gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --ai-shadow-soft: 0 4px 20px rgba(59, 130, 246, 0.15);
  --ai-shadow-hover: 0 8px 30px rgba(59, 130, 246, 0.25);
  --ai-shadow-active: 0 2px 10px rgba(59, 130, 246, 0.3);
}
```

### **Mobile Responsiveness Strategy**
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Layout**: Stack cards vertically on mobile, grid on desktop
- **Navigation**: Collapsible sidebar with touch-friendly targets
- **Tables**: Horizontal scroll with sticky columns on mobile
- **Modals**: Full-screen on mobile, centered on desktop

---

## 📋 Detailed Implementation Tasks

### **TASK 1: Enhanced Sidebar Navigation**
**Status**: ⏳ Pending Verification
**Estimated Time**: 2-3 hours
**Files to Modify**: `frontend/src/components/layout/Sidebar.jsx`

#### **Subtasks:**
1. **Add expandable state management**
   - Add `useState` for AI Features expansion
   - Implement toggle functionality
   - Persist expansion state in localStorage

2. **Create AI Features sub-menu structure**
   - Define AI sub-navigation items with roles
   - Add icons and descriptions for each item
   - Implement role-based filtering

3. **Add smooth animations**
   - CSS transitions for expand/collapse
   - Hover effects with cool color gradients
   - Mobile-responsive touch targets

4. **Enhanced styling for AI section**
   - Special styling for AI Features parent item
   - Gradient backgrounds for AI sub-items
   - Subtle glow effects and shadows

#### **Acceptance Criteria:**
- [ ] AI Features button shows expand/collapse icon
- [ ] Clicking toggles sub-menu with smooth animation
- [ ] Sub-items show only for authorized roles
- [ ] Mobile responsive with proper touch targets
- [ ] Enhanced visual styling for AI section
- [ ] State persists across page refreshes

---

### **TASK 2: Attrition Service Layer**
**Status**: ⏳ Pending Verification
**Estimated Time**: 1-2 hours
**Files to Create**: `frontend/src/services/attritionService.js`

#### **Subtasks:**
1. **Create comprehensive API service methods**
   - `getPredictions(filters)` - GET with query params and role-based filtering
   - `generatePrediction(employeeId)` - POST individual prediction with validation
   - `generateBulkPredictions(employeeIds)` - POST bulk prediction (if backend supports)
   - `exportReport(filters, format)` - GET export functionality (PDF/Excel)
   - `getEmployeeContext(employeeId)` - GET additional employee data for context

2. **Implement robust error handling**
   - Axios interceptors for authentication errors (401/403)
   - Role-based error messages with user-friendly text
   - Network error handling with retry logic
   - Rate limiting error handling (429)
   - Validation error parsing and display

3. **Add comprehensive request/response transformations**
   - Request data validation and sanitization
   - Response data normalization and type conversion
   - Date formatting (ISO strings to display format)
   - Number formatting (risk scores to percentages)
   - Factor/recommendation text transformation (snake_case to readable)
   - Pagination metadata handling
   - Cache key generation for React Query

4. **Add performance optimizations**
   - Request deduplication for concurrent calls
   - Response caching with appropriate TTL
   - Request cancellation for component unmount
   - Optimistic updates for mutations
   - Background refetching strategies

#### **Acceptance Criteria:**
- [ ] All API methods implemented with proper TypeScript interfaces
- [ ] Comprehensive error handling with role-specific messages
- [ ] Data transformation handles all edge cases and missing fields
- [ ] Request validation prevents invalid API calls
- [ ] Response caching optimizes performance
- [ ] Retry logic handles network failures gracefully
- [ ] Optimistic updates provide smooth UX
- [ ] All API responses match documented backend structure

---

### **TASK 3: Custom Hooks for Data Management**
**Status**: ⏳ Pending Verification
**Estimated Time**: 2 hours
**Files to Create**:
- `frontend/src/hooks/useAttritionPredictions.js`
- `frontend/src/hooks/useAttritionFilters.js`

#### **Subtasks:**
1. **Create useAttritionPredictions hook**
   - React Query integration
   - Loading, error, and success states
   - Automatic refetching and caching
   - Optimistic updates

2. **Create useAttritionFilters hook**
   - Filter state management
   - URL synchronization
   - Debounced search
   - Filter validation

3. **Add performance optimizations**
   - Memoization for expensive calculations
   - Virtual scrolling for large datasets
   - Lazy loading for modal content

#### **Acceptance Criteria:**
- [ ] Hooks provide clean API for components
- [ ] Proper loading and error states
- [ ] Filters sync with URL parameters
- [ ] Performance optimized for large datasets

---

### **TASK 4: Enhanced Summary Cards Component**
**Status**: ⏳ Pending Verification
**Estimated Time**: 3 hours
**Files to Create**: `frontend/src/components/attrition/AttritionSummaryCards.jsx`

#### **Subtasks:**
1. **Create responsive card grid**
   - CSS Grid with responsive breakpoints
   - Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns
   - Equal height cards with flexbox

2. **Add premium visual effects**
   - Gradient backgrounds for each risk level
   - Subtle animations on data changes
   - Hover effects with shadow elevation
   - Icon animations and micro-interactions

3. **Implement data visualization**
   - Progress rings for risk percentages
   - Trend indicators (up/down arrows)
   - Animated counters for numbers
   - Sparkline charts for trends

4. **Add accessibility features**
   - ARIA labels and descriptions
   - Keyboard navigation support
   - Screen reader friendly content
   - High contrast mode support

#### **Acceptance Criteria:**
- [ ] Cards responsive across all screen sizes
- [ ] Smooth animations and hover effects
- [ ] Data updates with animated transitions
- [ ] Fully accessible with ARIA labels
- [ ] Premium visual design with gradients and shadows

---

### **TASK 5: Advanced Data Table Component**
**Status**: ⏳ Pending Verification
**Estimated Time**: 4-5 hours
**Files to Create**: `frontend/src/components/attrition/AttritionTable.jsx`

#### **Subtasks:**
1. **Create responsive table structure**
   - Desktop: Full table layout
   - Mobile: Card-based layout with stacked information
   - Horizontal scroll with sticky columns
   - Virtual scrolling for performance

2. **Add advanced table features**
   - Sortable columns with indicators
   - Multi-column filtering
   - Row selection with bulk actions
   - Pagination with page size options

3. **Implement rich data visualization**
   - Progress bars for risk scores
   - Color-coded badges for risk levels
   - Avatar components for employees
   - Expandable rows for additional details

4. **Add interactive features**
   - Click to view employee details
   - Hover tooltips for truncated content
   - Quick action buttons
   - Keyboard navigation support

#### **Acceptance Criteria:**
- [ ] Table fully responsive with mobile card layout
- [ ] All sorting and filtering features working
- [ ] Rich data visualization elements
- [ ] Smooth interactions and animations
- [ ] Performance optimized for large datasets

---

### **TASK 6: Employee Detail Modal**
**Status**: ⏳ Pending Verification
**Estimated Time**: 3-4 hours
**Files to Create**: `frontend/src/components/attrition/AttritionDetailModal.jsx`

#### **Subtasks:**
1. **Create responsive modal layout**
   - Full-screen on mobile
   - Centered with max-width on desktop
   - Scrollable content area
   - Proper focus management

2. **Design comprehensive detail view**
   - Employee profile section
   - Risk analysis with charts
   - Contributing factors breakdown
   - AI recommendations with actions

3. **Add data visualizations**
   - Risk score gauge/meter
   - Factor impact chart
   - Historical trend line
   - Comparison with team average

4. **Implement action features**
   - Generate detailed report
   - Schedule follow-up actions
   - Export individual analysis
   - Share with managers

#### **Acceptance Criteria:**
- [ ] Modal responsive and accessible
- [ ] Comprehensive employee risk analysis
- [ ] Interactive data visualizations
- [ ] Action buttons functional
- [ ] Smooth animations and transitions

---

### **TASK 7: Main Page Integration**
**Status**: ⏳ Pending Verification
**Estimated Time**: 2-3 hours
**Files to Create**: `frontend/src/pages/attrition/AttritionPredictorPage.jsx`

#### **Subtasks:**
1. **Create page layout structure**
   - Header with title and description
   - Filter controls section
   - Summary cards row
   - Data table section
   - Loading and error states

2. **Implement state management**
   - Connect all components with hooks
   - Handle loading and error states
   - Manage modal state
   - Implement real-time updates

3. **Add page-level features**
   - Export functionality
   - Refresh data button
   - Help/documentation links
   - Breadcrumb navigation

4. **Optimize performance**
   - Code splitting for large components
   - Lazy loading for heavy features
   - Memoization for expensive operations
   - Error boundaries for stability

#### **Acceptance Criteria:**
- [ ] All components integrated smoothly
- [ ] Proper state management throughout
- [ ] Page-level features working
- [ ] Performance optimized
- [ ] Error handling comprehensive

---

### **TASK 8: Route Integration & Testing**
**Status**: ⏳ Pending Verification
**Estimated Time**: 1-2 hours
**Files to Modify**:
- `frontend/src/routes/AppRoutes.jsx`
- Add route protection and testing

#### **Subtasks:**
1. **Add route configuration**
   - Add attrition predictor route
   - Implement role-based route protection
   - Add route metadata and titles

2. **Test complete user flow**
   - Navigation from sidebar
   - Page loading and data fetching
   - All interactive features
   - Mobile responsiveness

3. **Add error boundaries**
   - Page-level error handling
   - Graceful degradation
   - User-friendly error messages

#### **Acceptance Criteria:**
- [ ] Route properly configured and protected
- [ ] Complete user flow working
- [ ] Error boundaries in place
- [ ] Mobile experience tested

---

## 🚀 Implementation Process

### **Workflow:**
1. **Task Assignment**: I'll implement one task at a time
2. **Code Creation**: Write complete, production-ready code
3. **Verification Request**: Present code for your review
4. **Feedback Integration**: Make requested changes
5. **Task Completion**: Move to next task after approval

### **Quality Standards:**
- ✅ Mobile-first responsive design
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Performance optimized
- ✅ Error handling comprehensive
- ✅ Code documentation included
- ✅ TypeScript support (if applicable)

### **Review Process:**
After each task, I will:
1. Show you the implemented code
2. Demonstrate key features
3. Highlight mobile responsiveness
4. Wait for your verification before proceeding

---

---

## 🔍 **API Request/Response Analysis & Enhancements**

### **Current API Limitations Identified**

#### **1. Missing Employee Context Data**
**Issue**: API response lacks essential employee information for rich UI display
```javascript
// Current Response (Limited)
{
  "employeeId": 123,
  "employeeName": "John Doe",  // ✅ Available
  "riskScore": 0.85,
  "riskLevel": "high",
  "factors": ["low_satisfaction"],
  "recommendations": ["workload_adjustment"]
}

// Required for Enhanced UI (Missing)
{
  "employeeId": 123,
  "employeeName": "John Doe",
  "department": "Information Technology",     // ❌ Missing - needed for filtering/grouping
  "position": "Senior Developer",            // ❌ Missing - needed for context
  "hireDate": "2024-01-15",                 // ❌ Missing - needed for tenure calculation
  "managerId": 2,                           // ❌ Missing - needed for manager view filtering
  "avatar": "/avatars/john-doe.jpg",        // ❌ Missing - needed for UI enhancement
  "predictionDate": "2024-12-19T10:30:00Z", // ❌ Missing - needed for freshness indicator
  "modelVersion": "1.0",                    // ❌ Missing - needed for confidence display
  "confidence": 0.92                        // ❌ Missing - needed for reliability indicator
}
```

**Solution**: Either enhance the attrition API response or make additional employee API calls

#### **2. Insufficient Filtering Capabilities**
**Issue**: Limited query parameters for advanced filtering
```javascript
// Current Query Parameters (Limited)
GET /api/ai/attrition-predictions?riskThreshold=0.7

// Required Query Parameters (Enhanced)
GET /api/ai/attrition-predictions?
  riskThreshold=0.7&
  departmentId=2&
  riskLevel=high&
  sortBy=riskScore&
  sortOrder=desc&
  page=1&
  limit=20&
  dateFrom=2024-01-01&
  dateTo=2024-12-31&
  includeFactors=true&
  includeRecommendations=true
```

#### **3. Missing Bulk Operations**
**Issue**: No bulk prediction generation or bulk actions
```javascript
// Required Bulk Operations (Missing)
POST /api/ai/attrition-predictions/bulk
{
  "employeeIds": [123, 456, 789],
  "options": {
    "forceRegenerate": false,
    "includeFactors": true
  }
}

POST /api/ai/attrition-predictions/actions/bulk
{
  "predictionIds": [1, 2, 3],
  "action": "mark_reviewed",
  "notes": "Reviewed in team meeting"
}
```

### **Data Utilization Strategy**

#### **Summary Cards Data Flow**
```javascript
// API Response → Summary Calculation → Card Display
const calculateSummaryData = (predictions) => {
  const summary = predictions.reduce((acc, pred) => {
    // Count by risk level
    acc.counts[pred.riskLevel] = (acc.counts[pred.riskLevel] || 0) + 1;

    // Calculate average risk score
    acc.totalRisk += pred.riskScore;

    // Track highest risk employee
    if (pred.riskScore > acc.highestRisk.score) {
      acc.highestRisk = {
        score: pred.riskScore,
        employee: pred.employeeName
      };
    }

    return acc;
  }, {
    counts: { critical: 0, high: 0, medium: 0, low: 0 },
    totalRisk: 0,
    highestRisk: { score: 0, employee: null }
  });

  summary.averageRisk = summary.totalRisk / predictions.length;
  return summary;
};

// Usage in Summary Cards Component
const summaryData = useMemo(() =>
  calculateSummaryData(predictions || []),
  [predictions]
);
```

#### **Table Data Processing**
```javascript
// API Response → Table Row Data → Interactive Elements
const processTableData = (predictions, filters) => {
  return predictions.map(prediction => ({
    // Core display data
    id: prediction.employeeId,
    employee: {
      id: prediction.employeeId,
      name: prediction.employeeName,
      avatar: `/api/employees/${prediction.employeeId}/avatar`, // Constructed URL
      department: prediction.department || 'Unknown', // Fallback for missing data
      position: prediction.position || 'N/A'
    },

    // Risk visualization data
    risk: {
      score: prediction.riskScore,
      percentage: Math.round(prediction.riskScore * 100),
      level: prediction.riskLevel,
      color: getRiskColor(prediction.riskLevel),
      variant: getRiskVariant(prediction.riskLevel)
    },

    // Factor display data
    factors: prediction.factors.map(factor => ({
      key: factor,
      label: formatFactorLabel(factor), // Convert snake_case to readable
      severity: getFactorSeverity(factor),
      icon: getFactorIcon(factor)
    })),

    // Action data
    actions: {
      canView: true,
      canEdit: hasPermission('edit_predictions'),
      canExport: hasPermission('export_reports'),
      canAssignActions: hasPermission('assign_actions')
    },

    // UI state
    isSelected: false,
    isExpanded: false,
    lastUpdated: prediction.predictionDate || new Date().toISOString()
  }));
};
```

#### **Modal Detail Data Enhancement**
```javascript
// Combine multiple API responses for comprehensive modal view
const getEmployeeDetailData = async (employeeId) => {
  try {
    // Parallel API calls for complete employee context
    const [
      predictionData,
      employeeDetails,
      attendanceHistory,
      performanceHistory
    ] = await Promise.all([
      attritionService.getPrediction(employeeId),
      employeeService.getById(employeeId),
      attendanceService.getHistory(employeeId, { months: 6 }),
      performanceService.getHistory(employeeId, { reviews: 3 })
    ]);

    // Combine data for rich modal display
    return {
      // Prediction data
      prediction: predictionData.data.prediction,

      // Employee context
      employee: {
        ...employeeDetails.data.employee,
        tenure: calculateTenure(employeeDetails.data.employee.hireDate),
        department: employeeDetails.data.employee.department_name
      },

      // Supporting analytics
      analytics: {
        attendanceTrend: calculateAttendanceTrend(attendanceHistory.data.attendance),
        performanceTrend: calculatePerformanceTrend(performanceHistory.data.reviews),
        riskFactorAnalysis: analyzeRiskFactors(predictionData.data.prediction.factors)
      },

      // Action recommendations
      recommendations: predictionData.data.prediction.recommendations.map(rec => ({
        key: rec,
        title: formatRecommendationTitle(rec),
        description: getRecommendationDescription(rec),
        priority: getRecommendationPriority(rec),
        estimatedImpact: getRecommendationImpact(rec),
        actionItems: getRecommendationActions(rec)
      }))
    };
  } catch (error) {
    console.error('Failed to fetch employee detail data:', error);
    throw error;
  }
};
```

### **Performance Optimization Strategy**

#### **Request Optimization**
```javascript
// Implement request deduplication and caching
const createOptimizedAttritionService = () => {
  const requestCache = new Map();
  const pendingRequests = new Map();

  const getCachedOrFetch = async (cacheKey, fetchFn, ttl = 300000) => {
    // Check cache first
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    // Check for pending request
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Create new request
    const request = fetchFn().then(data => {
      requestCache.set(cacheKey, { data, timestamp: Date.now() });
      pendingRequests.delete(cacheKey);
      return data;
    }).catch(error => {
      pendingRequests.delete(cacheKey);
      throw error;
    });

    pendingRequests.set(cacheKey, request);
    return request;
  };

  return {
    getPredictions: (filters) => {
      const cacheKey = `predictions-${JSON.stringify(filters)}`;
      return getCachedOrFetch(cacheKey, () =>
        axiosInstance.get('/api/ai/attrition-predictions', { params: filters })
      );
    }
  };
};
```

#### **Response Processing Optimization**
```javascript
// Use Web Workers for heavy data processing
const processLargeDataset = (predictions) => {
  return new Promise((resolve) => {
    const worker = new Worker('/workers/prediction-processor.js');

    worker.postMessage({ predictions });

    worker.onmessage = (event) => {
      resolve(event.data.processedData);
      worker.terminate();
    };

    // Fallback for environments without Web Worker support
    setTimeout(() => {
      resolve(processDataSynchronously(predictions));
      worker.terminate();
    }, 5000);
  });
};
```

---

**Document Status**: ✅ Enhanced with Comprehensive API Analysis
**Last Updated**: 2025-06-15
**Version**: 2.1
**Next Step**: Awaiting task-by-task implementation approval
