import React from 'react';

const Avatar = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`
      relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full
      ${className}
    `}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className = '', src, alt, ...props }, ref) => (
  <img
    ref={ref}
    src={src}
    alt={alt}
    className={`aspect-square h-full w-full object-cover ${className}`}
    {...props}
  />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`
      flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium
      ${className}
    `}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
