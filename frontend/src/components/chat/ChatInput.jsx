import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-2 md:p-3" role="form" aria-label="Chat message input">
      <div className="flex-1 relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Shubh anything about HR..."
          disabled={disabled}
          className="w-full bg-white/90 backdrop-blur-sm border-gray-300/50 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 transition-all duration-300 shadow-md hover:shadow-lg"
          autoFocus
          aria-label="Type your message to Shubh"
          aria-describedby="send-button"
        />
      </div>
      <Button
        id="send-button"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        size="icon"
        className={cn(
          "shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg",
          !input.trim() || disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105 active:scale-95"
        )}
        aria-label="Send message"
        title="Send message (Enter)"
      >
        <Send className={cn(
          "w-4 h-4 md:w-5 md:h-5 transition-all duration-300",
          !input.trim() || disabled ? "text-gray-500" : "text-white"
        )} aria-hidden="true" />
      </Button>
    </div>
  );
};

export default ChatInput;
