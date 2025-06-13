# 🤖 AI Features - Implementation Logic & Data Flow

## 🎯 **Overview**

This document details the exact implementation logic for all 6 AI features, including database interactions, LLM prompts, data processing flows, and expected outputs.

---

## 1. 📄 **Resume Parser**

### **Trigger**: Admin uploads PDF resume during employee creation

### **Data Flow**:
```
PDF Upload → Text Extraction → LLM Processing → Structured JSON → Pre-fill Form → Discard PDF
```

### **Backend Logic**:

#### **Step 1: PDF Text Extraction**
```javascript
// Using pdf-parse library
const pdfText = await extractTextFromPDF(uploadedFile);
// Raw text extracted from PDF
```

#### **Step 2: LLM Processing**
**Prompt Template**:
```
Extract structured information from this resume text and return ONLY valid JSON:

Resume Text: {pdfText}

Return JSON in this exact format:
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "+1234567890",
  "experience_years": 5,
  "current_company": "Company Name",
  "skills": ["skill1", "skill2", "skill3"],
  "education": "Highest Degree",
  "summary": "Brief professional summary"
}

Rules:
- If information not found, use null
- Phone should include country code if available
- Skills should be array of strings (max 10)
- Experience in years as integer
- Return ONLY the JSON, no other text
```

#### **Step 3: Response Processing**
```javascript
// LLM Response Processing
const llmResponse = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.1, // Low temperature for consistency
  max_tokens: 500
});

// Parse JSON response
const extractedData = JSON.parse(llmResponse.choices[0].message.content);
```

#### **Step 4: Return Parsed Data**
```javascript
// Return structured data to pre-fill employee form
return {
  success: true,
  data: extractedData,
  message: "Resume parsed successfully"
};

// No database storage - PDF file is discarded after processing
```

### **Error Handling**:
- PDF parsing fails → Show error, allow manual entry
- LLM returns invalid JSON → Use fallback extraction
- Missing critical fields → Mark as requiring manual review
- **No file storage errors** → Simplified error handling

---

## 2. 🎯 **Attrition Predictor**

### **Trigger**: Auto-runs every time Admin opens Attrition Predictor page

### **Data Collection Logic**:

#### **Step 1: Gather Employee Data**
```sql
-- Collect comprehensive employee data
SELECT 
  e.id, e.first_name, e.last_name, e.join_date, e.basic_salary,
  e.department, e.position,
  -- Performance data
  AVG(pr.overall_rating) as avg_rating,
  COUNT(pr.id) as review_count,
  AVG(eg.achievement_percentage) as avg_goal_achievement,
  -- Attendance data
  COUNT(ar.id) FILTER (WHERE ar.status = 'present' AND ar.date >= NOW() - INTERVAL '3 months') as recent_attendance,
  COUNT(ar.id) FILTER (WHERE ar.status = 'absent' AND ar.date >= NOW() - INTERVAL '3 months') as recent_absences,
  -- Leave data
  COUNT(la.id) FILTER (WHERE la.status = 'approved' AND la.start_date >= NOW() - INTERVAL '6 months') as recent_leaves
FROM employees e
LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
LEFT JOIN employee_goals eg ON e.id = eg.employee_id
LEFT JOIN attendance_records ar ON e.id = ar.employee_id
LEFT JOIN leave_applications la ON e.id = la.employee_id
WHERE e.status = 'active'
GROUP BY e.id;
```

