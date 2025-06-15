import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

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
    <div className="flex gap-2" role="form" aria-label="Chat message input">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1"
        autoFocus
        aria-label="Type your message to Shubh"
        aria-describedby="send-button"
      />
      <Button
        id="send-button"
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        size="icon"
        className="shrink-0"
        aria-label="Send message"
        title="Send message (Enter)"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
      </Button>
    </div>
  );
};

export default ChatInput;
