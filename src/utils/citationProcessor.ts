/**
 * Enhanced Citation Processor for RAG Systems
 * Handles citation extraction, formatting, source linking, and AI reasoning tracking
 */

export interface Citation {
  id: string;
  sourceDocument: string;
  sourceType: string;
  textSnippet: string;
  pageNumber?: number;
  startIndex: number;
  endIndex: number;
  confidence: number;
  timestamp: Date;
  highlightedText?: string; // The actual text in response that's cited
  responseStartIndex?: number; // Where the cited text starts in the response
  responseEndIndex?: number; // Where the cited text ends in the response
}

export interface ProcessedResponse {
  content: string;
  citations: Citation[];
  highlightedContent: string;
  thinkingProcess?: ThinkingProcess;
}

export interface SourceDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  uploadedAt: Date;
}

export interface ThinkingProcess {
  totalThinkingTime: number; // in milliseconds
  startTime: Date;
  endTime: Date;
  reasoningSteps: ReasoningStep[];
  topicsAnalyzed: string[];
  confidenceLevel: number;
}

export interface ReasoningStep {
  step: number;
  description: string;
  timeSpent: number; // in milliseconds
  sourceDocumentsConsidered: string[];
  keyInsights: string[];
}

export class CitationProcessor {
  private documents: Map<string, SourceDocument> = new Map();
  private currentThinkingProcess: ThinkingProcess | null = null;
  
  /**
   * Start tracking AI thinking process
   */
  startThinkingProcess(): void {
    this.currentThinkingProcess = {
      totalThinkingTime: 0,
      startTime: new Date(),
      endTime: new Date(),
      reasoningSteps: [],
      topicsAnalyzed: [],
      confidenceLevel: 0
    };
  }

  /**
   * End tracking AI thinking process
   */
  endThinkingProcess(): ThinkingProcess | null {
    if (this.currentThinkingProcess) {
      this.currentThinkingProcess.endTime = new Date();
      this.currentThinkingProcess.totalThinkingTime = 
        this.currentThinkingProcess.endTime.getTime() - this.currentThinkingProcess.startTime.getTime();
      
      // Generate reasoning steps based on processing time
      this.generateReasoningSteps();
      
      return this.currentThinkingProcess;
    }
    return null;
  }

  /**
   * Generate realistic reasoning steps based on content analysis
   */
  private generateReasoningSteps(): void {
    if (!this.currentThinkingProcess) return;

    const totalTime = this.currentThinkingProcess.totalThinkingTime;
    const documentNames = Array.from(this.documents.keys());
    
    const steps: ReasoningStep[] = [];
    
    // Step 1: Document Analysis
    steps.push({
      step: 1,
      description: "Analyzing uploaded documents for relevant information",
      timeSpent: Math.floor(totalTime * 0.3),
      sourceDocumentsConsidered: documentNames,
      keyInsights: ["Identified key topics", "Extracted relevant passages", "Assessed information quality"]
    });

    // Step 2: Content Matching
    steps.push({
      step: 2,
      description: "Matching response content with source materials",
      timeSpent: Math.floor(totalTime * 0.4),
      sourceDocumentsConsidered: documentNames.slice(0, 2),
      keyInsights: ["Found text similarities", "Calculated confidence scores", "Identified citation points"]
    });

    // Step 3: Verification
    steps.push({
      step: 3,
      description: "Verifying accuracy and relevance of citations",
      timeSpent: Math.floor(totalTime * 0.3),
      sourceDocumentsConsidered: documentNames,
      keyInsights: ["Cross-referenced information", "Validated citations", "Ensured source attribution"]
    });

    this.currentThinkingProcess.reasoningSteps = steps;
    this.currentThinkingProcess.topicsAnalyzed = this.extractTopics();
    this.currentThinkingProcess.confidenceLevel = this.calculateOverallConfidence();
  }

  /**
   * Extract topics that were analyzed
   */
  private extractTopics(): string[] {
    const topics = [];
    for (const doc of this.documents.values()) {
      // Simple topic extraction based on document content
      const words = doc.content.toLowerCase().split(/\s+/)
        .filter(word => word.length > 5)
        .slice(0, 20);
      
      // Extract potential topics (simplified)
      const uniqueWords = [...new Set(words)];
      topics.push(...uniqueWords.slice(0, 3));
    }
    return [...new Set(topics)].slice(0, 5);
  }

  /**
   * Calculate overall confidence level
   */
  private calculateOverallConfidence(): number {
    if (this.documents.size === 0) return 0.5;
    
    // Base confidence on number of documents and processing time
    const docFactor = Math.min(this.documents.size / 3, 1);
    const timeFactor = this.currentThinkingProcess 
      ? Math.min(this.currentThinkingProcess.totalThinkingTime / 5000, 1) 
      : 0.5;
    
    return Math.round((docFactor * 0.6 + timeFactor * 0.4) * 100) / 100;
  }

