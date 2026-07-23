import React from "react";
import { Lock, LogIn, UserPlus, X, ShieldCheck } from "lucide-react";

interface PollLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export const PollLoginModal: React.FC<PollLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignup
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Badge Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-3xs">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Authenticated Voting Required</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-black text-slate-900">Sign in to Submit Your Vote</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please log in to participate in this poll. One account can vote only once to maintain fair and accurate results.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              onLogin();
            }}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Vote</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onSignup();
            }}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>Create Free Account</span>
          </button>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-medium">
          Paisa Blueprint enforces 1-account 1-vote integrity across all public opinion polls.
        </p>
      </div>
    </div>
  );
};
