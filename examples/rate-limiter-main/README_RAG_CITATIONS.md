# 🔍 Enhanced RAG Citation System

## Overview

The enhanced RAG (Retrieval-Augmented Generation) citation system provides interactive text highlighting, source attribution, and incantation tracking to show exactly how AI discoveries were made.

## Key Features

### 🎯 **Interactive Text Highlighting**
- Text sourced from documents is highlighted in yellow with clickable citations
- Hover/click to see source details, relevance scores, and quality indicators
- Live tooltips show document source, page numbers, and confidence metrics

### ⚡ **Incantation Tracking**
- Tracks which prompt patterns (incantations) led to each discovery
- Shows the reasoning method used to find information
- Examples: `semantic-search`, `chain-of-thought`, `expert-persona`

### 📚 **Enhanced Source Attribution**
- Citations include relevance scores, confidence levels, and quality ratings
- Links back to original documents with page references
- Timestamp tracking for discovery history

### 🧠 **Discovery History**
- Complete research trail showing all RAG discoveries
- Organized by incantation type and timestamp
- Quality metrics and source counts for each discovery

## How It Works

### 1. Document Upload & Processing
```typescript
// Enhanced RAG processor handles multiple document types
const ragProcessor = new EnhancedRAGProcessor();
await ragProcessor.processFile(file); // PDF, Word, TXT, MD, etc.
```

### 2. Intelligent Query Analysis
```typescript
// Incantation engine selects best prompt pattern
const recommendedPatterns = incantationEngine.recommendPatterns('document-search', query);
const selectedIncantation = recommendedPatterns[0] || 'semantic-search';
```

### 3. RAG Search with Citation Generation
```typescript
// Search with incantation tracking
const ragResults = ragProcessor.searchDocuments({query, maxResults: 5});
const citations = convertRAGResultsToCitations(ragResults, selectedIncantation);
```

### 4. Text Highlighting & Discovery Tracking
```typescript
// Parse text and create interactive highlights
const { segments } = parseTextWithHighlighting(text, citations, discoveries);

// Track discovery for history
const discovery = createRAGDiscovery(query, incantation, citations, context);
```

## Components

### HighlightedText Component
- Renders text with interactive citation highlights
- Clickable highlights show source tooltips
- Supports multiple citation types

### CitationRenderer Component  
- Displays expandable citation cards
- Shows relevance scores and quality metrics
- Links to original sources

### RAGDiscoveryPanel Component
- Research history dashboard
- Organized by incantation type
- Shows discovery timeline and statistics

## Incantation Types

### 🔍 **Semantic Search**
- Default RAG search using vector similarity
- Good for general information retrieval

### 🧠 **Chain of Thought**
- Step-by-step reasoning for complex queries
- Better for analytical questions

### 🎭 **Expert Persona**
- Search with domain expertise context
- Improved for specialized knowledge

### ⏪ **Working Backwards**
- Goal-oriented search from desired outcome
- Useful for implementation guidance

### 🔄 **Assumption Reversal**
- Challenge common assumptions to find alternative perspectives
- Good for creative problem solving

## Usage Example

```typescript
// 1. Enable RAG and upload documents
setRagEnabled(true);
await ragProcessor.processFile(pdfFile);

// 2. Ask a question - system automatically:
//    - Analyzes query complexity
//    - Selects appropriate incantation
//    - Searches documents with chosen strategy
//    - Generates citations with quality scores
//    - Creates highlighted text with interactive sources
//    - Tracks discovery for future reference

// 3. User sees:
//    - Highlighted text showing RAG sources
//    - Clickable citations with source details
//    - Incantation used for discovery
//    - Quality and confidence metrics
//    - Complete research history
```

## Benefits

### For Users
- **Transparency**: See exactly where information comes from
- **Trust**: Confidence scores and quality metrics
- **Learning**: Understand how AI finds information
- **History**: Complete research trail for reference

### For Developers
- **Debugging**: Track which prompt patterns work best
- **Optimization**: Quality metrics for improving RAG performance
- **Analytics**: Discovery patterns and success rates
- **Extensibility**: Easy to add new incantation types

## Integration

The enhanced citation system integrates seamlessly with existing ConversationView components:

1. **Automatic Detection**: RAG searches trigger citation generation
2. **Smart Highlighting**: Text parsing identifies RAG-sourced content
3. **Interactive UI**: Citations are clickable with rich tooltips
4. **History Tracking**: All discoveries are automatically logged

No additional configuration required - the system works out of the box with document uploads and RAG-enabled conversations. 