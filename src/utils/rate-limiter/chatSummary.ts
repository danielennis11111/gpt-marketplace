/**
 * Chat Summary Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 */

import type { Message } from '../../../examples/rate-limiter-main/src/types';

/**
 * Generate a summary title from chat messages
 */
export const generateChatSummary = (messages: Message[]): string => {
  if (!messages || messages.length === 0) {
    return 'New Conversation';
  }

  // Find the first user message
  const firstUserMessage = messages.find(message => message.isUser);
  
  if (firstUserMessage) {
    // Use the first 30 characters of the first user message
    const text = firstUserMessage.content.trim();
    return text.length > 30 ? `${text.substring(0, 30)}...` : text;
  }
  
  return 'Conversation';
};

/**
 * Format the time of the last message in a human-readable way
 */
export const formatLastMessageTime = (date: Date): string => {
  if (!date) return '';
  
  // Convert string to Date if needed
  const messageDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Calculate time difference in milliseconds
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  // Format the time
  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return messageDate.toLocaleDateString();
  }
}; 