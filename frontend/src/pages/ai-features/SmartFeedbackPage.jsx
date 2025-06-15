import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Sparkles, 
  User, 
  Brain, 
  Send, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
  Save,
  X
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { canAccessSmartFeedback, getSmartFeedbackAccessDeniedMessage } from '@/utils/roleUtils';
import smartFeedbackService from '@/services/smartFeedbackService';
import employeeService from '@/services/employeeService';
import { formatDate } from '@/utils/dateUtils';

const SmartFeedbackPage = () => {
  const { user } = useAuth();

  // State management
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [feedbackType, setFeedbackType] = useState('');
  const [performanceData, setPerformanceData] = useState({
    attendanceRate: '',
    goalsCompleted: '',
    totalGoals: '',
    peerRatings: '',
    managerRating: '',
    projectsCompleted: '',
    trainingHours: '',
    performanceScore: ''
  });
  const [generatedFeedback, setGeneratedFeedback] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState('');
  const [isSending, setIsSending] = useState(false); // ✅ NEW: Add sending state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Callback functions
  const loadEmployees = useCallback(async () => {
    try {
      const response = await employeeService.getEmployees({ limit: 100 });
      console.log('Employee service response:', response);

      // Handle the expected response structure: { success: true, data: { employees: [...] } }
      if (response?.success && response?.data?.employees) {
        setEmployees(response.data.employees);
      } else {
        console.warn('Unexpected response structure:', response);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setError('Failed to load employees');
      setEmployees([]);
    }
  }, []);

  const loadFeedbackHistory = useCallback(async () => {
    if (!selectedEmployee) return;

    setLoadingHistory(true);
    try {
      const response = await smartFeedbackService.getFeedbackHistory(selectedEmployee.id, { limit: 5 });
      setFeedbackHistory(response.data || []);
    } catch (error) {
      console.error('Error loading feedback history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, [selectedEmployee]);

  // Effects
  useEffect(() => {
    if (canAccessSmartFeedback(user?.role)) {
      loadEmployees();
    }
  }, [user?.role, loadEmployees]);

  useEffect(() => {
    if (selectedEmployee && canAccessSmartFeedback(user?.role)) {
      loadFeedbackHistory();
    }
  }, [selectedEmployee, user?.role, loadFeedbackHistory]);

  // Check access permissions
  if (!canAccessSmartFeedback(user?.role)) {
    const accessDenied = getSmartFeedbackAccessDeniedMessage();
    return (
      <div className="container mx-auto p-6 h-[calc(100vh-4rem)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">{accessDenied.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-2">{accessDenied.message}</p>
            <p className="text-sm text-muted-foreground">{accessDenied.description}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleGenerateFeedback = async () => {
    if (!selectedEmployee || !feedbackType) {
      setError('Please select an employee and feedback type');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const feedbackData = {
        employeeId: selectedEmployee.id,
        feedbackType,
        performanceData: smartFeedbackService.formatPerformanceData(performanceData)
      };

      const validation = smartFeedbackService.validateFeedbackData(feedbackData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      const response = await smartFeedbackService.generateSmartFeedback(feedbackData);
      console.log('Smart feedback response:', response);

      // Handle the expected response structure: { success: true, data: { feedback: {...} } }
      const feedbackResult = response.data?.feedback || response.data;
      setGeneratedFeedback(feedbackResult);
      setEditedFeedback(feedbackResult.generatedFeedback || '');
      setSuccess('Smart feedback generated successfully!');
      
      // Reload feedback history
      loadFeedbackHistory();
    } catch (error) {
      console.error('Error generating feedback:', error);
      setError(error.message || 'Failed to generate feedback');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFeedback = () => {
    if (generatedFeedback) {
      setGeneratedFeedback({
        ...generatedFeedback,
        generatedFeedback: editedFeedback
      });
      setIsEditing(false);
      setSuccess('Feedback updated successfully!');
    }
  };

  const handleAcceptAndSend = async () => {
    try {
      setIsSending(true); // ✅ NEW: Set sending state
      setError(null);
      setSuccess(null);

      // If feedback was edited, save the changes and send email
      if (generatedFeedback?.id && (isEditing || editedFeedback !== generatedFeedback?.generatedFeedback)) {
        const finalFeedback = editedFeedback || generatedFeedback.generatedFeedback;

        try {
          // ✅ NEW: Pass sendEmail=true to trigger email
          const response = await smartFeedbackService.updateSmartFeedback(generatedFeedback.id, {
            generatedFeedback: finalFeedback,
            performanceData: generatedFeedback.performanceData,
            suggestions: generatedFeedback.suggestions,
            confidence: generatedFeedback.confidence
          }, true); // ✅ sendEmail = true

          // Update local state
          setGeneratedFeedback({
            ...generatedFeedback,
            generatedFeedback: finalFeedback
          });
          setIsEditing(false);

          // ✅ NEW: Check email result
          if (response.data?.emailSent) {
            setSuccess('✅ Feedback sent to employee via email! They will receive it shortly.');
          } else {
            setSuccess('✅ Feedback updated but email could not be sent. Please contact the employee directly.');
          }

        } catch (updateError) {
          console.error('Could not send feedback:', updateError);
          setError('Failed to send feedback. Please try again.');
          return;
        }
      } else {
        // If no edits were made, still need to send email
        if (generatedFeedback?.id) {
          try {
            const response = await smartFeedbackService.updateSmartFeedback(generatedFeedback.id, {
              generatedFeedback: generatedFeedback.generatedFeedback,
              performanceData: generatedFeedback.performanceData,
              suggestions: generatedFeedback.suggestions,
              confidence: generatedFeedback.confidence
            }, true); // ✅ sendEmail = true

            if (response.data?.emailSent) {
              setSuccess('✅ Feedback sent to employee via email! They will receive it shortly.');
            } else {
              setSuccess('✅ Feedback processed but email could not be sent. Please contact the employee directly.');
            }
          } catch (emailError) {
            console.error('Could not send feedback email:', emailError);
            setError('Failed to send feedback email. Please try again.');
            return;
          }
        }
      }

      // Reset form for next feedback
      setTimeout(() => {
        setSelectedEmployee(null);
        setFeedbackType('');
        setPerformanceData({
          attendanceRate: '',
          goalsCompleted: '',
          totalGoals: '',
          peerRatings: '',
          managerRating: '',
          projectsCompleted: '',
          trainingHours: '',
          performanceScore: ''
        });
        setGeneratedFeedback(null);
        setEditedFeedback('');
        setSuccess(null);
      }, 3000); // Clear form after 3 seconds

    } catch (error) {
      console.error('Error sending feedback:', error);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSending(false); // ✅ Reset sending state
    }
  };

  const feedbackTypes = smartFeedbackService.getFeedbackTypes();

  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 overflow-hidden -m-6">
      <div className="h-full p-3 md:p-6">
        <Card className="h-full flex flex-col bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          {/* Fixed Header */}
          <CardHeader className="pb-4 pt-4 bg-gradient-to-r from-blue-100/60 to-purple-100/60 border-b border-gray-200/50 shrink-0">
            <CardTitle className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    Smart Feedback
                  </h1>
                  <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 border border-purple-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
                <p className="text-sm md:text-base text-gray-600 truncate">
                  Generate AI-powered feedback for your team members • Hello {user?.name || 'Manager'}! 👋
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          {/* Scrollable Content */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="h-full flex">
              {/* Left Panel - Form */}
              <div className="w-1/2 border-r border-gray-200/50 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-gray-800">Select Employee</label>
                    <Select value={selectedEmployee?.id?.toString() || ''} onValueChange={(value) => {
                      if (value && value !== 'no-employees') {
                        const employee = Array.isArray(employees) ? employees.find(emp => emp.id === parseInt(value)) : null;
                        setSelectedEmployee(employee);
                      }
                    }}>
                      <SelectTrigger className="w-full hrms-select-shadow">
                        <SelectValue placeholder="Select an employee to provide feedback..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(employees) && employees.length > 0 ? (
                          employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="font-medium">
                                  {employee.firstName} {employee.lastName}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-employees" disabled>
                            <div className="flex items-center gap-2 text-gray-500">
                              <span>⚠️</span>
                              No employees available
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>



                  {/* Feedback Type */}
                  <div className="space-y-2">
                    <label className="text-lg font-bold text-gray-800">Feedback Type</label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger className="w-full hrms-select-shadow text-left">
                        <SelectValue placeholder="Choose the type of feedback to generate..." className="text-left" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="py-1">
                              <div className="font-medium text-gray-900">{type.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Performance Data Inputs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">Performance Data</h3>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">Optional</Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Attendance Rate (%)</label>
                          <input
                            type="number"
                            className="hrms-input-shadow"
                            value={performanceData.attendanceRate}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, attendanceRate: e.target.value }))}
                            placeholder="e.g., 95"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Goals Completed</label>
                          <input
                            type="number"
                            className="hrms-input-shadow"
                            value={performanceData.goalsCompleted}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, goalsCompleted: e.target.value }))}
                            placeholder="e.g., 8"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Total Goals</label>
                          <input
                            type="number"
                            className="hrms-input-shadow"
                            value={performanceData.totalGoals}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, totalGoals: e.target.value }))}
                            placeholder="e.g., 10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Peer Rating (1-5)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            className="hrms-input-shadow"
                            value={performanceData.peerRatings}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, peerRatings: e.target.value }))}
                            placeholder="e.g., 4.2"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Generate Button Section */}
                  <div className="space-y-3">
                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateFeedback}
                      disabled={!selectedEmployee || !feedbackType || isGenerating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating AI Feedback...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate AI Feedback
                        </>
                      )}
                    </Button>

                    {(!selectedEmployee || !feedbackType) && (
                      <p className="text-xs text-gray-500 text-center">
                        Complete the required fields above to generate feedback
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Results */}
              <div className="w-1/2 p-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 shadow-inner">
                {/* Status Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                {/* Instructions and Placeholder when no feedback generated */}
                {!generatedFeedback && !isGenerating && (
                  <div className="space-y-6">
                    {/* How to Generate AI Feedback Instructions */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">How to Generate AI Feedback</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0">1</span>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">Select an employee from your team</h4>
                            <p className="text-sm text-gray-600">Choose the team member you want to provide feedback for</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0">2</span>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">Choose the type of feedback you want to provide</h4>
                            <p className="text-sm text-gray-600">Select from performance review, goal setting, or other feedback types</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0">3</span>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">Optional: Add performance data for more personalized feedback</h4>
                            <p className="text-sm text-gray-600">Include specific metrics to make the feedback more targeted and accurate</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg flex-shrink-0">4</span>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1">Click "Generate AI Feedback" and review the results</h4>
                            <p className="text-sm text-gray-600">AI will create personalized feedback that you can edit and customize</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tips Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">💡</span>
                        <h4 className="text-lg font-bold text-gray-800">Tips for Better Feedback</h4>
                      </div>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-800">Leave performance data empty</strong> if you don't have specific metrics - AI will generate general feedback
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-800">Fill some performance fields</strong> for more targeted feedback based on actual data
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-800">Attendance:</strong> Employee's attendance percentage (0-100)
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-800">Goals:</strong> Number of completed vs total assigned goals
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                          <div>
                            <strong className="text-gray-800">Peer Rating:</strong> Average rating from team members (1-5 scale)
                          </div>
                        </li>
                      </ul>
                    </div>

                    {/* What You'll Get Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-200/50">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">What You'll Get:</h4>
                      <ul className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span>Personalized feedback based on employee data</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>AI-generated suggestions for improvement</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          <span>Professional, constructive feedback tone</span>
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span>Ability to edit and customize before sending</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isGenerating && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Loader2 className="h-10 w-10 text-white animate-spin" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Generating Feedback...</h3>
                      <p className="text-gray-600 text-lg">
                        Our AI is analyzing the employee data and creating personalized feedback. This may take a few moments.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generated Feedback */}
                {generatedFeedback && (
                  <div className="space-y-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-200/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-800">Generated Feedback</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Confidence: {Math.round((generatedFeedback.confidence || 0) * 100)}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editedFeedback}
                            onChange={(e) => setEditedFeedback(e.target.value)}
                            className="min-h-[120px] hrms-textarea-shadow"
                            placeholder="Edit the feedback..."
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveFeedback}>
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 leading-relaxed">{generatedFeedback.generatedFeedback}</p>
                      )}
                    </div>

                    {/* Suggestions */}
                    {generatedFeedback.suggestions && generatedFeedback.suggestions.length > 0 && (
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-200/50">
                        <h3 className="font-medium text-gray-800 mb-3">AI Suggestions</h3>
                        <ul className="space-y-2">
                          {generatedFeedback.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={handleAcceptAndSend}
                        disabled={isSending}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending Email...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Accept & Send Email
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        disabled={isSending}
                        onClick={() => {
                          setGeneratedFeedback(null);
                          setEditedFeedback('');
                          setIsEditing(false);
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                {/* Feedback History */}
                {selectedEmployee && (
                  <div className="mt-6">
                    <Separator className="mb-4" />
                    <h3 className="font-medium text-gray-800 mb-3">Recent Feedback History</h3>
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : feedbackHistory.length > 0 ? (
                      <div className="space-y-3">
                        {feedbackHistory.map((feedback, index) => (
                          <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200/50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {feedback.feedbackType}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(feedback.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {feedback.generatedFeedback}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No previous feedback found for this employee.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartFeedbackPage;
