
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-md border border-brand-navy/10 ${className}`}>
      {children}
    </div>
  );
};
