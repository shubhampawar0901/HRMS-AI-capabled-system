import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`relative z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
));
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </option>
));
SelectItem.displayName = 'SelectItem';

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={`block truncate ${className}`} {...props} />
));
SelectValue.displayName = 'SelectValue';

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
