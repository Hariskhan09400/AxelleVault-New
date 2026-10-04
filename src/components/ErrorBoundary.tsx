import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[App] Unhandled render error:', error, info.componentStack);
  }

  private retry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center"
          style={{ background: 'var(--av-page)', color: 'var(--av-text)' }}
        >
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <button type="button" onClick={this.retry} className="av-btn">
            Retry
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
