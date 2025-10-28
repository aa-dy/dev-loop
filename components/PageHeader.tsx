
import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-brand-navy tracking-tight">{title}</h1>
      <p className="mt-2 text-lg text-brand-navy/70 max-w-2xl mx-auto">{subtitle}</p>
    </div>
  );
};
