/**
 * Utility functions for generating chat summaries
 */

import { Message } from '../types/index';

export const generateChatSummary = (messages: Message[]): string => {
  if (messages.length === 0) {
    return 'Empty conversation';
  }

  // Get the first user message to use as the basis for the summary
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  
  if (!firstUserMessage) {
    return 'New conversation';
  }

  let summary = firstUserMessage.content;
  
  // Remove markdown formatting
  summary = summary
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/`(.*?)`/g, '$1')       // Remove code
    .replace(/#{1,6}\s/g, '')        // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/^\s*[-*+]\s/gm, '')    // Remove list markers
    .replace(/^\s*\d+\.\s/gm, '')    // Remove numbered list markers
    .replace(/\n+/g, ' ')            // Replace newlines with spaces
    .trim();

  // Truncate to a reasonable length (50 characters max)
  if (summary.length > 50) {
    summary = summary.substring(0, 47) + '...';
  }

  return summary || 'New conversation';
};

export const formatLastMessageTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}; 