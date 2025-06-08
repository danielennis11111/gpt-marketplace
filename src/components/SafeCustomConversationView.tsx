import React, { Component } from 'react';
import type { ErrorInfo } from 'react';
import CustomConversationView from './CustomConversationView';
import type { Conversation, ConversationTemplate } from '../utils/rate-limiter/custom-adapter';

interface SafeCustomConversationViewProps {
  conversation: Conversation;
  template: ConversationTemplate;
  modelManager: any;
  conversationManager: any;
  onConversationUpdate: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * A safe wrapper for the CustomConversationView that catches any errors
 * and displays a fallback instead of crashing the entire application.
 */
class SafeCustomConversationView extends Component<SafeCustomConversationViewProps, ErrorBoundaryState> {
  constructor(props: SafeCustomConversationViewProps) {
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
    console.error('Error in ConversationView component:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-4">
              We encountered an error rendering the conversation. Please try refreshing the page or creating a new conversation.
            </p>
            <details className="mt-4 text-sm text-gray-500">
              <summary>Error details</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                {this.state.error?.message || 'Unknown error'}
              </pre>
            </details>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    // When no error, render the CustomConversationView
    return <CustomConversationView {...this.props} />;
  }
}

export default SafeCustomConversationView; 