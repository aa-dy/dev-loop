
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BRAND } from '../constants';

const navLinks = [
  { path: '/', name: 'Home' },
  { path: '/propose', name: 'Propose' },
  { path: '/poll', name: 'Poll' },
  { path: '/session', name: 'Session' },
  { path: '/pack', name: 'Study Pack' },
  { path: '/recap', name: 'Recap' },
];

export const Navbar: React.FC = () => {
  return (
    <header className="bg-brand-navy/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="text-2xl font-bold text-white tracking-tight">
              {BRAND.NAME}
            </NavLink>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map(link => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-gold text-brand-navy'
                        : 'text-brand-ivory/80 hover:bg-brand-gold/20 hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
