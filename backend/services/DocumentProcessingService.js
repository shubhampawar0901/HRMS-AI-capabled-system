const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const RAGService = require('./RAGService');
const S3Service = require('./S3Service');
const { AIPolicyDocument } = require('../models');

class DocumentProcessingService {
  constructor() {
    this.ragService = new RAGService();
    this.s3Service = new S3Service();
    this.uploadDir = process.env.UPLOAD_PATH || './uploads';
    this.policiesDir = path.join(this.uploadDir, 'policies');
    this.storageStrategy = process.env.STORAGE_STRATEGY || 'dual'; // 'local', 's3', 'dual'
  }

  // ==========================================
  // FILE OPERATIONS
  // ==========================================

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch (error) {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async saveUploadedFile(file, documentType) {
    try {
      await this.ensureDirectoryExists(this.policiesDir);
      
      const timestamp = Date.now();
      const filename = `${documentType}_${timestamp}_${file.originalname}`;
      const filePath = path.join(this.policiesDir, filename);
      
      await fs.writeFile(filePath, file.buffer);
      
      return {
        filename: filename,
        filePath: filePath,
        relativePath: path.relative(this.uploadDir, filePath)
      };
    } catch (error) {
      console.error('Error saving uploaded file:', error);
      throw new Error('Failed to save uploaded file');
    }
  }

  // ==========================================
  // TEXT EXTRACTION
  // ==========================================

  async extractTextFromFile(filePath, fileBuffer = null) {
    try {
      let buffer;

      // If we have the buffer (from upload), use it directly
      if (fileBuffer) {
        buffer = fileBuffer;
      } else if (this.s3Service.isS3Url(filePath)) {
        // For S3 URLs, we would need to download the file
        // For now, we'll use the buffer from upload process
        throw new Error('S3 file download not implemented - use buffer from upload');
      } else {
        // For local files, read from filesystem
        buffer = await fs.readFile(filePath);
      }

      const pdfData = await pdfParse(buffer);

      return {
        text: pdfData.text,
        pages: pdfData.numpages,
        info: pdfData.info
      };
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  async extractTextFromPDF(filePath) {
    // Legacy method - redirect to new method
    return this.extractTextFromFile(filePath);
  }

  async extractTextFromBuffer(buffer, mimeType) {
    try {
      if (mimeType === 'application/pdf') {
        const pdfData = await pdfParse(buffer);
        return {
          text: pdfData.text,
          pages: pdfData.numpages,
          info: pdfData.info
        };
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Error extracting text from buffer:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  // ==========================================
  // TEXT CHUNKING
  // ==========================================

  chunkText(text, options = {}) {
    const {
      chunkSize = 500,        // words per chunk
      overlap = 50,           // words overlap between chunks
      minChunkSize = 100      // minimum words in a chunk
    } = options;

    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunkWords = words.slice(i, i + chunkSize);
      
      if (chunkWords.length >= minChunkSize || i === 0) {
        const chunkText = chunkWords.join(' ');
        chunks.push({
          text: chunkText,
          startIndex: i,
          endIndex: i + chunkWords.length - 1,
          wordCount: chunkWords.length,
          metadata: {
            chunkNumber: chunks.length + 1,
            isFirstChunk: i === 0,
            isLastChunk: i + chunkSize >= words.length
          }
        });
      }
    }

    return chunks;
  }

  // ==========================================
  // DOCUMENT PROCESSING PIPELINE
  // ==========================================

  async processDocument(file, documentData, uploadedBy) {
    try {
      console.log(`📄 Starting document processing: ${file.originalname}`);

      let primaryFilePath = null;
      let localFilePath = null;
      let s3Url = null;
      let storageInfo = {
        strategy: this.storageStrategy,
        s3Enabled: this.s3Service.isEnabled(),
        localSaved: false,
        s3Saved: false,
        errors: []
      };

      // Step 1: Handle file storage based on strategy
      if (this.storageStrategy === 'local' || this.storageStrategy === 'dual') {
        try {
          const fileInfo = await this.saveUploadedFile(file, documentData.documentType);
          localFilePath = fileInfo.relativePath;
          primaryFilePath = localFilePath;
          storageInfo.localSaved = true;
          console.log(`✅ Local file saved: ${localFilePath}`);
        } catch (error) {
          console.error('❌ Local file save failed:', error);
          storageInfo.errors.push(`Local save failed: ${error.message}`);
          if (this.storageStrategy === 'local') {
            throw error; // Fail if local-only strategy fails
          }
        }
      }

      if (this.storageStrategy === 's3' || this.storageStrategy === 'dual') {
        if (this.s3Service.isEnabled()) {
          try {
            const s3Result = await this.s3Service.uploadFile(
              file.buffer,
              file.originalname,
              file.mimetype,
              documentData.documentType
            );
            s3Url = s3Result.s3Url;
            primaryFilePath = s3Url; // Prefer S3 URL as primary
            storageInfo.s3Saved = true;
            console.log(`✅ S3 file uploaded: ${s3Url}`);
          } catch (error) {
            console.error('❌ S3 upload failed:', error);
            storageInfo.errors.push(`S3 upload failed: ${error.message}`);
            if (this.storageStrategy === 's3' && !localFilePath) {
              throw error; // Fail if S3-only strategy fails and no local backup
            }
          }
        } else {
          console.warn('⚠️  S3 service not enabled, skipping S3 upload');
          storageInfo.errors.push('S3 service not configured');
        }
      }

      // Ensure we have at least one successful storage
      if (!primaryFilePath) {
        throw new Error('Failed to save file to any storage location');
      }

      // Step 2: Create document record in database
      const document = await AIPolicyDocument.create({
        filename: this.generateFilename(file.originalname, documentData.documentType),
        originalFilename: file.originalname,
        filePath: primaryFilePath, // Store primary path (S3 URL or local path)
        fileSize: file.size,
        mimeType: file.mimetype,
        documentType: documentData.documentType,
        description: documentData.description,
        accessLevel: documentData.accessLevel || 'employee',
        departmentSpecific: documentData.departmentSpecific,
        uploadedBy: uploadedBy,
        tags: documentData.tags || []
      });

      // Step 3: Update status to processing
      await AIPolicyDocument.updateProcessingStatus(document.id, 'processing');

      try {
        // Step 4: Extract text from document (works with both local files and S3 URLs)
        const extractedData = await this.extractTextFromFile(primaryFilePath, file.buffer);

        // Step 5: Chunk the text
        const chunks = this.chunkText(extractedData.text, {
          chunkSize: 500,
          overlap: 50
        });

        // Step 6: Process chunks and store in vector database
        const vectorIds = await this.ragService.upsertDocumentChunks(
          document.id,
          chunks,
          {
            documentType: documentData.documentType,
            accessLevel: documentData.accessLevel || 'employee',
            filename: file.originalname
          }
        );

        // Step 7: Update document with processing results
        await AIPolicyDocument.updateProcessingStatus(document.id, 'completed', null, {
          totalChunks: chunks.length,
          pineconeNamespace: 'default',
          vectorIds: vectorIds
        });

        console.log(`✅ Document processing completed: ${file.originalname}`);

        return {
          document: await AIPolicyDocument.findById(document.id),
          extractedData: extractedData,
          chunks: chunks.length,
          vectorIds: vectorIds,
          storageInfo: storageInfo
        };

      } catch (processingError) {
        // Update status to failed if processing fails
        await AIPolicyDocument.updateProcessingStatus(
          document.id,
          'failed',
          processingError.message
        );
        throw processingError;
      }

    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Document processing failed: ${error.message}`);
    }
  }

  // ==========================================
  // DOCUMENT MANAGEMENT
  // ==========================================

  async reprocessDocument(documentId) {
    try {
      const document = await AIPolicyDocument.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete existing vectors if they exist
      if (document.vectorIds && document.vectorIds.length > 0) {
        await this.ragService.deleteDocumentChunks(document.vectorIds);
      }

      // Update status to processing
      await AIPolicyDocument.updateProcessingStatus(documentId, 'processing');

      // Re-extract and process
      const extractedData = await this.extractTextFromPDF(
        path.join(this.uploadDir, document.filePath)
      );
      
      const chunks = this.chunkText(extractedData.text);
      
      const vectorIds = await this.ragService.upsertDocumentChunks(
        documentId,
        chunks,
        {
          documentType: document.documentType,
          accessLevel: document.accessLevel,
          filename: document.originalFilename
        }
      );

      // Update document
      await AIPolicyDocument.updateProcessingStatus(documentId, 'completed', null, {
        totalChunks: chunks.length,
        vectorIds: vectorIds
      });

      return await AIPolicyDocument.findById(documentId);
    } catch (error) {
      await AIPolicyDocument.updateProcessingStatus(documentId, 'failed', error.message);
      throw error;
    }
  }

  async deleteDocument(documentId) {
    try {
      const document = await AIPolicyDocument.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      const deletionInfo = {
        vectorsDeleted: false,
        localFileDeleted: false,
        s3Deleted: false,
        databaseSoftDeleted: false
      };

      // Delete vectors from Pinecone
      if (document.vectorIds && document.vectorIds.length > 0) {
        try {
          await this.ragService.deleteDocumentChunks(document.vectorIds);
          deletionInfo.vectorsDeleted = true;
        } catch (error) {
          console.warn('Could not delete vectors:', error.message);
        }
      }

      // Delete file based on storage type
      if (this.s3Service.isS3Url(document.filePath)) {
        // Delete from S3
        try {
          const s3Key = this.s3Service.extractS3KeyFromUrl(document.filePath);
          if (s3Key) {
            const result = await this.s3Service.deleteFile(s3Key);
            deletionInfo.s3Deleted = result.success;
          }
        } catch (error) {
          console.warn('Could not delete S3 file:', error.message);
        }
      } else {
        // Delete local file
        try {
          const fullPath = path.join(this.uploadDir, document.filePath);
          await fs.unlink(fullPath);
          deletionInfo.localFileDeleted = true;
        } catch (error) {
          console.warn('Could not delete local file:', error.message);
        }
      }

      // Soft delete from database
      await AIPolicyDocument.delete(documentId);
      deletionInfo.databaseSoftDeleted = true;

      return deletionInfo;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  generateFilename(originalFilename, documentType) {
    const timestamp = Date.now();
    const sanitized = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${documentType}_${timestamp}_${sanitized}`;
  }

  async getProcessingStats() {
    try {
      const documents = await AIPolicyDocument.findAll();
      const stats = {
        total: documents.length,
        completed: documents.filter(d => d.processingStatus === 'completed').length,
        processing: documents.filter(d => d.processingStatus === 'processing').length,
        failed: documents.filter(d => d.processingStatus === 'failed').length,
        pending: documents.filter(d => d.processingStatus === 'pending').length
      };

      // Add storage statistics
      const storageStats = {
        s3Enabled: this.s3Service.isEnabled(),
        totalS3Files: documents.filter(d => this.s3Service.isS3Url(d.filePath)).length,
        totalLocalFiles: documents.filter(d => !this.s3Service.isS3Url(d.filePath)).length,
        storageStrategy: this.storageStrategy
      };

      return { stats, storageStats };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return null;
    }
  }

  getStorageStatus() {
    return {
      strategy: this.storageStrategy,
      s3Service: this.s3Service.getStatus(),
      localUploadDir: this.uploadDir
    };
  }

  validateFile(file) {
    const allowedTypes = ['application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    return true;
  }
}

module.exports = DocumentProcessingService;
