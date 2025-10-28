
import React from 'react';
import { BRAND } from '../constants';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-brand-navy text-brand-ivory/80 mt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p>&copy; {year} {BRAND.NAME}. {BRAND.TAGLINE}</p>
        <p className="mt-2 text-sm text-brand-ivory/60">
          Built for the DSA community.
        </p>
      </div>
    </footer>
  );
};
