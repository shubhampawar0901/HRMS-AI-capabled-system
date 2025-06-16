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

  // Preprocess content to fix markdown formatting issues
  const preprocessMarkdown = (content) => {
    if (!content) return '';

    let processed = content;

    // Convert bullet points that are on separate lines to proper markdown lists
    // Handle patterns like:
    // •
    // Annual Leave: text
    // or
    // •
    // text
    processed = processed.replace(/^•\s*$/gm, ''); // Remove standalone bullet points
    processed = processed.replace(/^(\s*)([A-Za-z][^:]*:)/gm, '$1• $2'); // Add bullets to lines that look like list items

    // Handle patterns where bullet is followed by newline then content
    processed = processed.replace(/•\s*\n\s*([A-Za-z])/g, '• $1');

    // Ensure proper spacing around lists
    processed = processed.replace(/\n(• )/g, '\n$1');

    // Clean up multiple consecutive newlines
    processed = processed.replace(/\n{3,}/g, '\n\n');

    return processed.trim();
  };

  // Custom components for ReactMarkdown to maintain styling consistency
  const markdownComponents = {
    // Paragraphs with proper spacing
    p: ({ children }) => (
      <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
    ),
    // Strong/bold text
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900">{children}</strong>
    ),
    // Emphasis/italic text
    em: ({ children }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
    // Unordered lists
    ul: ({ children }) => (
      <ul className="list-disc mb-2 space-y-1 ml-4 pl-2">{children}</ul>
    ),
    // Ordered lists
    ol: ({ children }) => (
      <ol className="list-decimal mb-2 space-y-1 ml-4 pl-2">{children}</ol>
    ),
    // List items
    li: ({ children }) => (
      <li className="text-gray-800 leading-relaxed pl-1">{children}</li>
    ),
    // Line breaks
    br: () => <br className="mb-1" />,
    // Headers (if any)
    h1: ({ children }) => (
      <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-sm font-medium mb-1 text-gray-900">{children}</h3>
    ),
  };

  return (
    <div className={cn(
      "flex gap-2 mb-2 animate-in slide-in-from-bottom-2 duration-500",
      isUser ? "justify-end" : "justify-start"
    )}>
      {/* Bot Avatar (left side) */}
      {!isUser && (
        <AnimatedAvatar size="sm" className="shrink-0 mt-0.5" />
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[85%] md:max-w-[75%] rounded-2xl px-3 py-2 shadow-md hover:shadow-lg transition-all duration-300 backdrop-blur-sm",
        isUser
          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-auto border-0 shadow-blue-200/50"
          : isError
            ? "bg-gradient-to-br from-red-50 to-red-100 text-red-700 border border-red-200/50 shadow-red-200/30"
            : "bg-white/90 text-gray-800 border border-gray-200/30 shadow-gray-200/40"
      )}>
        {/* Message Text */}
        <div className="text-sm leading-relaxed">
          {isUser ? (
            <span className="font-medium">{message.content}</span>
          ) : (
            <div className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown components={markdownComponents}>
                {preprocessMarkdown(message.content)}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Retry Button for Error Messages */}
        {isError && onRetry && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="h-6 px-2 text-xs hover:bg-background/50"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* User Avatar (right side) */}
      {isUser && (
        <Avatar className="w-7 h-7 md:w-8 md:h-8 shrink-0 mt-0.5 shadow-lg">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-semibold">
            {message.userName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
