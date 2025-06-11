import React from 'react';
import CitationDisplay from './CitationDisplay';
import type { Citation, SourceDocument, ThinkingProcess } from '../utils/citationProcessor';

const ImprovedCitationDemo: React.FC = () => {
  // Sample citations with cleaner formatting
  const sampleCitations: Citation[] = [
    {
      id: 'cite-1',
      sourceDocument: 'ai_book_recommender_instructions.txt',
      sourceType: 'document',
      textSnippet: 'Personalized Book Recommendation Engine - As a highly skilled book recommendation engine, I have expertise in providing tailored book suggestions based on a user\'s reading history, preferences, and interests.',
      pageNumber: 1,
      startIndex: 0,
      endIndex: 100,
      confidence: 0.95,
      timestamp: new Date(),
      highlightedText: 'highly skilled book recommendation engine',
      responseStartIndex: 15,
      responseEndIndex: 55
    },
    {
      id: 'cite-2',
      sourceDocument: 'ai_book_recommender_instructions.txt',
      sourceType: 'document',
      textSnippet: 'I can analyze user-provided data such as reading history, genre preferences, author preferences, liked themes, and previous reviews to build a detailed profile of their reading tastes.',
      pageNumber: 1,
      startIndex: 200,
      endIndex: 350,
      confidence: 0.88,
      timestamp: new Date(),
      highlightedText: 'analyze user-provided data such as reading history, genre preferences',
      responseStartIndex: 180,
      responseEndIndex: 245
    },
    {
      id: 'cite-3',
      sourceDocument: 'ai_book_recommender_instructions.txt',
      sourceType: 'document',
      textSnippet: 'I utilize recommendation algorithms like collaborative filtering and content-based filtering to compare user profiles against a comprehensive book database and identify potential matches.',
      pageNumber: 1,
      startIndex: 400,
      endIndex: 550,
      confidence: 0.92,
      timestamp: new Date(),
      highlightedText: 'recommendation algorithms like collaborative filtering',
      responseStartIndex: 320,
      responseEndIndex: 375
    }
  ];

  const sampleSources: SourceDocument[] = [
    {
      id: 'doc-1',
      name: 'ai_book_recommender_instructions.txt',
      type: 'txt',
      content: 'Personalized Book Recommendation Engine - As a highly skilled book recommendation engine, I have expertise in providing tailored book suggestions based on a user\'s reading history, preferences, and interests. I can analyze user-provided data such as reading history, genre preferences, author preferences, liked themes, and previous reviews to build a detailed profile of their reading tastes. I utilize recommendation algorithms like collaborative filtering and content-based filtering to compare user profiles against a comprehensive book database and identify potential matches.',
      uploadedAt: new Date()
    }
  ];

  const sampleThinkingProcess: ThinkingProcess = {
    totalThinkingTime: 2800,
    startTime: new Date(Date.now() - 2800),
    endTime: new Date(),
    reasoningSteps: [
      {
        step: 1,
        description: 'Analyzing document content for relevant information',
        timeSpent: 1200,
        sourceDocumentsConsidered: ['ai_book_recommender_instructions.txt'],
        keyInsights: ['Identified key recommendation concepts', 'Found expertise descriptions', 'Located algorithm explanations']
      },
      {
        step: 2,
        description: 'Matching response content with source materials',
        timeSpent: 1000,
        sourceDocumentsConsidered: ['ai_book_recommender_instructions.txt'],
        keyInsights: ['Found direct text matches', 'Calculated confidence scores', 'Identified citation boundaries']
      },
      {
        step: 3,
        description: 'Finalizing citations and formatting',
        timeSpent: 600,
        sourceDocumentsConsidered: ['ai_book_recommender_instructions.txt'],
        keyInsights: ['Optimized text highlighting', 'Cleaned citation markers', 'Improved readability']
      }
    ],
    topicsAnalyzed: ['book', 'recommendation', 'algorithm', 'personalized', 'filtering'],
    confidenceLevel: 0.91
  };

  const improvedResponse = `Hello! As a <span class="cited-text" data-citation-id="cite-1" data-source="ai_book_recommender_instructions.txt">highly skilled book recommendation engine</span> <span class="citation-marker" data-citation-id="cite-1" data-source="ai_book_recommender_instructions.txt">[1]</span>, I have expertise in providing tailored book suggestions based on a user's reading history, preferences, and interests.

I can <span class="cited-text" data-citation-id="cite-2" data-source="ai_book_recommender_instructions.txt">analyze user-provided data such as reading history, genre preferences</span> <span class="citation-marker" data-citation-id="cite-2" data-source="ai_book_recommender_instructions.txt">[2]</span>, author preferences, liked themes, and previous reviews to build a detailed profile of their reading tastes. I then utilize <span class="cited-text" data-citation-id="cite-3" data-source="ai_book_recommender_instructions.txt">recommendation algorithms like collaborative filtering</span> <span class="citation-marker" data-citation-id="cite-3" data-source="ai_book_recommender_instructions.txt">[3]</span> and content-based filtering to compare user profiles against a comprehensive book database and identify potential matches.

My goal is to enhance the user's reading experience by suggesting relevant and engaging titles, while also considering diverse authors and perspectives to broaden their reading horizons. I always aim to explain the reasoning behind each recommendation, highlighting specific elements of the book that make it a good fit for the user's profile.`;

  return (
    <div className="improved-citation-demo max-w-4xl mx-auto p-6">
      <div className="demo-header mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ✨ Improved Citation Display Demo
        </h2>
        <p className="text-gray-600 mb-6">
          See the enhanced text highlighting and citation formatting with better readability, 
          cleaner spacing, and improved visual design.
        </p>
      </div>

      {/* Before vs After Comparison */}
      <div className="comparison-section mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">🔄 Before vs After</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Before - Old Style */}
          <div className="before-section">
            <h4 className="text-lg font-medium text-red-600 mb-3">❌ Before (Cluttered)</h4>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-800">
                Hello! As a <span style={{backgroundColor: '#fef3c7', padding: '4px 8px', borderLeft: '4px solid #f59e0b'}}>highly skilled book recommendation engine</span><span style={{backgroundColor: '#dbeafe', padding: '4px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginLeft: '2px'}}>[1]</span>, I have expertise in providing tailored suggestions...
              </div>
              <div className="mt-2 text-xs text-gray-500">
                ⚠️ Issues: Cluttered spacing, oversized highlights, poor readability
              </div>
            </div>
          </div>

          {/* After - New Style */}
          <div className="after-section">
            <h4 className="text-lg font-medium text-green-600 mb-3">✅ After (Clean)</h4>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-800">
                Hello! As a <span className="cited-text">highly skilled book recommendation engine</span> <span className="citation-marker">[1]</span>, I have expertise in providing tailored suggestions...
              </div>
              <div className="mt-2 text-xs text-gray-500">
                ✅ Improvements: Clean spacing, subtle highlights, better readability
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Improvements */}
      <div className="improvements-section mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">🎯 Key Improvements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="improvement-card bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 font-semibold mb-2">📐 Better Spacing</div>
            <div className="text-sm text-gray-700">Clean margins and padding around citations for improved readability</div>
          </div>
          <div className="improvement-card bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-yellow-600 font-semibold mb-2">🎨 Subtle Highlighting</div>
            <div className="text-sm text-gray-700">Lighter background colors that don't distract from content</div>
          </div>
          <div className="improvement-card bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 font-semibold mb-2">✂️ Smart Boundaries</div>
            <div className="text-sm text-gray-700">Natural text boundaries that respect word and sentence structure</div>
          </div>
          <div className="improvement-card bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-600 font-semibold mb-2">🔢 Clean Markers</div>
            <div className="text-sm text-gray-700">Smaller, superscript-style citation numbers that don't overwhelm</div>
          </div>
        </div>
      </div>

      {/* Full Demo with Improved Formatting */}
      <div className="full-demo-section">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">📄 Full Demo with Improved Formatting</h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <CitationDisplay
            content={improvedResponse}
            citations={sampleCitations}
            sourceDocuments={sampleSources}
            thinkingProcess={sampleThinkingProcess}
          />
        </div>
      </div>

      {/* Technical Details */}
      <div className="technical-details mt-8 p-6 bg-gray-50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">🔧 Technical Improvements</h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-blue-600 font-mono text-xs bg-blue-100 px-2 py-1 rounded">Algorithm</span>
            <span>Enhanced phrase extraction with natural text boundary detection for cleaner highlights</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-mono text-xs bg-green-100 px-2 py-1 rounded">CSS</span>
            <span>Improved styling with subtle backgrounds, better spacing, and superscript citation markers</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-purple-600 font-mono text-xs bg-purple-100 px-2 py-1 rounded">UX</span>
            <span>Reduced visual clutter while maintaining full functionality and citation accuracy</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-orange-600 font-mono text-xs bg-orange-100 px-2 py-1 rounded">Logic</span>
            <span>Smart punctuation handling and whitespace cleanup for professional presentation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedCitationDemo; 