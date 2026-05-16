import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppButton } from "../ui/AppButton";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled UI error", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <main id="main-content" className="page">
        <section className="error-boundary-panel" role="alert" aria-labelledby="error-boundary-title">
          <div>
            <p className="error-boundary-kicker">Application Error</p>
            <h1 id="error-boundary-title">Something went wrong</h1>
            <p>
              The app hit an unexpected UI error. Your Google tokens and session details were not printed or exposed.
            </p>
          </div>
          <AppButton variant="secondary" onClick={this.handleRetry}>
            Try again
          </AppButton>
        </section>
      </main>
    );
  }
}
