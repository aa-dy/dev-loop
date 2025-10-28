
import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => {
  return (
    <div className="text-center p-8 border-2 border-dashed border-brand-navy/20 rounded-lg bg-white/50">
      {icon && <div className="text-5xl text-brand-navy/50 mx-auto mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-brand-navy mb-2">{title}</h3>
      <p className="text-brand-navy/70">{message}</p>
    </div>
  );
};
