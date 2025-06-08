/**
 * 🔗 Citation Parser - Enhanced RAG Citation Processing
 * 
 * Converts RAG results into structured citations with incantation tracking
 * and text highlighting for interactive source attribution.
 */

// Interface for RAG search results
export interface RAGResult {
  chunk: {
    content: string;
    startIndex: number;
    endIndex: number;
    type?: string;
  };
  document: {
    id: string;
    name: string;
    type: string;
    uploadedAt: Date;
  };
  relevanceScore: number;
  context: string;
}

// Citation type
export interface Citation {
  id: string;
  source: string;
  type: 'rag' | 'web' | 'pdf' | 'file';
  content: string;
  relevance: number;
  timestamp: Date;
  documentId: string;
  incantationUsed?: string;
  highlightedText?: string;
  confidence?: number;
  quality?: number;
}

// Citation reference
export interface CitationReference {
  citationId: string;
  inlineText: string;
  position: number;
  highlightStart: number;
  highlightEnd: number;
}

// Highlighted text segment
export interface HighlightedText {
  text: string;
  isHighlighted: boolean;
  citationId?: string;
}

// RAG Discovery record
export interface RAGDiscovery {
  query: string;
  incantationUsed: string;
  timestamp: Date;
  results: Citation[];
  confidence: number;
  context: string;
}

/**
 * Convert RAG results to structured citations with incantation tracking
 */
export function convertRAGResultsToCitations(
  ragResults: RAGResult[], 
  incantationUsed?: string
): Citation[] {
  return ragResults.map((result, index) => ({
    id: `rag-${result.document.id}-${index}`,
    source: result.document.name,
    type: 'rag' as const,
    content: result.context,
    relevance: result.relevanceScore,
    timestamp: result.document.uploadedAt,
    documentId: result.document.id,
    incantationUsed: incantationUsed || 'semantic-search',
    highlightedText: extractHighlightedText(result.context, result.chunk.content),
    confidence: calculateConfidence(result.relevanceScore, result.context.length),
    quality: calculateCitationQuality({
      id: `rag-${result.document.id}-${index}`,
      source: result.document.name,
      type: 'rag',
      content: result.context,
      relevance: result.relevanceScore
    })
  }));
}

/**
 * Extract the most relevant text snippet for highlighting
 */
function extractHighlightedText(fullContext: string, chunkContent: string): string {
  // If chunk content is available and shorter, use it
  if (chunkContent && chunkContent.length < 200) {
    return chunkContent;
  }
  
  // Otherwise, find the most important sentence in the context
  const sentences = fullContext.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return fullContext.substring(0, 150);
  
  // Return the longest sentence (likely most informative)
  const longestSentence = sentences.reduce((prev, current) => 
    current.length > prev.length ? current : prev
  );
  
  return longestSentence.trim();
}

/**
 * Calculate confidence score based on relevance and content quality
 */
function calculateConfidence(relevanceScore: number, contentLength: number): number {
  let confidence = relevanceScore * 0.7; // Base confidence from relevance
  
  // Content length factor
  if (contentLength >= 100 && contentLength <= 500) {
    confidence += 0.2; // Ideal length
  } else if (contentLength >= 50) {
    confidence += 0.1; // Acceptable length
  }
  
  // Semantic quality boost (placeholder - could add NLP analysis)
  confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

/**
 * Parse text and highlight RAG-sourced content
 */
export function parseTextWithHighlighting(
  text: string,
  citations: Citation[],
  discoveries: RAGDiscovery[] = []
): {
  segments: HighlightedText[];
  references: CitationReference[];
} {
  const segments: HighlightedText[] = [];
  const references: CitationReference[] = [];
  
  let currentIndex = 0;
  
  // Simple approach: look for quoted content that matches citation sources
  // For now, implement a basic version that looks for similar text
  // In a production system, this would use more sophisticated NLP
  
  for (const citation of citations) {
    const highlightText = citation.highlightedText || citation.content.substring(0, 100);
    const matchIndex = text.toLowerCase().indexOf(highlightText.toLowerCase().substring(0, 50));
    
    if (matchIndex !== -1 && matchIndex >= currentIndex) {
      // Add non-highlighted text before this match
      if (matchIndex > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, matchIndex),
          isHighlighted: false
        });
      }
      
      // Add highlighted text
      const matchEnd = matchIndex + highlightText.length;
      segments.push({
        text: text.substring(matchIndex, Math.min(matchEnd, text.length)),
        isHighlighted: true,
        citationId: citation.id
      });
      
      // Add reference
      references.push({
        citationId: citation.id,
        inlineText: text.substring(matchIndex, Math.min(matchEnd, text.length)),
        position: matchIndex,
        highlightStart: matchIndex,
        highlightEnd: Math.min(matchEnd, text.length)
      });
      
      currentIndex = Math.min(matchEnd, text.length);
    }
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isHighlighted: false
    });
  }
  
  // If no matches found, return the entire text as non-highlighted
  if (segments.length === 0) {
    segments.push({
      text: text,
      isHighlighted: false
    });
  }
  
  return { segments, references };
}

