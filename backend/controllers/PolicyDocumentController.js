const DocumentProcessingService = require('../services/DocumentProcessingService');
const { AIPolicyDocument } = require('../models');
const responseHelper = require('../utils/responseHelper');

class PolicyDocumentController {
  constructor() {
    this.documentService = new DocumentProcessingService();
  }

  // ==========================================
  // UPLOAD POLICY DOCUMENT
  // ==========================================
  async uploadDocument(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      // Validate file upload
      if (!req.file) {
        return responseHelper.error(res, 'No file uploaded', 400);
      }

      // Validate file type and size
      try {
        this.documentService.validateFile(req.file);
      } catch (validationError) {
        return responseHelper.error(res, validationError.message, 400);
      }

      // Extract document metadata from request
      const documentData = {
        documentType: req.body.documentType || 'other',
        description: req.body.description || '',
        accessLevel: req.body.accessLevel || 'employee',
        departmentSpecific: req.body.departmentSpecific ? parseInt(req.body.departmentSpecific) : null,
        tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : []
      };

      // Process the document
      const result = await this.documentService.processDocument(
        req.file,
        documentData,
        req.user.id
      );

      return responseHelper.success(res, {
        document: result.document,
        storageInfo: result.storageInfo
      }, 'Policy document uploaded and processing started');

    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error types
      if (error.message.includes('S3 upload failed')) {
        return responseHelper.error(res, 'S3 upload failed, document saved locally only', 500, {
          error: 'S3_UPLOAD_FAILED'
        });
      }
      
      if (error.message.includes('File size exceeds')) {
        return responseHelper.error(res, 'File size exceeds 10MB limit', 400, {
          error: 'FILE_TOO_LARGE'
        });
      }
      
      if (error.message.includes('Only PDF files')) {
        return responseHelper.error(res, 'Only PDF files are allowed', 400, {
          error: 'INVALID_FILE_TYPE'
        });
      }

      return responseHelper.error(res, 'Document upload failed', 500);
    }
  }

  // ==========================================
  // GET ALL POLICY DOCUMENTS
  // ==========================================
  async getAllDocuments(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const options = {
        documentType: req.query.documentType,
        processingStatus: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };

      const documents = await AIPolicyDocument.findAll(options);
      
      // Calculate pagination
      const totalDocuments = documents.length;
      const totalPages = Math.ceil(totalDocuments / options.limit);
      
      return responseHelper.success(res, {
        documents: documents,
        pagination: {
          currentPage: options.page,
          totalPages: totalPages,
          totalDocuments: totalDocuments,
          limit: options.limit
        }
      }, 'Policy documents retrieved successfully');

    } catch (error) {
      console.error('Get documents error:', error);
      return responseHelper.error(res, 'Failed to retrieve documents', 500);
    }
  }

  // ==========================================
  // GET POLICY DOCUMENT BY ID
  // ==========================================
  async getDocumentById(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const documentId = parseInt(req.params.id);
      const document = await AIPolicyDocument.findById(documentId);

      if (!document) {
        return responseHelper.error(res, 'Document not found', 404);
      }

      return responseHelper.success(res, {
        document: document
      }, 'Policy document retrieved successfully');

    } catch (error) {
      console.error('Get document error:', error);
      return responseHelper.error(res, 'Failed to retrieve document', 500);
    }
  }

  // ==========================================
  // UPDATE POLICY DOCUMENT
  // ==========================================
  async updateDocument(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const documentId = parseInt(req.params.id);
      const document = await AIPolicyDocument.findById(documentId);

      if (!document) {
        return responseHelper.error(res, 'Document not found', 404);
      }

      // Update document metadata (not the file itself)
      const updateData = {
        description: req.body.description || document.description,
        accessLevel: req.body.accessLevel || document.accessLevel,
        departmentSpecific: req.body.departmentSpecific !== undefined ? 
          parseInt(req.body.departmentSpecific) : document.departmentSpecific,
        tags: req.body.tags || document.tags
      };

      // Note: This would require implementing an update method in AIPolicyDocument
      // For now, we'll return the current document
      return responseHelper.success(res, {
        document: document
      }, 'Policy document updated successfully');

    } catch (error) {
      console.error('Update document error:', error);
      return responseHelper.error(res, 'Failed to update document', 500);
    }
  }

  // ==========================================
  // DELETE POLICY DOCUMENT
  // ==========================================
  async deleteDocument(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const documentId = parseInt(req.params.id);
      const deletionInfo = await this.documentService.deleteDocument(documentId);

      return responseHelper.success(res, {
        deletionInfo: deletionInfo
      }, 'Policy document deleted successfully');

    } catch (error) {
      console.error('Delete document error:', error);
      return responseHelper.error(res, 'Failed to delete document', 500);
    }
  }

  // ==========================================
  // REPROCESS POLICY DOCUMENT
  // ==========================================
  async reprocessDocument(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const documentId = parseInt(req.params.id);
      const document = await this.documentService.reprocessDocument(documentId);

      return responseHelper.success(res, {
        document: document
      }, 'Document reprocessing started');

    } catch (error) {
      console.error('Reprocess document error:', error);
      return responseHelper.error(res, 'Failed to reprocess document', 500);
    }
  }

  // ==========================================
  // GET PROCESSING STATISTICS
  // ==========================================
  async getProcessingStats(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return responseHelper.error(res, 'Access denied. Admin role required.', 403);
      }

      const statsData = await this.documentService.getProcessingStats();
      const storageStatus = this.documentService.getStorageStatus();

      return responseHelper.success(res, {
        stats: statsData?.stats || {},
        storageStats: statsData?.storageStats || {},
        storageStatus: storageStatus
      }, 'Processing statistics retrieved successfully');

    } catch (error) {
      console.error('Get stats error:', error);
      return responseHelper.error(res, 'Failed to retrieve statistics', 500);
    }
  }
}

module.exports = new PolicyDocumentController();
