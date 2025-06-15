// Check Policy Data in Database and Pinecone
require('dotenv').config();
const AIPolicyDocument = require('./models/AIPolicyDocument');
const RAGService = require('./services/RAGService');

async function checkPolicyData() {
  console.log('🔍 Checking Policy Data Storage...\n');
  
  try {
    // Check database for policy documents
    console.log('📊 Database Check:');
    const allDocuments = await AIPolicyDocument.findAll();
    console.log(`   Total documents in database: ${allDocuments.length}`);
    
    if (allDocuments.length > 0) {
      console.log('\n   📋 Documents found:');
      allDocuments.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc.originalFilename || doc.filename}`);
        console.log(`      Type: ${doc.documentType}`);
        console.log(`      Status: ${doc.processingStatus}`);
        console.log(`      Access Level: ${doc.accessLevel}`);
        console.log(`      Chunks: ${doc.totalChunks || 0}`);
        console.log(`      Vector IDs: ${doc.vectorIds ? doc.vectorIds.length : 0}`);
        console.log(`      Created: ${doc.createdAt}`);
        console.log('      ---');
      });
    } else {
      console.log('   ❌ No policy documents found in database');
    }
    
    // Check Pinecone for vectors
    console.log('\n🔍 Pinecone Vector Database Check:');
    try {
      const ragService = new RAGService();
      
      // Try to search for any existing vectors
      const testSearch = await ragService.searchWithAccessControl(
        'policy', 
        'employee', 
        { topK: 5 }
      );
      
      console.log(`   Vector search results: ${testSearch.length} chunks found`);
      
      if (testSearch.length > 0) {
        console.log('\n   📋 Sample vector chunks:');
        testSearch.slice(0, 3).forEach((chunk, index) => {
          console.log(`   ${index + 1}. Score: ${chunk.score}`);
          console.log(`      Content: ${chunk.content.substring(0, 100)}...`);
          console.log(`      Metadata: ${JSON.stringify(chunk.metadata)}`);
          console.log('      ---');
        });
      } else {
        console.log('   ❌ No vectors found in Pinecone');
      }
      
    } catch (pineconeError) {
      console.log(`   ❌ Pinecone error: ${pineconeError.message}`);
    }
    
    // Check for sample policy content
    console.log('\n📚 Policy Content Analysis:');
    
    if (allDocuments.length === 0) {
      console.log('   ⚠️ No policy documents available');
      console.log('   📝 To test policy queries, you need to:');
      console.log('      1. Upload PDF policy documents via API');
      console.log('      2. Or create sample policy data');
      console.log('      3. Process documents to create vector embeddings');
      
      // Create sample policy data for testing
      console.log('\n🔧 Creating Sample Policy Data for Testing...');
      await createSamplePolicyData(ragService);
    }
    
  } catch (error) {
    console.error('❌ Error checking policy data:', error);
  }
}

async function createSamplePolicyData(ragService) {
  try {
    console.log('   📝 Creating sample HR policy chunks...');
    
    const samplePolicies = [
      {
        content: "Maternity Leave Policy: Female employees are entitled to 26 weeks of maternity leave. This includes 6 weeks of pre-natal leave and 20 weeks of post-natal leave. During maternity leave, employees receive full salary and benefits. To apply for maternity leave, submit Form ML-1 to HR at least 30 days before the expected due date.",
        metadata: {
          documentType: "leave_policy",
          accessLevel: "employee",
          filename: "Employee_Handbook_Leave_Policies.pdf",
          section: "Maternity Leave",
          page: 15
        }
      },
      {
        content: "Annual Leave Policy: All full-time employees are entitled to 21 days of annual leave per calendar year. Leave accrues at 1.75 days per month. Annual leave can be carried forward up to 5 days to the next year. Unused leave beyond 5 days will be forfeited. To apply for annual leave, submit request through the HR portal at least 7 days in advance.",
        metadata: {
          documentType: "leave_policy", 
          accessLevel: "employee",
          filename: "Employee_Handbook_Leave_Policies.pdf",
          section: "Annual Leave",
          page: 12
        }
      },
      {
        content: "Sick Leave Policy: Employees are entitled to 10 days of sick leave per year. Sick leave does not carry forward to the next year. For sick leave exceeding 3 consecutive days, a medical certificate is required. Sick leave can be taken without prior approval but must be reported to your manager within 24 hours.",
        metadata: {
          documentType: "leave_policy",
          accessLevel: "employee", 
          filename: "Employee_Handbook_Leave_Policies.pdf",
          section: "Sick Leave",
          page: 13
        }
      },
      {
        content: "Work From Home Policy: Employees may work from home up to 2 days per week with manager approval. WFH requests must be submitted 24 hours in advance. Employees must be available during core hours (10 AM - 4 PM) and maintain productivity standards. Equipment and internet connectivity are employee's responsibility.",
        metadata: {
          documentType: "work_policy",
          accessLevel: "employee",
          filename: "Remote_Work_Guidelines.pdf", 
          section: "Work From Home",
          page: 3
        }
      },
      {
        content: "Performance Review Process: Annual performance reviews are conducted every December. Reviews include goal assessment, competency evaluation, and development planning. Employees receive ratings from 1-5 scale. Reviews are conducted by direct managers with HR oversight. Results determine salary increments and promotion eligibility.",
        metadata: {
          documentType: "performance_policy",
          accessLevel: "employee",
          filename: "Performance_Management_Guide.pdf",
          section: "Review Process", 
          page: 8
        }
      },
      {
        content: "Dress Code Policy: Business casual attire is required for office work. This includes collared shirts, dress pants, and closed-toe shoes. Casual Fridays allow jeans and polo shirts. Client-facing roles require business formal attire. Remote workers should maintain professional appearance during video calls.",
        metadata: {
          documentType: "workplace_policy",
          accessLevel: "employee",
          filename: "Employee_Code_of_Conduct.pdf",
          section: "Dress Code",
          page: 22
        }
      }
    ];
    
    // Create sample document record
    const sampleDoc = await AIPolicyDocument.create({
      filename: 'sample_hr_policies.pdf',
      originalFilename: 'HR_Policy_Handbook_2024.pdf',
      filePath: 'policies/sample_hr_policies.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      documentType: 'policy_handbook',
      description: 'Comprehensive HR policy handbook covering leave, performance, and workplace policies',
      accessLevel: 'employee',
      departmentSpecific: null,
      uploadedBy: 1,
      tags: ['hr', 'policies', 'handbook', 'employee-guide']
    });
    
    console.log(`   ✅ Created sample document record (ID: ${sampleDoc.id})`);
    
    // Upsert sample chunks to Pinecone
    const vectorIds = await ragService.upsertDocumentChunks(
      sampleDoc.id,
      samplePolicies.map((policy, index) => ({
        text: policy.content,
        metadata: {
          ...policy.metadata,
          chunkNumber: index + 1,
          documentId: sampleDoc.id
        }
      })),
      {
        documentType: 'policy_handbook',
        accessLevel: 'employee',
        filename: 'HR_Policy_Handbook_2024.pdf'
      }
    );
    
    console.log(`   ✅ Created ${vectorIds.length} vector embeddings in Pinecone`);
    
    // Update document with processing results
    await AIPolicyDocument.updateProcessingStatus(sampleDoc.id, 'completed', null, {
      totalChunks: samplePolicies.length,
      pineconeNamespace: 'default',
      vectorIds: vectorIds
    });
    
    console.log('   ✅ Sample policy data created successfully!');
    console.log('\n📋 Available Policy Topics:');
    console.log('   • Maternity Leave Policy');
    console.log('   • Annual Leave Policy'); 
    console.log('   • Sick Leave Policy');
    console.log('   • Work From Home Policy');
    console.log('   • Performance Review Process');
    console.log('   • Dress Code Policy');
    
    console.log('\n🧪 Test Queries You Can Try:');
    console.log('   • "What is the maternity leave policy?"');
    console.log('   • "How many annual leave days do I get?"');
    console.log('   • "What is the work from home policy?"');
    console.log('   • "How does the performance review process work?"');
    
  } catch (error) {
    console.error('   ❌ Error creating sample policy data:', error);
  }
}

// Run the check
if (require.main === module) {
  checkPolicyData().catch(console.error);
}

module.exports = { checkPolicyData };