#### **Step 2: LLM Analysis**
**Prompt Template**:
```
Analyze this employee data and predict attrition risk. Return ONLY valid JSON:

Employee Data:
{
  "name": "{firstName} {lastName}",
  "tenure_months": {tenureMonths},
  "department": "{department}",
  "position": "{position}",
  "avg_performance_rating": {avgRating},
  "goal_achievement_avg": {avgGoalAchievement},
  "recent_attendance_rate": {attendanceRate},
  "recent_leave_frequency": {leaveFrequency},
  "salary_level": "{salaryLevel}"
}

Analyze based on these risk factors:
1. Performance decline (rating < 3.0)
2. Low goal achievement (< 70%)
3. Poor attendance (< 90%)
4. High leave frequency (> 6 leaves in 6 months)
5. Long tenure without promotion (> 24 months)

Return JSON:
{
  "risk_score": 0.75,
  "risk_level": "high",
  "primary_factor": "Performance decline",
  "secondary_factor": "Poor attendance",
  "confidence": 0.85,
  "recommendation": "Schedule immediate 1-on-1 meeting to discuss career goals"
}

Risk levels: low (0.0-0.4), medium (0.4-0.7), high (0.7-1.0)
```

#### **Step 3: Store Predictions**
```sql
INSERT INTO ai_attrition_predictions (
  employee_id, risk_score, risk_level, primary_factor, 
  secondary_factor, recommendation, confidence_score, prediction_date
) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE);
```

### **Display Logic**:
- Show high-risk employees (score > 0.7) on admin dashboard
- Sort by risk score descending
- Update predictions weekly

---

## 3. 💬 **Smart Feedback Generator**

### **Trigger**: Manager clicks "Generate AI Feedback" during performance review

### **Data Collection**:
```sql
-- Get employee performance data
SELECT 
  e.first_name, e.last_name, e.position, e.department,
  pr.overall_rating, pr.goals_achievement_score,
  -- Goal details
  STRING_AGG(eg.title, ', ') as goals,
  AVG(eg.achievement_percentage) as avg_achievement,
  -- Attendance
  COUNT(ar.id) FILTER (WHERE ar.status = 'present') * 100.0 / COUNT(ar.id) as attendance_rate
FROM employees e
LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
LEFT JOIN employee_goals eg ON e.id = eg.employee_id  
LEFT JOIN attendance_records ar ON e.id = ar.employee_id
WHERE e.id = $1 AND ar.date >= NOW() - INTERVAL '6 months'
GROUP BY e.id, pr.id;
```

### **LLM Processing**:
**Prompt Template**:
```
Generate professional performance review feedback for this employee. Return ONLY valid JSON:

Employee: {firstName} {lastName}
Position: {position}
Department: {department}
Overall Rating: {overallRating}/5.0
Goals Achievement: {goalsAchievement}%
Attendance Rate: {attendanceRate}%
Goals Worked On: {goals}

Generate constructive, professional feedback in JSON format:
{
  "strengths": "Highlight 2-3 specific strengths based on the data",
  "areas_for_improvement": "Identify 1-2 areas for development",
  "achievements": "Recognize specific accomplishments",
  "recommendations": "Suggest 2-3 actionable development steps",
  "overall_summary": "Brief overall assessment"
}

Guidelines:
- Be specific and data-driven
- Maintain professional, encouraging tone
- Focus on growth and development
- Avoid generic statements
- Keep each section to 2-3 sentences
```

### **Storage & Usage**:
```sql
INSERT INTO ai_feedback_generated (
  employee_id, review_id, feedback_type, generated_content, confidence_score
) VALUES ($1, $2, 'complete_review', $3, $4);
```

### **Manager Interface**:
- Shows generated feedback in editable text areas
- Manager can modify before saving
- Option to regenerate if not satisfied

---

## 4. 🚨 **Attendance Anomaly Detection**

### **Trigger**: Automated daily job after attendance data updates

### **Attendance Anomaly Detection Only**:

