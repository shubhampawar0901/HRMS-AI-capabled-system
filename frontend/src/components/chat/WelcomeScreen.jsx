import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Target,
  HelpCircle
} from "lucide-react";
import AnimatedAvatar from './AnimatedAvatar';

const WelcomeScreen = ({ onQuickAction }) => {
  const quickActions = [
    {
      text: "What is my current leave balance?",
      label: "Leave Balance",
      icon: Calendar,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      text: "Show my attendance summary",
      label: "Attendance",
      icon: Clock,
      gradient: "from-green-500 to-green-600"
    },
    {
      text: "Show my latest payslip details",
      label: "Payroll",
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      text: "What are my performance review details?",
      label: "Performance",
      icon: Target,
      gradient: "from-orange-500 to-orange-600"
    },
    {
      text: "Tell me about company leave policies",
      label: "Policies",
      icon: FileText,
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      text: "How can you help me with HR queries?",
      label: "Help",
      icon: HelpCircle,
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-purple-50/30 to-pink-50/40 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Avatar */}
        <div className="mb-6">
          <AnimatedAvatar size="xl" className="mx-auto" />
        </div>

        {/* Welcome Message */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Hello! I'm Shubh 👋
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Your intelligent HR assistant. I can help you with leave balances, company policies,
              attendance queries, payroll information, and much more.
            </p>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Try asking me:</span> "What's my leave balance?" or "Show me company policies"
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/70 backdrop-blur-sm"
                onClick={() => onQuickAction(action.text)}
              >
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${action.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {action.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            💬 You can also type your questions directly in the chat box below
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Ready to assist you</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
