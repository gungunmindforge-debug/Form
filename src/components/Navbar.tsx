/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, FileText, ShieldAlert, Menu, X, Inbox } from 'lucide-react';
import { ActivePage } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  submissionCount: number;
}

export default function Navbar({ activePage, setActivePage, submissionCount }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'submit' as ActivePage, label: 'New Request', icon: FileText },
    { id: 'admin' as ActivePage, label: 'Admin Portal', icon: ShieldAlert, badge: submissionCount },
  ];

  const handleNavClick = (pageId: ActivePage) => {
    setActivePage(pageId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60" id="portal-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('submit')}>
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shadow-sm" id="nav-brand-logo">
              <Inbox size={20} className="stroke-[2.25]" />
            </div>
            <span className="font-display font-semibold text-lg tracking-tight text-slate-900" id="nav-brand-title">
              FormCore <span className="text-slate-500 font-light text-sm"></span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1" id="desktop-nav-links">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-slate-900 bg-slate-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} className={`mr-2 stroke-[2] ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span 
                      id={`nav-badge-${item.id}`}
                      className="ml-2.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-900 text-white transition-opacity leading-none"
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 bg-white" id="mobile-nav-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    isActive
                      ? 'text-slate-900 bg-slate-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-900 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
