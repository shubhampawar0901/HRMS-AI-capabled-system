/**
 * Anomaly Explanation Card - Self-Explanatory Detection Logic
 * Shows users exactly how anomalies are calculated with clear thresholds
 */

import React, { useState } from 'react';
import { 
  Brain, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MapPin,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

const AnomalyExplanationCard = () => {
  const [isExpanded, setIsExpanded] = useState(true); // Default to expanded

  const anomalyTypes = [
    {
      type: 'Late Pattern',
      icon: Clock,
      threshold: '>20% late arrivals',
      description: 'Employee consistently arrives more than 15 minutes late',
      example: 'If someone is late 6 out of 20 working days (30%)',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      type: 'Irregular Hours',
      icon: TrendingUp,
      threshold: '>2 hours variation',
      description: 'Working hours vary significantly from day to day',
      example: 'Working 6 hours one day, 10 hours the next (4h difference)',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      type: 'High Absence',
      icon: Calendar,
      threshold: '>10% absence rate',
      description: 'Frequent absences without clear pattern',
      example: 'Absent 3 out of 20 working days (15%)',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      type: 'Early Departure',
      icon: AlertTriangle,
      threshold: '>15% early leaves',
      description: 'Consistently leaving 30+ minutes before end time',
      example: 'Leaving early 4 out of 20 working days (20%)',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      type: 'Overtime Pattern',
      icon: Clock,
      threshold: '>25% overtime days',
      description: 'Frequently working more than 2 extra hours',
      example: 'Working overtime 6 out of 20 days (30%)',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'Location Issues',
      icon: MapPin,
      threshold: '>20% inconsistency',
      description: 'Working from inconsistent locations',
      example: 'Working from 4+ different locations in a month',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      type: 'Weekend Work',
      icon: Calendar,
      threshold: 'Any weekend/holiday',
      description: 'Working on weekends or holidays without approval',
      example: 'Working on Saturday or Sunday',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                How AI Detects Anomalies
              </h2>
              <p className="text-sm text-gray-600">
                Advanced AI-powered detection using Gemini 1.5 Flash model
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-sm font-medium text-gray-700">
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {anomalyTypes.slice(0, 4).map((anomaly, index) => {
            const IconComponent = anomaly.icon;
            return (
              <div key={index} className={`${anomaly.bgColor} rounded-lg p-4`}>
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className={`w-5 h-5 ${anomaly.color}`} />
                  <span className="font-medium text-gray-900 text-sm">
                    {anomaly.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium">
                  {anomaly.threshold}
                </p>
              </div>
            );
          })}
        </div>

        {anomalyTypes.length > 4 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {anomalyTypes.slice(4).map((anomaly, index) => {
              const IconComponent = anomaly.icon;
              return (
                <div key={index + 4} className={`${anomaly.bgColor} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <IconComponent className={`w-5 h-5 ${anomaly.color}`} />
                    <span className="font-medium text-gray-900 text-sm">
                      {anomaly.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    {anomaly.threshold}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced AI Analysis Process */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="p-6">

            {/* Enhanced AI Analysis Process */}
            <div className="space-y-6">
              {/* Key Features */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  <span>Advanced AI Capabilities</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Intelligent Detection</h4>
                    <p className="text-sm text-gray-600">AI understands context and adapts to individual patterns</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <AlertTriangle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">High Accuracy</h4>
                    <p className="text-sm text-gray-600">Only reports anomalies with high confidence scores</p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">Real-time Analysis</h4>
                    <p className="text-sm text-gray-600">Fast processing with Gemini 1.5 Flash model</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyExplanationCard;
