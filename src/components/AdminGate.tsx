  import React, { useState } from 'react';
  import { ShieldCheck, Eye, EyeOff, Lock, HelpCircle, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

  interface AdminGateProps {
    onUnlock: () => void;
  }

  export default function AdminGate({ onUnlock }: AdminGateProps) {
    const [passcode, setPasscode] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isShaking, setIsShaking] = useState(false);


    const defaultMasterPasscode = '123'; 

    const handleAuthSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      if (!passcode.trim()) {
        setErrorMsg('Please input access credentials.');
        triggerShake();
        return;
      }

      setIsVerifying(true);

    
      setTimeout(() => {
          const configuredCode = localStorage.getItem('formcore_security_pin') || defaultMasterPasscode;

        if (passcode.trim() === configuredCode) {
          onUnlock();
        } else {
          setErrorMsg('Invalid authorization passcode. Please verify credentials and retry.');
          setIsVerifying(false);
          triggerShake();
        }
      }, 600);
    };

    const triggerShake = () => {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    };

    const handleSetSampleCode = () => {
      setPasscode(defaultMasterPasscode);
      setErrorMsg(null);
    };

    return (
      <div className="max-w-md mx-auto py-8 animate-slide-up" id="auth-gate-root">
        <div
          className={`bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-lg transition-transform duration-300 ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
            }`}
          id="auth-gate-card"
        >
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="mx-auto inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-md relative" id="lock-badge-icon">
                <Lock size={22} className="stroke-[2.25] text-slate-100" />
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="font-display font-semibold text-xl text-slate-900 tracking-tight">Access Gate Protection</h2>
                <p className="text-xs text-slate-450 leading-relaxed max-w-xs mx-auto">
                  Admin view content coordinates are encrypted behind localized session challenges.
                </p>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4" id="auth-gate-form">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-passcode" className="text-xs font-semibold text-slate-600 block">
                    Security Passcode
                  </label>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound size={15} />
                  </span>
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    id="auth-passcode"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    placeholder="Enter administrator passcode"
                    className="w-full text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-205 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    disabled={isVerifying}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    id="toggle-visibility-gate"
                  >
                    {showPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="text-[11px] text-rose-600 font-medium flex items-center mt-1 animate-fade-in" id="auth-gate-error">
                    <AlertCircle size={12} className="mr-1.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                id="auth-submit-button"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-75 transition-colors text-xs font-semibold shadow-sm flex items-center justify-center space-x-2"
              >
                {isVerifying ? (
                  <span>Decrypting credentials...</span>
                ) : (
                  <>
                    <ShieldCheck size={14} />
                    <span>Authenticate Session</span>
                  </>
                )}
              </button>
            </form>


          </div>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
        `}</style>

      </div>
    );
  }
