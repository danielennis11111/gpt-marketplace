import React, { useState } from 'react';
import type { Conversation, ConversationTemplate } from '../utils/rate-limiter/adapter';
import ConversationView from '../../examples/rate-limiter-main/src/components/ConversationView';

interface SafeConversationViewProps {
  conversation: Conversation;
  template: ConversationTemplate;
  modelManager: any;
  conversationManager: any;
  onConversationUpdate: () => void;
}

/**
 * A wrapper around the ConversationView component that adds error boundaries
 * and handles any issues with the rate-limiter components.
 */
const SafeConversationView: React.FC<SafeConversationViewProps> = (props) => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle errors safely
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error Loading Conversation</h2>
          <p className="text-gray-700 mb-4">{errorMessage || 'Something went wrong with the conversation view.'}</p>
          <button
            onClick={() => {
              setHasError(false);
              setErrorMessage('');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render the conversation view with error handling
  try {
    return (
      <ConversationView
        conversation={props.conversation}
        template={props.template}
        modelManager={props.modelManager}
        conversationManager={props.conversationManager}
        onConversationUpdate={props.onConversationUpdate}
      />
    );
  } catch (error) {
    // Log the error and show an error message
    console.error('Error rendering ConversationView:', error);
    setHasError(true);
    setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    
    // Return a loading state while we set the error
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
};

export default SafeConversationView; 