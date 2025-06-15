import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  FileText, 
  Target, 
  DollarSign,
  MessageCircle 
} from "lucide-react";

const WelcomeScreen = ({ onQuickAction }) => {
  const quickActions = [
    {
      text: "What is my leave balance?",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      text: "Show my attendance record",
      icon: Clock,
      color: "text-green-600"
    },
    {
      text: "Company policies",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      text: "My performance review",
      icon: Target,
      color: "text-orange-600"
    },
    {
      text: "Payroll information",
      icon: DollarSign,
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-8 text-center animate-in fade-in duration-500">
      {/* Bot Introduction */}
      <div className="mb-8">
        <Avatar className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4">
          <AvatarImage src="/shubh-avatar.png" alt="Shubh" />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg md:text-xl">
            SH
          </AvatarFallback>
        </Avatar>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          👋 Hi! I'm Shubh
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-4">
          Your HR Assistant
        </p>
        <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
          I'm here to help you with HR-related questions and tasks. 
          You can ask me anything about your employment, policies, or benefits.
        </p>
      </div>

      {/* Capabilities */}
      <Card className="w-full max-w-2xl mb-8">
        <CardContent className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            I can help you with:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Leave balances and applications</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>Attendance records</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Company policies</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              <span>Performance reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Payroll information</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-pink-600" />
              <span>General HR queries</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-semibold mb-4">Quick actions to get started:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 md:p-4 text-left justify-start hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                onClick={() => onQuickAction(action.text)}
              >
                <Icon className={`w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3 ${action.color}`} />
                <span className="text-sm md:text-base">{action.text}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <p className="text-muted-foreground mt-8 text-sm md:text-base">
        What would you like to know today?
      </p>
    </div>
  );
};

export default WelcomeScreen;
