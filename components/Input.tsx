
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, error, ...props }, ref) => {
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-brand-navy/30 focus:ring-brand-gold';
    return (
      <div className="w-full">
        <label htmlFor={id} className="block text-sm font-bold text-brand-navy/80 mb-1">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={`w-full px-4 py-2 bg-white rounded-md border-2 ${errorClasses} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
