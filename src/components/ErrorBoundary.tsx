"use client";

import React from 'react';

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; info: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ info });
    console.error("ErrorBoundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-500 bg-red-500/10 rounded-xl m-8 font-mono text-sm border border-red-500/30 overflow-auto">
          <h2 className="text-xl font-bold mb-4 text-red-400">Application Error</h2>
          <p className="font-bold mb-2">{this.state.error?.message}</p>
          <pre className="whitespace-pre-wrap">{this.state.error?.stack}</pre>
          <hr className="my-4 border-red-500/30" />
          <pre className="whitespace-pre-wrap">{this.state.info?.componentStack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
