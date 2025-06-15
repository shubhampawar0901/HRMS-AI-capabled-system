const S3Service = require('../../services/S3Service');
const DocumentProcessingService = require('../../services/DocumentProcessingService');

async function testS3Integration() {
  console.log('🧪 Testing S3 Integration for Policy Documents');
  console.log('=' .repeat(60));

  try {
    // Test 1: S3 Service Status
    console.log('\n📊 Test 1: S3 Service Status');
    const s3Service = new S3Service();
    const status = s3Service.getStatus();
    
    console.log('S3 Status:', JSON.stringify(status, null, 2));
    console.log('S3 Enabled:', s3Service.isEnabled());

    if (!s3Service.isEnabled()) {
      console.log('⚠️  S3 is not enabled. Check environment variables.');
      return;
    }

    // Test 2: Document Processing Service Status
    console.log('\n📊 Test 2: Document Processing Service Status');
    const docService = new DocumentProcessingService();
    const storageStatus = docService.getStorageStatus();
    
    console.log('Storage Status:', JSON.stringify(storageStatus, null, 2));

    // Test 3: Create a test file buffer
    console.log('\n📊 Test 3: Test File Upload to S3');
    const testPdfContent = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Policy Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
299
%%EOF`);

    const testFilename = 'test_policy_document.pdf';
    const documentType = 'test_policy';

    try {
      const uploadResult = await s3Service.uploadFile(
        testPdfContent,
        testFilename,
        'application/pdf',
        documentType
      );

      console.log('✅ S3 Upload Successful:');
      console.log('   S3 URL:', uploadResult.s3Url);
      console.log('   S3 Key:', uploadResult.s3Key);
      console.log('   File Size:', uploadResult.size, 'bytes');

      // Test 4: Verify file exists in S3
      console.log('\n📊 Test 4: Verify File in S3');
      const fileInfo = await s3Service.getFileInfo(uploadResult.s3Key);
      console.log('File Info:', JSON.stringify(fileInfo, null, 2));

      // Test 5: Generate presigned URL
      console.log('\n📊 Test 5: Generate Presigned URL');
      const presignedUrl = await s3Service.getPresignedUrl(uploadResult.s3Key, 300); // 5 minutes
      console.log('Presigned URL:', presignedUrl);

      // Test 6: Test URL detection
      console.log('\n📊 Test 6: Test URL Detection');
      console.log('Is S3 URL:', s3Service.isS3Url(uploadResult.s3Url));
      console.log('Is S3 URL (local path):', s3Service.isS3Url('./uploads/test.pdf'));

      // Test 7: Extract S3 key from URL
      console.log('\n📊 Test 7: Extract S3 Key from URL');
      const extractedKey = s3Service.extractS3KeyFromUrl(uploadResult.s3Url);
      console.log('Extracted Key:', extractedKey);
      console.log('Matches Original:', extractedKey === uploadResult.s3Key);

      // Test 8: Clean up - Delete test file
      console.log('\n📊 Test 8: Clean Up - Delete Test File');
      const deleteResult = await s3Service.deleteFile(uploadResult.s3Key);
      console.log('Delete Result:', JSON.stringify(deleteResult, null, 2));

      console.log('\n🎉 All S3 Integration Tests Passed!');

    } catch (uploadError) {
      console.error('❌ S3 Upload Test Failed:', uploadError.message);
    }

    // Test 9: Test with DocumentProcessingService
    console.log('\n📊 Test 9: Test Document Processing Service Storage');
    const processingStats = await docService.getProcessingStats();
    console.log('Processing Stats:', JSON.stringify(processingStats, null, 2));

  } catch (error) {
    console.error('❌ S3 Integration Test Failed:', error);
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n🔧 Environment Variables Check:');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '[SET]' : '[NOT SET]');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '[SET]' : '[NOT SET]');
  console.log('AWS_REGION:', process.env.AWS_REGION || '[NOT SET]');
  console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || '[NOT SET]');
  console.log('S3_ENABLED:', process.env.S3_ENABLED || '[NOT SET]');
  console.log('S3_FOLDER_PREFIX:', process.env.S3_FOLDER_PREFIX || '[NOT SET]');
  console.log('STORAGE_STRATEGY:', process.env.STORAGE_STRATEGY || '[NOT SET]');
}

// Run tests
async function runTests() {
  testEnvironmentVariables();
  await testS3Integration();
}

// Execute if run directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testS3Integration, testEnvironmentVariables };
