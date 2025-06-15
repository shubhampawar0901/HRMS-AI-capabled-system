import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAuth } from '@/hooks/useAuth';
import { canAccessChatbot, getChatbotAccessDeniedMessage } from '@/utils/roleUtils';
import ChatInterface from '@/components/chat/ChatInterface';
import AnimatedAvatar from '@/components/chat/AnimatedAvatar';

const ChatbotPage = () => {
  const { user } = useAuth();

  // Check if user has access to chatbot
  if (!canAccessChatbot(user?.role)) {
    const accessDenied = getChatbotAccessDeniedMessage();
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

  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-blue-50/40 via-white to-purple-50/40 overflow-hidden -m-6">
      <div className="h-full p-3 md:p-6">
        <Card className="h-full flex flex-col bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
          {/* Fixed Header */}
          <CardHeader className="pb-2 pt-3 bg-gradient-to-r from-blue-100/60 to-purple-100/60 border-b border-gray-200/50 shrink-0">
            <CardTitle className="flex items-center gap-3 md:gap-4">
              <AnimatedAvatar size="default" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    Shubh
                  </h1>
                  <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Online</span>
                  </div>
                </div>
                <p className="text-sm md:text-base text-gray-600 truncate">
                  Your AI HR Assistant • Hello {user?.name || 'there'}! 👋
                </p>
              </div>
            </CardTitle>
          </CardHeader>

          {/* Scrollable Chat Content */}
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ChatInterface />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