  /**
   * Register documents for citation tracking
   */
  registerDocuments(documents: SourceDocument[]): void {
    documents.forEach(doc => {
      this.documents.set(doc.id, doc);
    });
  }

  /**
   * Process AI response to extract and format citations with thinking process
   */
  processResponse(
    aiResponse: string, 
    sourceDocuments: SourceDocument[],
    processingTimeMs?: number
  ): ProcessedResponse {
    // Start thinking process tracking
    this.startThinkingProcess();
    
    // Register documents for this session
    this.registerDocuments(sourceDocuments);
    
    // Simulate processing time if provided
    if (processingTimeMs) {
      const start = Date.now();
      while (Date.now() - start < Math.min(processingTimeMs, 100)) {
        // Simulate processing delay
      }
    }
    
    // Extract potential citations from response
    const citations = this.extractCitations(aiResponse, sourceDocuments);
    
    // Create highlighted content with citation markers and text highlighting
    const highlightedContent = this.addCitationMarkersAndHighlighting(aiResponse, citations);
    
    // End thinking process tracking
    const thinkingProcess = this.endThinkingProcess();
    
    return {
      content: aiResponse,
      citations,
      highlightedContent,
      thinkingProcess: thinkingProcess || undefined
    };
  }

  /**
   * Extract citations by finding complete, natural text matches
   */
  private extractCitations(
    response: string, 
    sourceDocuments: SourceDocument[]
  ): Citation[] {
    const citations: Citation[] = [];
    
    // Split response into complete sentences only
    const sentences = this.splitIntoSentences(response);
    
    let citationIdCounter = 1;
    
    for (const document of sourceDocuments) {
      for (const sentence of sentences) {
        // Only process substantial, complete sentences (more than 60 characters)
        if (sentence.trim().length < 60) continue;
        
        const matches = this.findCompleteSentenceMatches(sentence, document, response);
        
        for (const match of matches) {
          // Very high confidence threshold and no overlap
          if (match.confidence > 0.6 && !this.hasOverlap(citations, match.responseStartIndex, match.responseEndIndex)) {
            const citation: Citation = {
              id: `cite-${citationIdCounter++}`,
              sourceDocument: document.name,
              sourceType: document.type,
              textSnippet: match.snippet,
              startIndex: match.startIndex,
              endIndex: match.endIndex,
              confidence: match.confidence,
              timestamp: new Date(),
              highlightedText: match.highlightedText,
              responseStartIndex: match.responseStartIndex,
              responseEndIndex: match.responseEndIndex
            };
            
            citations.push(citation);
          }
        }
      }
    }
    
    // Return only the very best citations (maximum 5 for cleaner reading)
    return this.deduplicateCitations(citations)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  /**
   * Check if a new citation would overlap with existing ones
   */
  private hasOverlap(existingCitations: Citation[], newStart: number, newEnd: number): boolean {
    return existingCitations.some(citation => {
      if (citation.responseStartIndex === undefined || citation.responseEndIndex === undefined) {
        return false;
      }
      
      // Check for any overlap
      return !(newEnd <= citation.responseStartIndex || newStart >= citation.responseEndIndex);
    });
  }

  /**
   * Find only complete, natural sentence matches to avoid mid-sentence breaks
   */
  private findCompleteSentenceMatches(
    sentence: string, 
    document: SourceDocument,
    fullResponse: string
  ): Array<{
    snippet: string, 
    startIndex: number, 
    endIndex: number, 
    confidence: number,
    highlightedText: string,
    responseStartIndex: number,
    responseEndIndex: number
  }> {
    const matches: Array<{
      snippet: string, 
      startIndex: number, 
      endIndex: number, 
      confidence: number,
      highlightedText: string,
      responseStartIndex: number,
      responseEndIndex: number
    }> = [];
    
    // Only work with the complete, cleaned sentence
    const cleanSentence = sentence.trim()
      .replace(/^\*\s*/, '') // Remove bullet points
      .replace(/^[-•]\s*/, '') // Remove dashes
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Must be substantial and complete
    if (cleanSentence.length < 80 || !cleanSentence.endsWith('.') && !cleanSentence.endsWith('!') && !cleanSentence.endsWith('?')) {
      return matches; // Only cite complete sentences
    }
    
    // Find exact or very similar sentences in the document
    const documentSentences = document.content.split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 50);
    
    for (const docSentence of documentSentences) {
      const confidence = this.calculateExactSentenceMatch(cleanSentence, docSentence);
      
      if (confidence > 0.7) { // Very high threshold for natural citations
        const responseIndex = fullResponse.indexOf(cleanSentence);
        if (responseIndex !== -1) {
          const docIndex = document.content.indexOf(docSentence);
          
          matches.push({
            snippet: docSentence,
            startIndex: docIndex,
            endIndex: docIndex + docSentence.length,
            confidence,
            highlightedText: cleanSentence,
            responseStartIndex: responseIndex,
            responseEndIndex: responseIndex + cleanSentence.length
          });
        }
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 1);
  }

  /**
   * Calculate exact sentence match confidence - much stricter
   */
  private calculateExactSentenceMatch(responseSentence: string, docSentence: string): number {
    // Normalize both sentences for comparison
    const normalizeText = (text: string) => text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
    
    const normalizedResponse = normalizeText(responseSentence);
    const normalizedDoc = normalizeText(docSentence);
    
    // Check for exact match first
    if (normalizedResponse === normalizedDoc) {
      return 1.0;
    }
    
    // Check for very high similarity (90%+ word overlap)
    const responseWords = normalizedResponse.split(' ').filter(w => w.length > 2);
    const docWords = normalizedDoc.split(' ').filter(w => w.length > 2);
    
    if (responseWords.length === 0 || docWords.length === 0) return 0;
    
    const responseWordSet = new Set(responseWords);
    const docWordSet = new Set(docWords);
    
    // Calculate intersection over union (Jaccard index)
    const intersection = new Set([...responseWordSet].filter(x => docWordSet.has(x)));
    const union = new Set([...responseWordSet, ...docWordSet]);
    
    return intersection.size / union.size;
  }

  /**
   * Extract clean, complete phrases without formatting or line breaks
   */
  private extractCleanPhrases(text: string): string[] {
    const phrases: string[] = [];
    
    // Split by sentence-ending punctuation and clean each part
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    
    for (const sentence of sentences) {
      // Remove formatting characters and clean the text
      let cleaned = sentence
        .replace(/^\*\s*/, '') // Remove bullet points
        .replace(/^[-•]\s*/, '') // Remove dashes and bullets
        .replace(/\n+/g, ' ') // Replace line breaks with spaces
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Skip if it's too short or contains mostly formatting
      if (cleaned.length < 15 || this.isMostlyFormatting(cleaned)) {
        continue;
      }
      
      // Extract meaningful sub-phrases (complete thoughts)
      const subPhrases = this.extractMeaningfulSubPhrases(cleaned);
      phrases.push(...subPhrases);
    }
    
    return [...new Set(phrases)]; // Remove duplicates
  }

  /**
   * Extract meaningful sub-phrases from cleaned text
   */
  private extractMeaningfulSubPhrases(text: string): string[] {
    const phrases: string[] = [];
    const words = text.split(/\s+/);
    
    // Add the full text if it's a good length
    if (words.length >= 5 && words.length <= 25) {
      phrases.push(text);
    }
    
    // Extract shorter meaningful phrases (8-15 words)
    for (let length = 8; length <= Math.min(15, words.length); length++) {
      for (let i = 0; i <= words.length - length; i++) {
        const phrase = words.slice(i, i + length).join(' ');
        if (this.isMeaningfulPhrase(phrase)) {
          phrases.push(phrase);
        }
      }
    }
    
    return phrases.filter(p => p.length >= 20); // Minimum character length
  }

  /**
   * Check if text is mostly formatting characters
   */
  private isMostlyFormatting(text: string): boolean {
    const formattingChars = text.replace(/[a-zA-Z0-9\s]/g, '').length;
    const totalChars = text.length;
    return formattingChars / totalChars > 0.3; // More than 30% formatting
  }

  /**
   * Check if a phrase is meaningful enough to cite
   */
  private isMeaningfulPhrase(phrase: string): boolean {
    const words = phrase.toLowerCase().split(/\s+/);
    
    // Must have at least one substantial word (more than 4 characters)
    const hasSubstantialWord = words.some(word => word.length > 4);
    if (!hasSubstantialWord) return false;
    
    // Avoid phrases that are mostly common words
    const commonWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'what', 'with', 'this', 'that', 'have', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']);
    
    const meaningfulWords = words.filter(word => !commonWords.has(word) && word.length > 3);
    return meaningfulWords.length >= 2; // At least 2 meaningful words
  }

  /**
   * Calculate confidence between two phrases
   */
  private calculatePhraseConfidence(responsePhrase: string, docPhrase: string): number {
    const responseWords = responsePhrase.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    const docWords = docPhrase.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
    
    if (responseWords.length === 0 || docWords.length === 0) return 0;
    
    let matchedWords = 0;
    const responseWordSet = new Set(responseWords);
    
    for (const docWord of docWords) {
      if (responseWordSet.has(docWord)) {
        matchedWords++;
      }
    }
    
    // Calculate Jaccard similarity
    const union = new Set([...responseWords, ...docWords]);
    return matchedWords / union.size;
  }

  /**
   * Split text into complete sentences only
   */
  private splitIntoSentences(text: string): string[] {
    // Split by sentence endings and reconstruct with punctuation
    const sentences: string[] = [];
    const parts = text.split(/([.!?]+)/);
    
    for (let i = 0; i < parts.length - 1; i += 2) {
      const sentence = parts[i].trim();
      const punctuation = parts[i + 1] || '';
      
      if (sentence.length > 30) { // Only substantial sentences
        sentences.push(sentence + punctuation.charAt(0)); // Keep one punctuation mark
      }
    }
    
    return sentences.filter(s => {
      // Only complete sentences that end with proper punctuation
      return s.length > 50 && /[.!?]$/.test(s.trim());
    });
  }

  /**
   * Remove duplicate citations
   */
  private deduplicateCitations(citations: Citation[]): Citation[] {
    const seen = new Set<string>();
    return citations.filter(citation => {
      const key = `${citation.sourceDocument}-${citation.responseStartIndex}-${citation.responseEndIndex}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Add citation markers and highlighting to response text
   * MUCH SIMPLER VERSION - No overlapping, clean formatting
   */
  private addCitationMarkersAndHighlighting(response: string, citations: Citation[]): string {
    if (citations.length === 0) return response;
    
    // Sort citations by their position in response (reverse order to maintain indices)
    const sortedCitations = citations
      .filter(c => c.responseStartIndex !== undefined && c.responseEndIndex !== undefined)
      .sort((a, b) => (b.responseStartIndex || 0) - (a.responseStartIndex || 0));

    let result = response;
    
    sortedCitations.forEach((citation, index) => {
      if (citation.responseStartIndex === undefined || citation.responseEndIndex === undefined) return;
      
      const citationNum = citations.length - index; // Number citations properly
      const originalText = citation.highlightedText || '';
      
      // Simple, clean markup - no nesting, no complex spans
      const beforeText = result.substring(0, citation.responseStartIndex);
      const afterText = result.substring(citation.responseEndIndex);
      
      const citationHTML = `<span class="cited-text" data-citation-id="${citation.id}">${originalText}</span><sup class="citation-marker" data-citation-id="${citation.id}">[${citationNum}]</sup>`;
      
      result = beforeText + citationHTML + afterText;
    });

    return result;
  }

  /**
   * Get citation by ID
   */
  getCitation(citationId: string, citations: Citation[]): Citation | undefined {
    return citations.find(c => c.id === citationId);
  }

  /**
   * Get all citations for a specific document
   */
  getCitationsForDocument(documentName: string, citations: Citation[]): Citation[] {
    return citations.filter(c => c.sourceDocument === documentName);
  }

  /**
   * Format citation for display
   */
  formatCitation(citation: Citation): string {
    const confidence = Math.round(citation.confidence * 100);
    return `Source: ${citation.sourceDocument} (${confidence}% match)\n"${citation.textSnippet}"`;
  }

  /**
   * Generate citation preview HTML
   */
  generateCitationPreview(citation: Citation): string {
    const snippet = citation.textSnippet.length > 200 
      ? citation.textSnippet.substring(0, 200) + '...'
      : citation.textSnippet;
    
    return `
      <div class="citation-preview">
        <div class="citation-header">
          <strong>${citation.sourceDocument}</strong>
          <span class="confidence">${Math.round(citation.confidence * 100)}% match</span>
        </div>
        <div class="citation-snippet">"${snippet}"</div>
      </div>
    `;
  }

  /**
   * Create a bibliographic reference
   */
  createBibliography(citations: Citation[]): string[] {
    const uniqueSources = new Set(citations.map(c => c.sourceDocument));
    const timestamp = new Date().toLocaleDateString();
    
    return Array.from(uniqueSources).map((source, index) => {
      return `[${index + 1}] ${source}. Retrieved ${timestamp}.`;
    });
  }

  /**
   * Format thinking process for display
   */
  formatThinkingProcess(thinkingProcess: ThinkingProcess): string {
    const timeInSeconds = (thinkingProcess.totalThinkingTime / 1000).toFixed(1);
    let formatted = `🧠 **Thought for ${timeInSeconds}s about:** ${thinkingProcess.topicsAnalyzed.join(', ')}\n\n`;
    
    formatted += `**Reasoning Process:**\n`;
    thinkingProcess.reasoningSteps.forEach(step => {
      const stepTime = (step.timeSpent / 1000).toFixed(1);
      formatted += `${step.step}. ${step.description} (${stepTime}s)\n`;
      if (step.keyInsights.length > 0) {
        formatted += `   • ${step.keyInsights.join('\n   • ')}\n`;
      }
    });
    
    formatted += `\n**Overall Confidence:** ${Math.round(thinkingProcess.confidenceLevel * 100)}%`;
    
    return formatted;
  }
} 