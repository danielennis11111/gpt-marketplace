/**
 * Sanitizes API responses for consistent formatting
 */
export function sanitizeResponse(text: string): string {
  if (!text) return '';
  
  // Remove redundant newlines
  let sanitized = text.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
} 