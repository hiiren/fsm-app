import React, { Component, type ReactNode, useCallback } from 'react';
import { logError, type PageName } from './logger';

interface PageErrorBoundaryProps {
  children: ReactNode;
  page: PageName;
  fallback?: ReactNode;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logError(
      this.props.page,
      `Render error: ${error.message}`,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
      error
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
          <div className="mb-4 text-destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            An error occurred on this page. The issue has been logged.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const PageErrorBoundary = ErrorBoundaryClass;

export function usePageErrorLogger(page: PageName) {
  const logRenderError = useCallback(
    (error: Error, context?: Record<string, unknown>) => {
      logError(page, `Render error: ${error.message}`, context, error);
    },
    [page]
  );

  const logApiFailure = useCallback(
    (operation: string, error: Error | string, details?: Record<string, unknown>) => {
      const message = typeof error === 'string' ? error : error.message;
      logError(page, `API failure: ${operation} - ${message}`, {
        operation,
        apiError: true,
        ...details,
      }, typeof error === 'object' ? error : undefined);
    },
    [page]
  );

  const logStateError = useCallback(
    (action: string, error: Error | string, state?: Record<string, unknown>) => {
      const message = typeof error === 'string' ? error : error.message;
      logError(page, `State error: ${action} - ${message}`, {
        action,
        stateError: true,
        state,
      }, typeof error === 'object' ? error : undefined);
    },
    [page]
  );

  return {
    logRenderError,
    logApiFailure,
    logStateError,
  };
}
