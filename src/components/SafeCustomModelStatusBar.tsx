import React, { Component } from 'react';
import type { ErrorInfo } from 'react';
import CustomModelStatusBar from './CustomModelStatusBar';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A safe wrapper for the CustomModelStatusBar that catches any errors
 * and displays a fallback instead of crashing the entire application.
 */
class SafeCustomModelStatusBar extends Component<{}, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error in ModelStatusBar component:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-md">
          Status Bar Error
        </div>
      );
    }

    // When no error, render the CustomModelStatusBar
    return <CustomModelStatusBar />;
  }
}

export default SafeCustomModelStatusBar; 