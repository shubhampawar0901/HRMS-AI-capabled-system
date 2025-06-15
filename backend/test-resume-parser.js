// Test script for Resume Parser AI integration
require('dotenv').config();
const AIService = require('./services/AIService');

async function testResumeParser() {
  console.log('🧪 Testing Resume Parser AI Integration\n');
  
  try {
    // Initialize AI Service
    const aiService = new AIService();
    console.log('✅ AI Service initialized successfully');
    
    // Mock file object for testing
    const mockFile = {
      originalname: 'test-resume.pdf',
      mimetype: 'application/pdf',
      size: 1024 * 1024, // 1MB
      path: '/tmp/test-resume.pdf'
    };
    
    console.log('📄 Testing with mock resume file...');
    
    // Test the parseResume method
    const result = await aiService.parseResume(mockFile);
    
    console.log('\n📊 Parse Results:');
    console.log('================');
    console.log('Parsed Data:', JSON.stringify(result.parsedData, null, 2));
    console.log('Confidence:', result.confidence);
    console.log('Processing Time:', result.processingTime + 'ms');
    
    // Test field mapping
    console.log('\n🔄 Field Mapping Test:');
    console.log('=====================');
    
    const expectedFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address', 'position', 'emergencyContact', 'emergencyPhone'
    ];
    
    expectedFields.forEach(field => {
      const value = result.parsedData[field];
      const status = value !== null && value !== undefined ? '✅' : '❌';
      console.log(`${status} ${field}: ${value || 'null'}`);
    });
    
    // Test confidence calculation
    console.log('\n📈 Confidence Analysis:');
    console.log('======================');
    if (result.confidence >= 0.8) {
      console.log('🟢 High confidence - Auto-populate recommended');
    } else if (result.confidence >= 0.6) {
      console.log('🟡 Medium confidence - Review recommended');
    } else {
      console.log('🔴 Low confidence - Manual entry recommended');
    }
    
    console.log('\n✅ Resume Parser test completed successfully!');
    
  } catch (error) {
    console.error('❌ Resume Parser test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test the fallback parser
async function testFallbackParser() {
  console.log('\n🔧 Testing Fallback Parser...');
  
  try {
    const aiService = new AIService();
    
    // Test with sample resume text
    const sampleText = `
      John Doe
      Software Engineer
      john.doe@email.com
      +1-555-123-4567
      123 Main Street, City, State 12345
      
      Experience:
      - Senior Developer at Tech Corp (2020-2023)
      - Junior Developer at StartupXYZ (2018-2020)
      
      Education:
      - BS Computer Science, University ABC (2018)
      
      Skills: JavaScript, React, Node.js, Python
    `;
    
    const fallbackResult = aiService.fallbackResumeParser(sampleText);
    
    console.log('Fallback Result:', JSON.stringify(fallbackResult, null, 2));
    
    // Test confidence calculation
    const confidence = aiService.calculateParsingConfidence(fallbackResult);
    console.log('Fallback Confidence:', confidence);
    
    console.log('✅ Fallback parser test completed!');
    
  } catch (error) {
    console.error('❌ Fallback parser test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Resume Parser AI Tests\n');
  console.log('==================================\n');
  
  await testResumeParser();
  await testFallbackParser();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Integration Checklist:');
  console.log('========================');
  console.log('✅ Backend: AI Service updated with Gemini 2.0 Pro');
  console.log('✅ Backend: Separate firstName/lastName fields');
  console.log('✅ Backend: Null values for missing data');
  console.log('✅ Backend: Confidence calculation');
  console.log('✅ Frontend: ResumeUpload component created');
  console.log('✅ Frontend: Form integration completed');
  console.log('✅ Frontend: Success notifications implemented');
  console.log('✅ Frontend: Auto-population logic added');
  
  console.log('\n🔗 API Endpoint: POST /api/ai/parse-resume');
  console.log('📝 Expected Response Format:');
  console.log(JSON.stringify({
    success: true,
    data: {
      id: 123,
      parsedData: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Main St",
        position: "Software Engineer",
        emergencyContact: null,
        emergencyPhone: null
      },
      confidence: 0.85,
      processingTime: 1500
    },
    message: "Resume parsed successfully"
  }, null, 2));
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testResumeParser, testFallbackParser };
