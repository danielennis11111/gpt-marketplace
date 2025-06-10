/**
 * Utility functions for string manipulation and sanitization
 */

/**
 * Sanitizes the response from AI models by removing potential unsafe content
 * and normalizing formatting
 * 
 * @param text The raw text from an AI response
 * @returns Cleaned and sanitized text
 */
export const sanitizeResponse = (text: string): string => {
  if (!text) return '';
  
  // Trim whitespace
  let sanitized = text.trim();
  
  // Replace multiple consecutive newlines with just two
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  // Remove any control characters (but keep newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Truncates text to a maximum length, adding an ellipsis if truncated
 * 
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formats a model name for display by removing prefixes and improving readability
 * 
 * @param modelId The raw model ID
 * @returns Formatted model name for display
 */
export const formatModelName = (modelId: string): string => {
  // Remove provider prefixes if present
  const withoutPrefix = modelId.replace(/^(meta\/|google\/|openai\/|anthropic\/|mistral\/)/i, '');
  
  // Replace hyphens and underscores with spaces
  const withSpaces = withoutPrefix.replace(/[-_]/g, ' ');
  
  // Capitalize each word
  return withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}; 