#### **Data Analysis Logic**:
```sql
-- Detect unusual attendance patterns (last 30 days)
SELECT
  employee_id,
  COUNT(*) as total_days,
  COUNT(*) FILTER (WHERE total_hours > 12) as overtime_days,
  COUNT(*) FILTER (WHERE total_hours < 4) as short_days,
  COUNT(*) FILTER (WHERE status = 'absent') as absent_days,
  COUNT(*) FILTER (WHERE check_in_time::time > '10:00:00') as late_days,
  COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) IN (0,6)) as weekend_days
FROM attendance_records
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY employee_id
HAVING
  COUNT(*) FILTER (WHERE total_hours > 12) > 5 OR
  COUNT(*) FILTER (WHERE total_hours < 4) > 3 OR
  COUNT(*) FILTER (WHERE status = 'absent') > 6 OR
  COUNT(*) FILTER (WHERE check_in_time::time > '10:00:00') > 8 OR
  COUNT(*) FILTER (WHERE EXTRACT(DOW FROM date) IN (0,6)) > 3;
```

#### **LLM Analysis**:
**Prompt Template**:
```
Analyze this attendance pattern for anomalies. Return ONLY valid JSON:

Employee: {employeeName}
Last 30 days attendance:
- Total working days: {totalDays}
- Overtime days (>12hrs): {overtimeDays}
- Short days (<4hrs): {shortDays}
- Absent days: {absentDays}
- Late arrivals (>10 AM): {lateDays}
- Weekend work days: {weekendDays}

Determine anomaly type:
{
  "is_anomaly": true,
  "anomaly_type": "Excessive Overtime",
  "severity": "high",
  "description": "15 days with more than 12 hours in last 30 days"
}

Anomaly types: "Excessive Overtime", "Irregular Hours", "Frequent Absences", "Late Arrivals", "Weekend Work"
Severity levels: low, medium, high
```

### **Storage**:
```sql
INSERT INTO ai_anomaly_detections (
  employee_id, anomaly_type, anomaly_description, severity, detected_at, status
) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, 'open');
```

---

## 5. 🤖 **HR Chatbot**

### **Architecture**: RAG (Retrieval-Augmented Generation)

### **Knowledge Base Setup**:
```javascript
// Vector database setup for policy documents
const policyDocuments = [
  "Leave Policy: Annual leave is 30 days per year...",
  "Attendance Policy: Working hours are 9 AM to 6 PM...",
  "Performance Review Process: Reviews are conducted annually...",
  // More policy documents
];

// Create embeddings and store in vector database
for (const doc of policyDocuments) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: doc
  });
  
  await vectorDB.insert({
    content: doc,
    embedding: embedding.data[0].embedding,
    metadata: { type: "policy", category: "leave" }
  });
}
```

### **Query Processing Flow**:

#### **Step 1: Intent Recognition & Context Retrieval**
```javascript
// Get employee context
const employeeContext = await getEmployeeContext(employeeId);

// Search relevant policies
const relevantPolicies = await vectorDB.search(userQuery, {
  limit: 3,
  threshold: 0.7
});
```

#### **Step 2: LLM Processing**
**Prompt Template**:
```
You are an HR assistant. Answer the employee's question using the provided context.

Employee Context:
{
  "name": "{employeeName}",
  "department": "{department}",
  "position": "{position}",
  "leave_balance": {
    "annual": {annualLeave},
    "sick": {sickLeave},
    "personal": {personalLeave}
  },
  "attendance_this_month": "{attendanceRate}%",
  "last_review_date": "{lastReviewDate}"
}

Relevant Policies:
{relevantPolicies}

Employee Question: "{userQuery}"

Guidelines:
- Use the employee's actual data when relevant
- Reference specific policies when applicable
- Be helpful and professional
- If you cannot answer, suggest contacting HR
- Keep responses concise but complete

Response:
```

#### **Step 3: Response Enhancement**
```javascript
// Add quick action buttons based on intent
const response = {
  message: llmResponse,
  intent: detectedIntent,
  quickActions: getQuickActions(detectedIntent),
  confidence: 0.95
};

function getQuickActions(intent) {
  switch(intent) {
    case 'leave_balance':
      return [
        { text: "Apply for Leave", action: "navigate", target: "/leave/apply" },
        { text: "View Leave History", action: "navigate", target: "/leave/history" }
      ];
    case 'payslip_query':
      return [
        { text: "View Latest Payslip", action: "navigate", target: "/payslip" }
      ];
    default:
      return [];
  }
}
```

