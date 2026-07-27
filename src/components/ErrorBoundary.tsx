import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** 렌더 오류 시 백지 대신 안내 화면을 보여준다. */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('렌더 오류:', error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p className="error-boundary__code" aria-hidden="true">runtime error</p>
          <h1>화면을 표시하지 못했습니다</h1>
          <p className="error-boundary__desc">
            일시적인 문제일 수 있어요. 새로고침하거나 홈으로 이동해 다시 시도해주세요.
          </p>
          <div className="error-boundary__actions">
            <button className="error-boundary__btn error-boundary__btn--primary" onClick={this.handleReload}>
              새로고침
            </button>
            <button className="error-boundary__btn" onClick={this.handleGoHome}>
              홈으로 이동
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
