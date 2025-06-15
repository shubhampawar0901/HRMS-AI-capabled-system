import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Sparkles,
  X
} from 'lucide-react';
import { aiService } from '@/services/aiService';

const ResumeUpload = ({ onParseSuccess, onError }) => {
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, parsing, success, error
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResults, setParseResults] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload PDF or Word documents only.');
    }
    if (file.size > maxFileSize) {
      throw new Error('File size too large. Please upload files smaller than 5MB.');
    }
  };

  const handleFileSelect = (file) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      setErrorMessage('');
      setUploadState('idle');
    } catch (error) {
      setErrorMessage(error.message);
      setUploadState('error');
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState('uploading');
      setUploadProgress(0);
      setErrorMessage('');

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      setUploadState('parsing');
      setUploadProgress(100);

      const result = await aiService.parseResume(selectedFile);
      
      if (result.success) {
        setParseResults(result.data.parsedData);
        setConfidence(result.data.confidence);
        setUploadState('success');
        
        // Call parent callback with parsed data
        if (onParseSuccess) {
          onParseSuccess(result.data.parsedData, result.data.confidence);
        }
      } else {
        throw new Error(result.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      setErrorMessage(error.message || 'Failed to parse resume. Please try again.');
      setUploadState('error');
      
      if (onError) {
        onError(error.message);
      }
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setParseResults(null);
    setConfidence(0);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStateIcon = () => {
    switch (uploadState) {
      case 'uploading':
      case 'parsing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-600" />;
    }
  };

  const getStateMessage = () => {
    switch (uploadState) {
      case 'uploading':
        return 'Uploading resume...';
      case 'parsing':
        return 'AI is extracting information...';
      case 'success':
        return 'Resume parsed successfully!';
      case 'error':
        return errorMessage;
      default:
        return 'Upload a resume to auto-populate form fields';
    }
  };

  const getConfidenceColor = () => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="hrms-card border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Resume Upload
            <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
              AI Powered
            </Badge>
          </div>
          {uploadState === 'success' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {uploadState === 'idle' && !selectedFile && (
          <div
            className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag & drop your resume here, or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF and Word documents (max 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Selected File */}
        {selectedFile && uploadState === 'idle' && (
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleUpload}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Parse Resume
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                size="sm"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* Progress */}
        {(uploadState === 'uploading' || uploadState === 'parsing') && (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {getStateIcon()}
              <span className="text-sm font-medium text-gray-700">
                {getStateMessage()}
              </span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && parseResults && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <div className="ml-2">
              <p className="font-medium text-green-800">AI resume parsed successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Form fields have been automatically populated with extracted information.
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-green-600 mr-2">Confidence:</span>
                <div className="flex items-center">
                  <div className={`h-2 w-16 rounded-full ${getConfidenceColor()}`}>
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${(1 - confidence) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-green-600 ml-2">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </Alert>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="ml-2">
              <p className="font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </Alert>
        )}

        {/* Status Message */}
        {uploadState === 'idle' && !selectedFile && (
          <p className="text-sm text-gray-500 text-center">
            {getStateMessage()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
