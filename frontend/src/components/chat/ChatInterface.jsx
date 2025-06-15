import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import { useAuth } from '@/hooks/useAuth';
import { chatbotService } from '@/services/chatbotService';

const ChatInterface = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle retry for failed messages
  const handleRetryMessage = (originalMessage) => {
    handleSendMessage(originalMessage);
  };

  // Handle sending messages
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      // Call the real chatbot API
      const botResponse = await chatbotService.sendMessage(messageText);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: error.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true,
        retryMessage: messageText // Store original message for retry
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setError(error.message);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Message Area */}
      <ScrollArea
        className="flex-1 p-4"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onQuickAction={handleSendMessage} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRetry={message.isError && message.retryMessage ? () => handleRetryMessage(message.retryMessage) : null}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Separator */}
      <Separator />

      {/* Input Area */}
      <div className="p-4">
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
