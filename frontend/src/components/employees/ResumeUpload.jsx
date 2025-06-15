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
        return <Loader2 className="h-4 w-4 animate-spin text-white" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-white" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-white" />;
      default:
        return <Sparkles className="h-4 w-4 text-white" />;
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
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 pointer-events-none rounded-lg" />

      <Card className="relative z-10 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-100/60 to-purple-100/60 border-b border-gray-200/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Resume Upload
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-sm">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI Powered
                  </Badge>
                  <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shadow-sm">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Ready</span>
                  </div>
                </div>
              </div>
            </div>
            {uploadState === 'success' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-gray-500 hover:text-gray-700 hover:bg-white/50 transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4 p-4">
        {/* Upload Area */}
        {uploadState === 'idle' && !selectedFile && (
          <div
            className="group relative border-2 border-dashed border-blue-300/50 rounded-xl p-8 text-center hover:border-purple-400/70 transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50/30 to-purple-50/30 hover:from-blue-50/50 hover:to-purple-50/50 backdrop-blur-sm"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mx-auto mb-4 w-fit group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Upload Your Resume
              </h3>
              <p className="text-gray-600 mb-2 leading-relaxed">
                Drag & drop your resume here, or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supports PDF and Word documents (max 5MB)
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>AI will extract information automatically</span>
              </div>
            </div>
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
          <div className="group p-4 bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-xl border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mr-3 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI processing
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parse Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  size="sm"
                  className="border-gray-300 hover:bg-white/50 hover:border-gray-400 transition-all duration-300"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        {(uploadState === 'uploading' || uploadState === 'parsing') && (
          <div className="p-4 bg-gradient-to-r from-blue-50/60 to-purple-50/60 rounded-xl border border-blue-200/50 shadow-md backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  {getStateIcon()}
                </div>
                <div>
                  <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {getStateMessage()}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadState === 'uploading' ? 'Uploading file to server...' : 'AI is analyzing your resume...'}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full h-2 bg-gray-200/50" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{uploadProgress}% complete</span>
                  <span>{uploadState === 'parsing' ? 'Processing with AI...' : 'Uploading...'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && parseResults && (
          <div className="p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl border border-green-200/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-1">
                  🎉 AI resume parsed successfully!
                </h4>
                <p className="text-sm text-green-700 mb-3 leading-relaxed">
                  Form fields have been automatically populated with extracted information.
                  Review and modify as needed before submitting.
                </p>

                {/* Confidence Display */}
                <div className="bg-white/60 rounded-lg p-3 border border-green-200/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-green-700">AI Confidence Score</span>
                    <span className="text-xs font-bold text-green-800">
                      {Math.round(confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    {confidence >= 0.8 ? '✨ High confidence - Data looks accurate' :
                     confidence >= 0.6 ? '⚡ Good confidence - Please review extracted data' :
                     '⚠️ Low confidence - Manual review recommended'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <div className="p-4 bg-gradient-to-r from-red-50/80 to-pink-50/80 rounded-xl border border-red-200/50 shadow-lg backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 shadow-lg">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 mb-1">
                  Upload Failed
                </h4>
                <p className="text-sm text-red-700 mb-3 leading-relaxed">
                  {errorMessage}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-red-600 border-red-300 hover:bg-red-50/50 hover:border-red-400 transition-all duration-300"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {uploadState === 'idle' && !selectedFile && (
          <div className="text-center py-2">
            <p className="text-sm text-gray-500 leading-relaxed">
              {getStateMessage()}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default ResumeUpload;
