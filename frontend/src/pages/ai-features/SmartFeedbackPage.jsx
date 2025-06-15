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

  const handleAcceptAndSend = () => {
    // In a real implementation, this would send the feedback to the employee
    setSuccess('Feedback accepted and sent to employee!');
    // Reset form
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
                {/* Workflow Guide */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    <h3 className="font-semibold text-blue-900">How to Generate AI Feedback</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>Select an employee from your team</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Choose the type of feedback you want to provide</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span><strong>Optional:</strong> Add performance data for more personalized feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                      <span>Click "Generate AI Feedback" and review the results</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <label className="text-sm font-medium text-gray-700">Select Employee</label>
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">Choose the team member you want to provide feedback for</p>
                    <Select value={selectedEmployee?.id?.toString() || ''} onValueChange={(value) => {
                      if (value && value !== 'no-employees') {
                        const employee = Array.isArray(employees) ? employees.find(emp => emp.id === parseInt(value)) : null;
                        setSelectedEmployee(employee);
                      }
                    }}>
                      <SelectTrigger className="w-full shadow-sm hover:shadow-md transition-all duration-300">
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
                                <div>
                                  <div className="font-medium">
                                    {employee.firstName} {employee.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {employee.position} • {employee.department}
                                  </div>
                                </div>
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

                  {/* Selected Employee Display */}
                  {selectedEmployee && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 text-lg">
                            {selectedEmployee.firstName} {selectedEmployee.lastName}
                          </h4>
                          <p className="text-sm text-blue-700">
                            {selectedEmployee.position} • {selectedEmployee.department}
                          </p>
                          <p className="text-xs text-blue-600">
                            Employee ID: {selectedEmployee.employeeCode || selectedEmployee.id}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                          ✓ Selected
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* No Selection Placeholder */}
                  {!selectedEmployee && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-medium text-gray-700 mb-1">No Employee Selected</h4>
                      <p className="text-sm text-gray-500">
                        Please select an employee from the dropdown above to generate feedback
                      </p>
                    </div>
                  )}

                  {/* Feedback Type */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <label className="text-sm font-medium text-gray-700">Feedback Type</label>
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">What kind of feedback do you want to provide?</p>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger className="w-full shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Choose the type of feedback to generate..." />
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
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <h3 className="text-sm font-medium text-gray-700">Performance Data</h3>
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    </div>
                    <p className="text-xs text-gray-600 ml-8">Add specific performance metrics to make the feedback more detailed and accurate</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Attendance Rate (%)</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={performanceData.attendanceRate}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, attendanceRate: e.target.value }))}
                            placeholder="e.g., 95"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Goals Completed</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={performanceData.goalsCompleted}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, goalsCompleted: e.target.value }))}
                            placeholder="e.g., 8"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Total Goals</label>
                          <input
                            type="number"
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={performanceData.peerRatings}
                            onChange={(e) => setPerformanceData(prev => ({ ...prev, peerRatings: e.target.value }))}
                            placeholder="e.g., 4.2"
                          />
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-600 text-sm">💡</span>
                          <div className="text-xs text-blue-800">
                            <p className="font-medium mb-1">Tips for better feedback:</p>
                            <ul className="space-y-1 text-blue-700">
                              <li>• <strong>Leave empty</strong> if you don't have specific data - AI will generate general feedback</li>
                              <li>• <strong>Fill some fields</strong> for more targeted feedback based on actual performance</li>
                              <li>• <strong>Attendance:</strong> Employee's attendance percentage (0-100)</li>
                              <li>• <strong>Goals:</strong> Number of completed vs total assigned goals</li>
                              <li>• <strong>Peer Rating:</strong> Average rating from team members (1-5 scale)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Generate Button Section */}
                  <div className="space-y-3">
                    {/* Status Check */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ready to Generate?</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          {selectedEmployee ? (
                            <span className="text-green-600">✅ Employee selected</span>
                          ) : (
                            <span className="text-red-600">❌ Please select an employee</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {feedbackType ? (
                            <span className="text-green-600">✅ Feedback type chosen</span>
                          ) : (
                            <span className="text-red-600">❌ Please choose feedback type</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">ℹ️ Performance data is optional</span>
                        </div>
                      </div>
                    </div>

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
              <div className="w-1/2 p-6 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
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

                {/* Placeholder when no feedback generated */}
                {!generatedFeedback && !isGenerating && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">AI Feedback Generator</h3>
                      <p className="text-gray-600 mb-4">
                        Complete the form on the left and click "Generate AI Feedback" to create personalized feedback for your team member.
                      </p>
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50">
                        <h4 className="font-medium text-gray-800 mb-2">What you'll get:</h4>
                        <ul className="text-sm text-gray-600 space-y-1 text-left">
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Personalized feedback based on employee data
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            AI-generated suggestions for improvement
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Professional, constructive feedback tone
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            Ability to edit and customize before sending
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isGenerating && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Feedback...</h3>
                      <p className="text-gray-600">
                        Our AI is analyzing the employee data and creating personalized feedback. This may take a few moments.
                      </p>
                    </div>
                  </div>
                )}

                {/* Generated Feedback */}
                {generatedFeedback && (
                  <div className="space-y-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200/50">
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
                            className="min-h-[120px]"
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
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-gray-200/50">
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
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Accept & Send
                      </Button>
                      <Button
                        variant="outline"
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
                          <div key={index} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50">
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
