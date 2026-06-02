/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, Plus } from 'lucide-react';

interface SubmitSuccessViewProps {
  onSubmitAnother: () => void;
}

export default function SubmitSuccessView({
  onSubmitAnother,
}: SubmitSuccessViewProps) {
  useEffect(() => {
    // Inject celebration CSS once
    if (!document.getElementById('celebration-css')) {
      const style = document.createElement('style');
      style.id = 'celebration-css';
      style.innerHTML = `
        .celebrate {
          animation: success-pop 0.55s ease-out both;
          position: relative;
        }

        .celebrate::after {
          content: '';
          position: absolute;
          inset: -24px;
          border-radius: 32px;
          background: radial-gradient(
            circle,
            rgba(16, 185, 129, 0.28),
            transparent 70%
          );
          opacity: 0;
          animation: glow-fade 1.4s ease-out;
          pointer-events: none;
        }

        @keyframes success-pop {
          0% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          60% {
            transform: scale(1.03);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes glow-fade {
          0% {
            opacity: 0;
          }
          35% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Trigger animation
    const el = document.getElementById('submit-success-wrapper');
    if (!el) return;

    el.classList.add('celebrate');
    const t = setTimeout(() => el.classList.remove('celebrate'), 1600);

    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id="submit-success-wrapper"
      className="relative max-w-lg mx-auto px-6 py-14 sm:px-8 bg-white border border-slate-200/60 rounded-3xl text-center space-y-9 shadow-[0_20px_60px_-22px_rgba(0,0,0,0.18)]"
    >
      {/* Icon */}
      <div className="mx-auto flex items-center justify-center w-18 h-18 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
        <CheckCircle2 size={40} />
      </div>

      {/* Message */}
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60">
          <Sparkles size={12} />
          All set!
        </span>

        <h2 className="font-display font-semibold text-3xl text-slate-900 tracking-tight">
          Your request was submitted 🎉
        </h2>

        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          Thanks! We’ve received your request successfully.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={onSubmitAnother}
        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-[0.97]"
      >
        <Plus size={16} />
        Submit another request
      </button>

      
    </div>
  );
}

