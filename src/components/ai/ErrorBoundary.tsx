import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in AI Assistant component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-canvas-soft p-6 text-center font-sans">
          <div className="max-w-md w-full p-6 bg-canvas border border-hairline rounded-md shadow-level-3 space-y-4">
            <div className="w-12 h-12 bg-error-soft border border-error/20 text-error-deep rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-ink">Something went wrong</h2>
              <p className="text-xs text-mute leading-relaxed">
                The AI Assistant page encountered a layout rendering error. You can try refreshing the page.
              </p>
            </div>
            {this.state.error && (
              <pre className="text-[10px] bg-canvas-soft-2 border border-hairline p-3 rounded-sm text-left text-error-deep overflow-x-auto font-mono max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-1.5 bg-primary text-on-primary hover:opacity-90 rounded-sm text-xs font-semibold shadow-level-2 transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
