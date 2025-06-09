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
  
  // Improved approach to look for quoted content that matches citation sources
  for (const citation of citations) {
    // Try different approaches to find matching content
    let matchFound = false;
    
    // 1. First try to use the highlightedText if available
    if (citation.highlightedText && citation.highlightedText.length > 10) {
      const highlightText = citation.highlightedText;
      // Try to find a match for the first 50 characters of the highlight (case insensitive)
      const searchLength = Math.min(50, highlightText.length);
      const searchText = highlightText.substring(0, searchLength).toLowerCase();
      const matchIndex = text.toLowerCase().indexOf(searchText);
      
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
        matchFound = true;
      }
    }
    
    // 2. If no match found with highlightedText, try with the first paragraph of content
    if (!matchFound && citation.content) {
      // Extract the first paragraph of the content (up to 200 chars)
      const contentParagraphs = citation.content.split('\n\n');
      const firstParagraph = contentParagraphs[0].substring(0, 200);
      
      // Try to find keyword matches (look for 3+ word phrases)
      const words = firstParagraph.split(/\s+/).filter(w => w.length > 3);
      
      for (let i = 0; i < words.length - 2; i++) {
        // Create a 3-word phrase to search for
        const phrase = `${words[i]} ${words[i+1]} ${words[i+2]}`.toLowerCase();
        if (phrase.length < 10) continue; // Skip very short phrases
        
        const phraseIndex = text.toLowerCase().indexOf(phrase);
        if (phraseIndex !== -1 && phraseIndex >= currentIndex) {
          // Expand match to include surrounding context (find sentence boundaries)
          let expandedStart = phraseIndex;
          let expandedEnd = phraseIndex + phrase.length;
          
          // Expand backward to sentence start or reasonable limit
          for (let j = phraseIndex; j > Math.max(currentIndex, phraseIndex - 100); j--) {
            if ('.!?'.includes(text[j])) {
              expandedStart = j + 1;
              break;
            }
          }
          
          // Expand forward to sentence end or reasonable limit
          for (let j = phraseIndex + phrase.length; j < Math.min(text.length, phraseIndex + phrase.length + 100); j++) {
            if ('.!?'.includes(text[j])) {
              expandedEnd = j + 1;
              break;
            }
          }
          
          // Add non-highlighted text before this match
          if (expandedStart > currentIndex) {
            segments.push({
              text: text.substring(currentIndex, expandedStart),
              isHighlighted: false
            });
          }
          
          // Add highlighted text
          segments.push({
            text: text.substring(expandedStart, expandedEnd),
            isHighlighted: true,
            citationId: citation.id
          });
          
          // Add reference
          references.push({
            citationId: citation.id,
            inlineText: text.substring(expandedStart, expandedEnd),
            position: expandedStart,
            highlightStart: expandedStart,
            highlightEnd: expandedEnd
          });
          
          currentIndex = expandedEnd;
          matchFound = true;
          break;
        }
      }
    }
    
    // 3. If still no match found, try source name as last resort
    if (!matchFound && citation.source) {
      const sourceNameIndex = text.indexOf(citation.source);
      if (sourceNameIndex !== -1 && sourceNameIndex >= currentIndex) {
        // Find the sentence containing the source name
        let sentenceStart = sourceNameIndex;
        let sentenceEnd = sourceNameIndex + citation.source.length;
        
        // Look back for sentence start
        for (let j = sourceNameIndex; j > Math.max(currentIndex, sourceNameIndex - 100); j--) {
          if ('.!?'.includes(text[j])) {
            sentenceStart = j + 1;
            break;
          }
        }
        
        // Look forward for sentence end
        for (let j = sentenceEnd; j < Math.min(text.length, sentenceEnd + 100); j++) {
          if ('.!?'.includes(text[j])) {
            sentenceEnd = j + 1;
            break;
          }
        }
        
        // Add non-highlighted text before this match
        if (sentenceStart > currentIndex) {
          segments.push({
            text: text.substring(currentIndex, sentenceStart),
            isHighlighted: false
          });
        }
        
        // Add highlighted text
        segments.push({
          text: text.substring(sentenceStart, sentenceEnd),
          isHighlighted: true,
          citationId: citation.id
        });
        
        // Add reference
        references.push({
          citationId: citation.id,
          inlineText: text.substring(sentenceStart, sentenceEnd),
          position: sentenceStart,
          highlightStart: sentenceStart,
          highlightEnd: sentenceEnd
        });
        
        currentIndex = sentenceEnd;
      }
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

/**
 * Add citations to a message
 * This function should be called after streaming is complete
 * @param message The message content
 * @param citations Array of citations to attach
 * @returns Object containing the message with citation references attached
 */
export function attachCitationsToMessage(
  message: string,
  citations: Citation[]
): {
  messageWithCitations: string;
  citationReferences: CitationReference[];
} {
  // If no citations, return the original message
  if (!citations || citations.length === 0) {
    return { 
      messageWithCitations: message,
      citationReferences: []
    };
  }
  
  // Use the parsing function to get citation references
  const { segments, references } = parseTextWithHighlighting(message, citations);
  
  // The message content should remain the same for now
  // But we return the citation references for later use
  return {
    messageWithCitations: message,
    citationReferences: references
  };
} 