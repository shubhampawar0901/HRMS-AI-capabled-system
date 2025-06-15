// Intelligent Intent Classifier using Gemini 2.5 Flash
const { GoogleGenerativeAI } = require('@google/generative-ai');

class IntelligentIntentClassifier {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.fastModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    });
    
    // Database schema awareness
    this.databaseSchema = {
      employees: ['id', 'firstName', 'lastName', 'employeeCode', 'email', 'phone', 'hireDate', 'position', 'departmentId', 'managerId', 'salary', 'active'],
      departments: ['id', 'name', 'description', 'managerId'],
      leave_balances: ['id', 'employeeId', 'leaveTypeId', 'year', 'allocatedDays', 'usedDays', 'remainingDays'],
      leave_types: ['id', 'name', 'description', 'maxDays', 'carryForward'],
      leave_requests: ['id', 'employeeId', 'leaveTypeId', 'startDate', 'endDate', 'days', 'reason', 'status', 'approverId'],
      attendance: ['id', 'employeeId', 'date', 'checkIn', 'checkOut', 'totalHours', 'status'],
      performance_reviews: ['id', 'employeeId', 'reviewerId', 'reviewPeriod', 'goals', 'achievements', 'rating', 'feedback'],
      payroll: ['id', 'employeeId', 'month', 'year', 'basicSalary', 'allowances', 'deductions', 'netSalary']
    };
    
    // Policy dataset awareness
    this.policyDataset = {
      leave_policies: ['annual_leave', 'sick_leave', 'maternity_leave', 'paternity_leave', 'casual_leave', 'emergency_leave'],
      employment_policies: ['probation', 'confirmation', 'resignation', 'termination', 'transfer'],
      compensation_policies: ['salary_structure', 'pf_contribution', 'gratuity', 'bonuses', 'allowances'],
      workplace_policies: ['working_hours', 'dress_code', 'remote_work', 'office_conduct', 'harassment'],
      performance_policies: ['appraisal_cycle', 'goal_setting', 'feedback', 'promotion_criteria'],
      training_policies: ['onboarding', 'skill_development', 'certification', 'conference_attendance'],
      it_security_policies: ['device_usage', 'data_protection', 'access_control', 'password_policy']
    };
  }

  async classifyIntent(message, userContext) {
    try {
      const prompt = `
You are an intelligent HR chatbot intent classifier. Analyze the user's message and classify it into one of these specific intents:

**INTENT CATEGORIES:**

1. **greeting_simple** - Simple greetings: "hi", "hello", "good morning"
2. **greeting_with_request** - Greeting + request: "Hi, I need help with my leave", "Good morning, can you check my attendance?"
3. **policy_query** - Questions about HR policies, procedures, rules
4. **personal_data_query** - Questions about user's own data from database
5. **unauthorized_access** - Attempts to access other employees' data
6. **out_of_scope** - Non-HR questions (weather, sports, math, general knowledge)
7. **ambiguous** - Unclear or mixed intent queries

**USER CONTEXT:**
- Employee ID: ${userContext.employeeId}
- Role: ${userContext.role}
- Name: ${userContext.employeeName}

**DATABASE SCHEMA AVAILABLE:**
${JSON.stringify(this.databaseSchema, null, 2)}

**POLICY AREAS AVAILABLE:**
${JSON.stringify(this.policyDataset, null, 2)}

**USER MESSAGE:** "${message}"

**CLASSIFICATION RULES:**

For **policy_query**: Questions about company policies, procedures, how-to guides, rules
Examples: "What's the maternity leave policy?", "How do I apply for annual leave?", "What are working hours?"

For **personal_data_query**: Questions about user's own data that exists in our database
Examples: "My leave balance", "My attendance record", "My performance review", "My salary details"

For **unauthorized_access**: Attempts to access other employees' information
Examples: "What's John's salary?", "Show me team attendance", "Other employee's leave balance"

For **out_of_scope**: Non-HR related questions
Examples: "What's the weather?", "Who is Sachin Tendulkar?", "What's 2+2?", "Tell me about JavaScript"

**RESPONSE FORMAT:**
Return a JSON object with:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "reasoning": "Brief explanation of classification",
  "data_type": "specific data type if personal_data_query",
  "policy_area": "specific policy area if policy_query",
  "security_risk": "high/medium/low for unauthorized_access"
}

Analyze the message and respond with the JSON classification:
`;

      const result = await this.fastModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      
      // Parse JSON response
      try {
        const classification = JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
        return {
          type: classification.intent,
          confidence: classification.confidence,
          reasoning: classification.reasoning,
          dataType: classification.data_type,
          policyArea: classification.policy_area,
          securityRisk: classification.security_risk,
          processingTime: Date.now()
        };
      } catch (parseError) {
        console.error('Failed to parse intent classification:', parseError);
        return this.fallbackClassification(message);
      }
      
    } catch (error) {
      console.error('Intent classification error:', error);
      return this.fallbackClassification(message);
    }
  }

  fallbackClassification(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Simple fallback patterns
    if (['hi', 'hello', 'hey'].some(pattern => lowerMessage.startsWith(pattern))) {
      return { type: 'greeting_simple', confidence: 0.8, reasoning: 'Fallback pattern match' };
    }
    
    if (lowerMessage.includes('policy') || lowerMessage.includes('procedure')) {
      return { type: 'policy_query', confidence: 0.7, reasoning: 'Fallback pattern match' };
    }
    
    if (lowerMessage.includes('my ') || lowerMessage.includes('mine')) {
      return { type: 'personal_data_query', confidence: 0.7, reasoning: 'Fallback pattern match' };
    }
    
    return { type: 'ambiguous', confidence: 0.5, reasoning: 'Fallback - unclear intent' };
  }

  async analyzeDataRequirement(message, intent) {
    if (intent.type !== 'personal_data_query') {
      return null;
    }

    const prompt = `
Analyze this personal data query and determine exactly what database information is needed.

USER MESSAGE: "${message}"
AVAILABLE DATABASE TABLES: ${JSON.stringify(Object.keys(this.databaseSchema))}

Determine:
1. Which table(s) to query
2. What specific fields are needed
3. Any filters or conditions
4. Expected response format

Return JSON:
{
  "tables": ["table1", "table2"],
  "fields": ["field1", "field2"],
  "filters": {"field": "value"},
  "responseType": "summary/detailed/count"
}
`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Data requirement analysis error:', error);
      return null;
    }
  }

  async analyzePolicyRequirement(message, intent) {
    if (intent.type !== 'policy_query') {
      return null;
    }

    const prompt = `
Analyze this policy query and determine what policy information is needed.

USER MESSAGE: "${message}"
AVAILABLE POLICY AREAS: ${JSON.stringify(this.policyDataset)}

Determine:
1. Which policy area(s) are relevant
2. Specific policy topics
3. Type of information needed (procedure, rules, examples)
4. Complexity level (simple/detailed)

Return JSON:
{
  "policyAreas": ["area1", "area2"],
  "topics": ["topic1", "topic2"],
  "informationType": "procedure/rules/examples/overview",
  "complexityLevel": "simple/detailed"
}
`;

    try {
      const result = await this.fastModel.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();
      return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (error) {
      console.error('Policy requirement analysis error:', error);
      return null;
    }
  }
}

module.exports = IntelligentIntentClassifier;
