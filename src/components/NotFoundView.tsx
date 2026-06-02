/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Home, ChevronRight } from 'lucide-react';
import { ActivePage } from '../types';

interface NotFoundViewProps {
  setActivePage: (p: ActivePage) => void;
}

export default function NotFoundView({ setActivePage }: NotFoundViewProps) {
  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center space-y-6 animate-slide-up" id="not-found-view-container">
      <div className="relative inline-flex items-center justify-center p-5 bg-slate-55 rounded-3xl border border-slate-100 shadow-xs mb-2">
        <Compass size={44} className="text-slate-900 animate-spin" style={{ animationDuration: '20s' }} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">!</span>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Error 404</span>
        <h2 className="font-display font-semibold text-2xl text-slate-900 leading-tight">Page Coordinates Misaligned</h2>
        <p className="text-xs text-slate-550 leading-relaxed max-w-sm mx-auto">
          The requested coordinate dashboard path does not exist under FormCore session registers. Use the navigation portal or quick guides to return.
        </p>
      </div>

      <div className="pt-2">
        <button
          id="btn-404-go-home"
          onClick={() => setActivePage('home')}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm duration-150 group"
        >
          <Home size={14} className="mr-2" />
          Navigate to Home
          <ChevronRight size={12} className="ml-1.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
