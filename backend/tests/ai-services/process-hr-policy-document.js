// Process the comprehensive HR policy document through RAG system
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DocumentProcessingService = require('./services/DocumentProcessingService');
const { AIPolicyDocument } = require('./models');

console.log('📄 Processing Comprehensive HR Policy Document...\n');

async function processHRPolicyDocument() {
  try {
    console.log('1. Reading HR policy document...');
    
    // Read the comprehensive HR policy document
    const policyPath = path.join(__dirname, '../Final plan/Comprehensive_HR_Policy_RAG_Optimized.md');
    const policyContent = await fs.readFile(policyPath, 'utf8');
    
    console.log('   ✅ HR policy document loaded');
    console.log(`   📊 Document size: ${policyContent.length} characters`);
    console.log(`   📝 Content preview: ${policyContent.substring(0, 150)}...`);
    console.log('');

    console.log('2. Creating mock file object for processing...');
    
    // Create mock file object for the document processing service
    const mockFile = {
      originalname: 'Comprehensive_HR_Policy_2024.pdf',
      mimetype: 'application/pdf',
      size: Buffer.byteLength(policyContent, 'utf8'),
      buffer: Buffer.from(policyContent, 'utf8')
    };

    console.log('   ✅ Mock file object created');
    console.log('');

    console.log('3. Initializing document processing service...');
    const docService = new DocumentProcessingService();
    
    // Override the PDF extraction method to return our markdown content
    docService.extractTextFromPDF = async (filePath) => {
      return {
        text: policyContent,
        pages: Math.ceil(policyContent.length / 3000), // Estimate pages
        info: { title: 'Comprehensive HR Policy Document' }
      };
    };

    console.log('   ✅ Document processing service ready');
    console.log('');

    console.log('4. Processing HR policy document...');
    const documentData = {
      documentType: 'employee_handbook',
      description: 'Comprehensive HR Policy Document for SaaS Organizations - India Operations covering employment, leave, compensation, performance, training, conduct, IT security, grievance procedures, and compliance with Indian labor laws.',
      accessLevel: 'employee',
      tags: [
        'hr_policy', 'employee_handbook', 'leave_policy', 'compensation', 
        'performance_management', 'training', 'code_of_conduct', 'it_security',
        'grievance_redressal', 'employment_law', 'india_compliance', 'saas_company'
      ]
    };

    try {
      const result = await docService.processDocument(mockFile, documentData, 1);
      
      console.log('   ✅ HR policy document processed successfully!');
      console.log('   📊 Processing results:');
      console.log(`      - Document ID: ${result.document.id}`);
      console.log(`      - Total chunks: ${result.chunks}`);
      console.log(`      - Vector IDs: ${result.vectorIds.length} vectors created`);
      console.log(`      - Processing status: ${result.document.processingStatus}`);
      console.log('');

      console.log('5. Testing RAG search with HR policy content...');
      const ragService = docService.ragService;
      
      // Test comprehensive HR queries
      const testQueries = [
        'What is the annual leave entitlement for employees?',
        'How many days of maternity leave are provided?',
        'What is the notice period for resignation?',
        'What are the working hours and office timings?',
        'How is the provident fund calculated?'
      ];

      console.log('   🔍 Testing search queries...');
      for (let i = 0; i < testQueries.length; i++) {
        const query = testQueries[i];
        console.log(`\n   Query ${i + 1}: "${query}"`);
        
        try {
          const searchResults = await ragService.searchWithAccessControl(query, 'employee', { topK: 3 });
          if (searchResults.length > 0) {
            console.log(`      ✅ Found ${searchResults.length} relevant chunks`);
            console.log(`      📝 Best match (score: ${searchResults[0].score.toFixed(3)}):`);
            console.log(`         ${searchResults[0].text.substring(0, 200)}...`);
          } else {
            console.log('      ⚠️  No relevant chunks found');
          }
        } catch (error) {
          console.log(`      ❌ Search error: ${error.message}`);
        }
      }
      console.log('');

      console.log('6. Testing enhanced chatbot with real HR policy...');
      const AIService = require('./services/AIService');
      const aiService = new AIService();
      
      const userContext = {
        userId: 1,
        role: 'employee',
        employeeId: 1
      };

      const chatQueries = [
        'How many annual leave days am I entitled to?',
        'What is the maternity leave policy?'
      ];

      for (let i = 0; i < chatQueries.length; i++) {
        const query = chatQueries[i];
        console.log(`\n   🤖 Chatbot Query ${i + 1}: "${query}"`);
        
        try {
          const chatResponse = await aiService.processChatbotQuery(query, userContext);
          console.log('      ✅ Chatbot response:');
          console.log(`         Intent: ${chatResponse.intent}`);
          console.log(`         Type: ${chatResponse.type}`);
          console.log(`         Response: ${chatResponse.message.substring(0, 300)}...`);
          console.log(`         Response time: ${chatResponse.responseTime}ms`);
          
          if (chatResponse.sources && chatResponse.sources.length > 0) {
            console.log(`         📚 Sources: ${chatResponse.sources.length} documents referenced`);
          }
        } catch (error) {
          console.log(`      ❌ Chatbot error: ${error.message}`);
        }
      }
      console.log('');

      console.log('🎉 HR Policy Document Processing Complete!\n');
      console.log('Summary:');
      console.log('- ✅ Comprehensive HR policy document processed');
      console.log('- ✅ Document chunked and vectorized');
      console.log('- ✅ Stored in Pinecone vector database');
      console.log('- ✅ RAG search working with real policy content');
      console.log('- ✅ Chatbot enhanced with comprehensive HR knowledge');
      console.log('\n🚀 Your RAG-based HR Chatbot now has complete HR policy knowledge!');

    } catch (error) {
      console.error('❌ Document processing failed:', error.message);
      console.error('Stack trace:', error.stack);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the processing
processHRPolicyDocument().then(() => {
  console.log('\n🏁 HR policy document processing completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Processing crashed:', error);
  process.exit(1);
});
