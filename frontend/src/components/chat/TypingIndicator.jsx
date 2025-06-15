import React from 'react';
import AnimatedAvatar from './AnimatedAvatar';

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 md:gap-3 mb-4 animate-in fade-in duration-500">
      {/* Bot Avatar with typing animation */}
      <AnimatedAvatar size="sm" className="shrink-0 mt-1" isTyping={true} />

      {/* Typing Dots Container */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 md:px-5 md:py-4 shadow-lg border border-gray-200/30">
        <div className="flex items-center gap-2">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>

      {/* CSS for typing animation */}
      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          opacity: 0.7;
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
            opacity: 0.4;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }

        @media (min-width: 768px) {
          .typing-dot {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
