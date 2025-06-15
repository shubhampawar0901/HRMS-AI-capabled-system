import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/hooks/useAuth';
import { canAccessChatbot, getChatbotAccessDeniedMessage } from '@/utils/roleUtils';
import ChatInterface from '@/components/chat/ChatInterface';

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
    <div className="container mx-auto p-3 md:p-6 h-[calc(100vh-4rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="flex items-center gap-2 md:gap-3">
            <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarImage src="/shubh-avatar.png" alt="Shubh" />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                SH
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl font-semibold truncate">Shubh - Your HR Assistant</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                Hello {user?.name || 'there'}, I'm here to help with your HR queries
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="flex-1 p-0">
          <ChatInterface />
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatbotPage;
