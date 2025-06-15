/**
 * Detection Progress Modal Component
 * Shows progress during AI anomaly detection with animated indicators
 * 
 * Features:
 * - Animated progress bar with smooth transitions
 * - AI-themed visual design with brain icon animation
 * - Step-by-step progress indicators
 * - Cannot be closed during detection (modal overlay)
 * - Mobile-responsive design
 * - Smooth animations and transitions
 */

import React, { useState, useEffect } from 'react';
import { Brain, Activity, Search, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Progress Step Component
 */
const ProgressStep = React.memo(({ 
  step, 
  currentProgress, 
  icon: Icon, 
  label, 
  description 
}) => {
  const isActive = currentProgress >= step.start && currentProgress < step.end;
  const isCompleted = currentProgress >= step.end;
  
  return (
    <div className={`
      flex items-center space-x-3 p-3 rounded-lg transition-all duration-500
      ${isActive ? 'bg-blue-50 border border-blue-200' : ''}
      ${isCompleted ? 'bg-green-50 border border-green-200' : ''}
    `}>
      <div className={`
        p-2 rounded-full transition-all duration-500
        ${isActive ? 'bg-blue-100 text-blue-600' : ''}
        ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}
      `}>
        {isCompleted ? (
          <CheckCircle className="w-5 h-5" />
        ) : isActive ? (
          <Icon className="w-5 h-5 animate-pulse" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      
      <div className="flex-1">
        <h4 className={`
          text-sm font-medium transition-colors duration-500
          ${isActive ? 'text-blue-900' : ''}
          ${isCompleted ? 'text-green-900' : 'text-gray-600'}
        `}>
          {label}
        </h4>
        <p className={`
          text-xs transition-colors duration-500
          ${isActive ? 'text-blue-700' : ''}
          ${isCompleted ? 'text-green-700' : 'text-gray-500'}
        `}>
          {description}
        </p>
      </div>
      
      {isActive && (
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      )}
    </div>
  );
});

ProgressStep.displayName = 'ProgressStep';

/**
 * Animated Progress Bar Component
 */
const AnimatedProgressBar = React.memo(({ progress }) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out relative"
        style={{ width: `${displayProgress}%` }}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>
    </div>
  );
});

AnimatedProgressBar.displayName = 'AnimatedProgressBar';

/**
 * Main Detection Progress Modal Component
 */
const DetectionProgressModal = React.memo(({ isOpen, progress, onClose }) => {
  const [animationPhase, setAnimationPhase] = useState(0);

  // Define detection steps
  const detectionSteps = [
    {
      start: 0,
      end: 20,
      icon: Search,
      label: "Gathering Data",
      description: "Collecting attendance records and patterns"
    },
    {
      start: 20,
      end: 50,
      icon: Brain,
      label: "AI Analysis",
      description: "Processing data with machine learning algorithms"
    },
    {
      start: 50,
      end: 80,
      icon: Activity,
      label: "Pattern Recognition",
      description: "Identifying unusual attendance behaviors"
    },
    {
      start: 80,
      end: 100,
      icon: CheckCircle,
      label: "Finalizing Results",
      description: "Generating insights and recommendations"
    }
  ];

  // Animation phases for the brain icon
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Get current step
  const getCurrentStep = () => {
    return detectionSteps.find(step => 
      progress >= step.start && progress < step.end
    ) || detectionSteps[detectionSteps.length - 1];
  };

  const currentStep = getCurrentStep();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="ai-glass-container max-w-md w-full p-8 text-center ai-scale-in">
          
          {/* Animated Brain Icon */}
          <div className="relative mb-6">
            <div className={`
              w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
              flex items-center justify-center mx-auto transition-all duration-1000
              ${animationPhase % 2 === 0 ? 'scale-110' : 'scale-100'}
            `}>
              <Brain className={`
                w-10 h-10 text-white transition-all duration-500
                ${animationPhase % 2 === 0 ? 'animate-pulse' : ''}
              `} />
            </div>
            
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-20" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-400 animate-ping opacity-30" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">
            AI Analysis in Progress
          </h2>
          
          <p className="text-blue-100 mb-6">
            Our AI is analyzing attendance patterns to detect anomalies...
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-100">
                {currentStep.label}
              </span>
              <span className="text-sm font-medium text-blue-100">
                {Math.round(progress)}%
              </span>
            </div>
            <AnimatedProgressBar progress={progress} />
          </div>

          {/* Detection Steps */}
          <div className="space-y-3 mb-6">
            {detectionSteps.map((step, index) => (
              <ProgressStep
                key={index}
                step={step}
                currentProgress={progress}
                icon={step.icon}
                label={step.label}
                description={step.description}
              />
            ))}
          </div>

          {/* Current Status */}
          <div className="p-4 bg-white/10 rounded-lg border border-white/20">
            <p className="text-sm text-blue-100 leading-relaxed">
              {progress < 20 && "Scanning attendance records and employee data..."}
              {progress >= 20 && progress < 50 && "Running machine learning algorithms to identify patterns..."}
              {progress >= 50 && progress < 80 && "Analyzing behavioral patterns and detecting anomalies..."}
              {progress >= 80 && "Generating actionable insights and recommendations..."}
            </p>
          </div>

          {/* Estimated Time */}
          <div className="mt-4 text-xs text-blue-200">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <p className="mt-2">
              Estimated time remaining: {Math.max(0, Math.ceil((100 - progress) / 10))} seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

DetectionProgressModal.displayName = 'DetectionProgressModal';

export default DetectionProgressModal;
