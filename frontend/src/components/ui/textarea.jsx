import React from 'react';

const Textarea = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`
        flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm
        placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        disabled:cursor-not-allowed disabled:opacity-50 resize-none
        transition-all duration-200 ease-in-out hover:border-gray-400
        ${className}
      `}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
