
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "px-6 py-3 font-bold rounded-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";

  const variantStyles = {
    primary: 'bg-brand-navy text-white hover:bg-opacity-90',
    secondary: 'bg-brand-gold text-brand-navy hover:bg-opacity-90',
    outline: 'bg-transparent border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white',
  };

  return (
    <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
