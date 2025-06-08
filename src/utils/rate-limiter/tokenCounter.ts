/**
 * Token Counter Adapter
 * 
 * This is a minimal implementation to satisfy the imports in the rate-limiter project
 */

/**
 * Estimates token count using a simple heuristic
 * This is not as accurate as a real tokenizer but should be sufficient for UI purposes
 */
export const estimateTokenCount = (text: string): number => {
  if (!text) return 0;
  
  // Simple approximation: 4 characters ≈ 1 token
  // This is a rough estimate and not as accurate as a proper tokenizer
  const charCount = text.length;
  return Math.ceil(charCount / 4);
}; 