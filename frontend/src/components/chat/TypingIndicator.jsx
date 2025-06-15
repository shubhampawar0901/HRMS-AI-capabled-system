import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 md:gap-3 mb-4 animate-in fade-in duration-300">
      {/* Bot Avatar */}
      <Avatar className="w-6 h-6 md:w-8 md:h-8 shrink-0 mt-1">
        <AvatarImage src="/shubh-avatar.png" alt="Shubh" />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          SH
        </AvatarFallback>
      </Avatar>

      {/* Typing Dots Container */}
      <div className="bg-muted rounded-lg px-3 py-2 md:px-4 md:py-2">
        <div className="flex items-center gap-1">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>

      {/* CSS for typing animation */}
      <style jsx>{`
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: hsl(var(--muted-foreground));
          opacity: 0.5;
          animation: typing-bounce 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }

        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0s;
        }

        @keyframes typing-bounce {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          .typing-dot {
            width: 8px;
            height: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
