import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import AnimatedAvatar from './AnimatedAvatar';

const MessageBubble = ({ message, onRetry }) => {
  const isUser = message.type === 'user';
  const isError = message.isError;

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={cn(
      "flex gap-2 md:gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-500",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Bot Avatar (left side) */}
      {!isUser && (
        <AnimatedAvatar size="sm" className="shrink-0 mt-1" />
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm",
        isUser
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto border-0 shadow-blue-200/50"
          : isError
            ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200/50 shadow-red-200/30"
            : "bg-white/90 text-gray-800 border border-gray-200/30 shadow-gray-200/40"
      )}>
        {/* Message Text */}
        <div className="text-sm md:text-base leading-relaxed">
          {isUser ? (
            <span className="font-medium">{message.content}</span>
          ) : (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-800">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-blue-700">{children}</strong>,
                  em: ({ children }) => <em className="italic text-purple-600">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-gray-700">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-700">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  code: ({ children }) => <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">{children}</code>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp and Retry Button */}
        <div className={cn(
          "flex items-center justify-between mt-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <div className={cn(
            "text-xs opacity-80",
            isUser ? "text-blue-100" : "text-gray-500"
          )}>
            {formatTime(message.timestamp)}
          </div>

          {/* Retry Button for Error Messages */}
          {isError && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-xs hover:bg-background/50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {/* User Avatar (right side) */}
      {isUser && (
        <Avatar className="w-8 h-8 md:w-10 md:h-10 shrink-0 mt-1 shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
            {message.userName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
