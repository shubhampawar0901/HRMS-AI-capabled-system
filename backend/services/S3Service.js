const AWS = require('aws-sdk');
const path = require('path');

class S3Service {
  constructor() {
    // Configure AWS SDK
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    this.s3 = new AWS.S3();
    this.bucket = process.env.AWS_S3_BUCKET;
    this.folderPrefix = process.env.S3_FOLDER_PREFIX || 'launchpad/hrms/policy-documents/';
    this.baseUrl = process.env.S3_URL;
    this.enabled = process.env.S3_ENABLED === 'true';
  }

  /**
   * Check if S3 is enabled and configured
   */
  isEnabled() {
    return this.enabled && this.bucket && process.env.AWS_ACCESS_KEY_ID;
  }

  /**
   * Generate S3 key for a file
   */
  generateS3Key(filename, documentType) {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${this.folderPrefix}${documentType}/${timestamp}_${sanitizedFilename}`;
  }

  /**
   * Upload file buffer to S3
   */
  async uploadFile(fileBuffer, filename, mimeType, documentType) {
    if (!this.isEnabled()) {
      throw new Error('S3 service is not enabled or configured');
    }

    try {
      const s3Key = this.generateS3Key(filename, documentType);
      
      const uploadParams = {
        Bucket: this.bucket,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: mimeType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          'original-filename': filename,
          'document-type': documentType,
          'upload-timestamp': Date.now().toString()
        }
      };

      console.log(`📤 Uploading to S3: ${s3Key}`);
      const result = await this.s3.upload(uploadParams).promise();

      const s3Url = result.Location;
      
      console.log(`✅ S3 upload successful: ${s3Url}`);
      
      return {
        success: true,
        s3Url: s3Url,
        s3Key: s3Key,
        bucket: this.bucket,
        size: fileBuffer.length
      };

    } catch (error) {
      console.error('❌ S3 upload failed:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(s3Key) {
    if (!this.isEnabled()) {
      console.warn('S3 service is not enabled, skipping delete');
      return { success: false, reason: 'S3 not enabled' };
    }

    try {
      const deleteParams = {
        Bucket: this.bucket,
        Key: s3Key
      };

      await this.s3.deleteObject(deleteParams).promise();
      console.log(`🗑️  S3 file deleted: ${s3Key}`);
      
      return { success: true };

    } catch (error) {
      console.error('❌ S3 delete failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract S3 key from S3 URL
   */
  extractS3KeyFromUrl(s3Url) {
    if (!s3Url || !s3Url.includes(this.bucket)) {
      return null;
    }

    try {
      const url = new URL(s3Url);
      // Remove leading slash
      return url.pathname.substring(1);
    } catch (error) {
      console.error('Error extracting S3 key from URL:', error);
      return null;
    }
  }

  /**
   * Check if a URL is an S3 URL
   */
  isS3Url(url) {
    return url && (
      url.includes(this.bucket) || 
      url.includes('s3.amazonaws.com') ||
      url.startsWith(this.baseUrl)
    );
  }

  /**
   * Get file info from S3
   */
  async getFileInfo(s3Key) {
    if (!this.isEnabled()) {
      throw new Error('S3 service is not enabled');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: s3Key
      };

      const result = await this.s3.headObject(params).promise();
      
      return {
        exists: true,
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        metadata: result.Metadata
      };

    } catch (error) {
      if (error.code === 'NotFound') {
        return { exists: false };
      }
      throw error;
    }
  }

  /**
   * Generate presigned URL for secure file access
   */
  async getPresignedUrl(s3Key, expiresIn = 3600) {
    if (!this.isEnabled()) {
      throw new Error('S3 service is not enabled');
    }

    try {
      const params = {
        Bucket: this.bucket,
        Key: s3Key,
        Expires: expiresIn // URL expires in 1 hour by default
      };

      const url = await this.s3.getSignedUrlPromise('getObject', params);
      return url;

    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  /**
   * Get S3 service status
   */
  getStatus() {
    return {
      enabled: this.isEnabled(),
      bucket: this.bucket,
      region: process.env.AWS_REGION,
      folderPrefix: this.folderPrefix,
      baseUrl: this.baseUrl,
      configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    };
  }
}

module.exports = S3Service;
