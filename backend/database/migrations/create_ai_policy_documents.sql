-- =============================================
-- AI Policy Documents Table for RAG Chatbot
-- =============================================
-- This table stores metadata about HR policy documents
-- The actual document content and embeddings are stored in Pinecone

CREATE TABLE IF NOT EXISTS ai_policy_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Document Information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  
  -- Document Classification
  document_type ENUM(
    'leave_policy', 
    'attendance_policy', 
    'benefits_policy', 
    'employee_handbook', 
    'code_of_conduct',
    'hr_procedures',
    'company_policies',
    'other'
  ) NOT NULL DEFAULT 'other',
  
  -- Processing Information
  total_chunks INT DEFAULT 0,
  processing_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT NULL,
  
  -- Vector Database References
  pinecone_namespace VARCHAR(100) NULL,
  vector_ids JSON NULL, -- Array of Pinecone vector IDs for this document
  
  -- Metadata
  description TEXT NULL,
  tags JSON NULL, -- Array of tags for categorization
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Access Control
  access_level ENUM('public', 'employee', 'manager', 'admin') DEFAULT 'employee',
  department_specific INT NULL, -- Reference to departments table if document is department-specific
  
  -- Audit Fields
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_document_type (document_type),
  INDEX idx_processing_status (processing_status),
  INDEX idx_access_level (access_level),
  INDEX idx_is_active (is_active),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_created_at (created_at),
  
  -- Foreign Key Constraints
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_specific) REFERENCES departments(id) ON DELETE SET NULL
);

-- =============================================
-- Sample Data for Testing
-- =============================================
-- Insert some sample policy document records for testing
-- (These would be created when actual documents are uploaded)

INSERT INTO ai_policy_documents (
  filename, original_filename, file_path, file_size, mime_type,
  document_type, description, access_level, uploaded_by
) VALUES 
(
  'leave_policy_2025.pdf', 
  'Company Leave Policy 2025.pdf',
  '/uploads/policies/leave_policy_2025.pdf',
  1024000,
  'application/pdf',
  'leave_policy',
  'Comprehensive leave policy including annual leave, sick leave, maternity/paternity leave, and emergency leave procedures.',
  'employee',
  1
),
(
  'employee_handbook_2025.pdf',
  'Employee Handbook 2025.pdf', 
  '/uploads/policies/employee_handbook_2025.pdf',
  2048000,
  'application/pdf',
  'employee_handbook',
  'Complete employee handbook covering company culture, policies, procedures, and guidelines.',
  'employee',
  1
),
(
  'benefits_policy_2025.pdf',
  'Employee Benefits Policy 2025.pdf',
  '/uploads/policies/benefits_policy_2025.pdf',
  1536000,
  'application/pdf',
  'benefits_policy',
  'Detailed information about health insurance, retirement plans, wellness programs, and other employee benefits.',
  'employee',
  1
);

-- =============================================
-- Indexes for Performance Optimization
-- =============================================

-- Composite index for common queries
CREATE INDEX idx_type_status_active ON ai_policy_documents (document_type, processing_status, is_active);

-- Index for search queries
CREATE INDEX idx_filename_search ON ai_policy_documents (filename, original_filename);

-- Index for access control queries
CREATE INDEX idx_access_department ON ai_policy_documents (access_level, department_specific);
