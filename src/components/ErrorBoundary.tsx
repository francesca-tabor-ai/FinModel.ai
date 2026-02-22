import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary (pattern from Manus).
 * Catches React render errors and shows a reload UI.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#F8F9FA]">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 glass-card border-gray-200">
            <AlertTriangle
              size={48}
              className="text-rose-500 mb-6 flex-shrink-0"
            />
            <h2 className="text-xl font-display font-bold tracking-tight text-[#111827] mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-500 text-sm mb-4 text-center">
              An unexpected error occurred. You can try reloading the page.
            </p>
            <div className="p-4 w-full rounded-2xl bg-gray-50 border border-gray-100 overflow-auto mb-6 max-h-48">
              <pre className="text-xs text-gray-500 whitespace-pre-wrap break-words">
                {this.state.error?.message ?? this.state.error?.stack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm',
                'btn-primary'
              )}
            >
              <RotateCcw size={16} />
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
