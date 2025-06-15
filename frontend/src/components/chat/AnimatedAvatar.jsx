import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const AnimatedAvatar = ({ size = "default", className, isTyping = false }) => {
  const sizeClasses = {
    sm: "w-6 h-6 md:w-8 md:h-8",
    default: "w-8 h-8 md:w-10 md:h-10", 
    lg: "w-12 h-12 md:w-16 md:h-16",
    xl: "w-16 h-16 md:w-20 md:h-20"
  };

  return (
    <div className="relative">
      <Avatar className={cn(sizeClasses[size], className, "shadow-lg")}>
        <AvatarFallback className={cn(
          "bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold transition-all duration-300",
          isTyping && "animate-pulse",
          size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : size === "xl" ? "text-xl" : "text-sm"
        )}>
          {/* Animated AI Icon */}
          <div className={cn(
            "relative flex items-center justify-center w-full h-full",
            isTyping && "animate-bounce"
          )}>
            {/* Brain/AI Symbol */}
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={cn(
                "transition-all duration-300",
                size === "sm" ? "w-3 h-3" : size === "lg" ? "w-6 h-6" : size === "xl" ? "w-8 h-8" : "w-4 h-4"
              )}
            >
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.1 14.1 11 13 11S11 10.1 11 9V7.5L5 7V9C5 10.1 4.1 11 3 11S1 10.1 1 9V7C1 5.9 1.9 5 3 5H21C22.1 5 23 5.9 23 7V9C23 10.1 22.1 11 21 11S19 10.1 19 9ZM12 13C13.1 13 14 13.9 14 15V17C14 18.1 13.1 19 12 19S10 18.1 10 17V15C10 13.9 10.9 13 12 13ZM18 13C19.1 13 20 13.9 20 15V17C20 18.1 19.1 19 18 19S16 18.1 16 17V15C16 13.9 16.9 13 18 13ZM6 13C7.1 13 8 13.9 8 15V17C8 18.1 7.1 19 6 19S4 18.1 4 17V15C4 13.9 4.9 13 6 13Z"/>
            </svg>
            
            {/* Animated dots around the icon when typing */}
            {isTyping && (
              <>
                <div className="absolute -top-1 -right-1 w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-400 rounded-full animate-ping animation-delay-200" />
                <div className="absolute top-0 -left-1 w-1 h-1 bg-blue-300 rounded-full animate-ping animation-delay-400" />
              </>
            )}
          </div>
        </AvatarFallback>
      </Avatar>
      
      {/* Online status indicator */}
      <div className={cn(
        "absolute -bottom-0.5 -right-0.5 rounded-full bg-green-500 border-2 border-white shadow-sm",
        size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : size === "xl" ? "w-5 h-5" : "w-3 h-3"
      )}>
        <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
      </div>

      {/* Subtle glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/20 blur-md -z-10 transition-all duration-300",
        isTyping && "animate-pulse scale-110"
      )} />
    </div>
  );
};

export default AnimatedAvatar;