### **Storage**:
```sql
INSERT INTO ai_chatbot_conversations (
  employee_id, session_id, user_message, bot_response, 
  intent, confidence_score, response_time_ms
) VALUES ($1, $2, $3, $4, $5, $6, $7);
```

---

## 6. 📊 **Smart Reports**

### **Trigger**: Admin/Manager requests AI-generated report

### **Data Aggregation**:
```sql
-- Team performance data aggregation
SELECT 
  e.department,
  COUNT(e.id) as team_size,
  AVG(pr.overall_rating) as avg_rating,
  AVG(eg.achievement_percentage) as avg_goal_achievement,
  COUNT(ar.id) FILTER (WHERE ar.status = 'present') * 100.0 / COUNT(ar.id) as attendance_rate,
  COUNT(la.id) FILTER (WHERE la.status = 'approved') as total_leaves
FROM employees e
LEFT JOIN performance_reviews pr ON e.id = pr.employee_id
LEFT JOIN employee_goals eg ON e.id = eg.employee_id
LEFT JOIN attendance_records ar ON e.id = ar.employee_id
LEFT JOIN leave_applications la ON e.id = la.employee_id
WHERE ar.date >= $1 AND ar.date <= $2
GROUP BY e.department;
```

### **LLM Analysis**:
**Prompt Template**:
```
Generate an executive summary report based on this team data. Return ONLY valid JSON:

Report Period: {startDate} to {endDate}
Team Data:
{teamDataJSON}

Generate comprehensive analysis:
{
  "executive_summary": "2-3 sentence overview of key findings",
  "key_insights": [
    "Top performing department with 4.2 average rating",
    "Attendance improved by 3% compared to last month",
    "Engineering team exceeded goal targets by 15%"
  ],
  "areas_of_concern": [
    "Sales team attendance below 90%",
    "HR department has 2 high-risk attrition cases"
  ],
  "recommendations": [
    "Implement flexible working for Sales team",
    "Conduct retention interviews for at-risk employees",
    "Recognize top performers in Engineering"
  ],
  "metrics_summary": {
    "overall_performance": "Above Average",
    "attendance_trend": "Improving",
    "goal_achievement": "Exceeding Targets"
  }
}

Guidelines:
- Be data-driven and specific
- Highlight both positives and areas for improvement
- Provide actionable recommendations
- Use professional business language
```

### **Report Generation**:
```javascript
// Generate PDF report
const reportData = {
  title: "Monthly Team Performance Report",
  period: `${startDate} to ${endDate}`,
  generatedBy: "AI Analytics Engine",
  content: llmAnalysis,
  charts: generateCharts(teamData),
  timestamp: new Date()
};

const pdfBuffer = await generatePDFReport(reportData);
```

---

## 🔧 **Technical Configuration**

### **LLM Settings**:
```javascript
const llmConfig = {
  model: "gpt-4",
  temperature: 0.1, // Low for consistency
  max_tokens: 1000,
  top_p: 0.9,
  frequency_penalty: 0.0,
  presence_penalty: 0.0
};
```

### **Vector Database Settings**:
```javascript
const vectorDBConfig = {
  dimension: 1536, // OpenAI embedding dimension
  metric: "cosine",
  index_type: "IVF_FLAT",
  similarity_threshold: 0.7
};
```

### **Error Handling Strategy**:
- **LLM API failures**: Fallback to rule-based responses
- **Invalid JSON responses**: Retry with stricter prompts
- **Vector search failures**: Use keyword-based search
- **Data processing errors**: Log and alert administrators

This implementation ensures reliable, consistent AI functionality with proper error handling and fallback mechanisms.
