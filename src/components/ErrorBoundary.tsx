import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ERROR BOUNDARY CAUGHT EXCEPTION]", error, errorInfo);
    (this as any).setState({ error, errorInfo });
  }

  render() {
    const { hasError, error, errorInfo } = (this as any).state || {};
    const { children, fallbackTitle } = (this as any).props || {};

    if (hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center my-8">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {fallbackTitle || "Something went wrong loading this view"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                An unexpected interface rendering error occurred. The system safely caught the exception to prevent a blank page.
              </p>
            </div>

            {error && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-left overflow-auto max-h-40">
                <p className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 break-words">
                  {error.toString()}
                </p>
                {errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-slate-500 mt-2 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer border-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer border-0"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}
