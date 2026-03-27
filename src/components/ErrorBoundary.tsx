"use client";

import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl border border-border p-12 text-center max-w-md">
            <span className="text-5xl block mb-4" aria-hidden="true">
              ⚠️
            </span>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Xəta baş verdi
            </h2>
            <p className="text-muted mb-6">
              Gözlənilməz xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center gap-2 bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Yenidən cəhd et
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
