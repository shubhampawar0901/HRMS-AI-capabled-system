import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";
import ReactMarkdown from 'react-markdown';

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
      "flex gap-2 md:gap-3 mb-4 animate-in slide-in-from-bottom-2 duration-300",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Bot Avatar (left side) */}
      {!isUser && (
        <Avatar className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-1">
          <AvatarImage src="/shubh-avatar.png" alt="Shubh" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            SH
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 md:px-4 md:py-2",
        isUser 
          ? "bg-primary text-primary-foreground ml-auto" 
          : isError
            ? "bg-destructive/10 text-destructive border border-destructive/20"
            : "bg-muted text-foreground"
      )}>
        {/* Message Text */}
        <div className="text-sm md:text-base">
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp and Retry Button */}
        <div className={cn(
          "flex items-center justify-between mt-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <div className="text-xs opacity-70">
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

      {/* User Avatar (right side) - Optional */}
      {isUser && (
        <Avatar className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {message.userName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