/**
 * Create a RAG discovery record
 */
export function createRAGDiscovery(
  query: string,
  incantationUsed: string,
  citations: Citation[],
  context: string
): RAGDiscovery {
  return {
    query,
    incantationUsed,
    timestamp: new Date(),
    results: citations,
    confidence: citations.length > 0 ? 
      citations.reduce((sum, c) => sum + (c.confidence || 0), 0) / citations.length : 0,
    context
  };
}

/**
 * Enhanced citation quality calculation
 */
export function calculateCitationQuality(citation: Partial<Citation>): number {
  let score = (citation.relevance || 0) * 0.6; // 60% weight for relevance
  
  // Content length factor
  const contentLength = citation.content?.length || 0;
  let lengthScore = 0;
  
  if (contentLength >= 50 && contentLength <= 300) {
    lengthScore = 1; // Ideal length
  } else if (contentLength >= 20 && contentLength <= 500) {
    lengthScore = 0.8; // Good length
  } else if (contentLength >= 10) {
    lengthScore = 0.5; // Acceptable length
  }
  
  score += lengthScore * 0.2; // 20% weight for length
  
  // Confidence factor
  score += (citation.confidence || 0.5) * 0.2; // 20% weight for confidence
  
  return Math.min(score, 1);
}

/**
 * Legacy function for backward compatibility
 */
export function parseTextWithCitations(text: string, citations: Citation[]): {
  cleanText: string;
  references: CitationReference[];
} {
  const { segments, references } = parseTextWithHighlighting(text, citations);
  const cleanText = segments.map(s => s.text).join('');
  return { cleanText, references };
}

/**
 * Extract relevant quotes from citations based on query terms
 */
export function extractRelevantQuotes(
  citations: Citation[], 
  queryTerms: string[], 
  maxQuoteLength: number = 150
): Citation[] {
  return citations.map(citation => {
    const terms = queryTerms.map(term => term.toLowerCase());
    
    // Find best matching excerpt
    let bestMatch = '';
    let bestScore = 0;
    
    // Split content into sentences
    const sentences = citation.content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      if (sentence.length === 0) continue;
      
      // Check how many query terms appear in this sentence
      const score = terms.reduce((acc, term) => {
        return acc + (sentence.toLowerCase().includes(term) ? 1 : 0);
      }, 0);
      
      if (score > bestScore || (score === bestScore && sentence.length < bestMatch.length)) {
        bestMatch = sentence;
        bestScore = score;
      }
    }
    
    // If no good match, just use the first part of the content
    if (bestMatch.length === 0) {
      bestMatch = citation.content.substring(0, maxQuoteLength);
    }
    
    // Return a new citation with the highlighted text set to our best match
    return {
      ...citation,
      highlightedText: bestMatch
    };
  });
}

/**
 * Insert citation markers into text
 */
export function insertCitationMarkers(
  text: string, 
  ragResults: RAGResult[]
): { 
  textWithCitations: string; 
  citations: Citation[] 
} {
  const citations = convertRAGResultsToCitations(ragResults);
  let textWithCitations = text;
  
  // Simple approach: just append citations at the end
  if (citations.length > 0) {
    textWithCitations += '\n\nSources:\n';
    citations.forEach((citation, index) => {
      textWithCitations += `[${index + 1}] ${citation.source}\n`;
    });
  }
  
  return { textWithCitations, citations };
}

/**
 * Generate a bibliography from citations
 */
export function generateBibliography(citations: Citation[]): string {
  if (citations.length === 0) return '';
  
  let bibliography = '## Sources\n\n';
  
  citations.forEach((citation, index) => {
    const date = citation.timestamp ? 
      citation.timestamp.toLocaleDateString() : 
      new Date().toLocaleDateString();
    
    bibliography += `${index + 1}. **${citation.source}** (${date})`;
    if (citation.documentId) {
      bibliography += ` [Document ID: ${citation.documentId}]`;
    }
    bibliography += '\n\n';
  });
  
  return bibliography;
}

/**
 * Filter and rank citations by quality
 */
export function filterAndRankCitations(
  citations: Citation[], 
  minQuality: number = 0.3,
  maxCitations: number = 5
): Citation[] {
  // Filter by minimum quality
  const filteredCitations = citations.filter(c => 
    (c.quality || 0) >= minQuality
  );
  
  // Sort by quality descending
  const sortedCitations = [...filteredCitations].sort((a, b) => 
    (b.quality || 0) - (a.quality || 0)
  );
  
  // Limit to max number
  return sortedCitations.slice(0, maxCitations);
} 