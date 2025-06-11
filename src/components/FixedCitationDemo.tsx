import React from 'react';
import { CitationProcessor } from '../utils/citationProcessor';
import type { SourceDocument } from '../utils/citationProcessor';

const FixedCitationDemo: React.FC = () => {
  const processor = new CitationProcessor();

  // Sample document
  const sampleDoc: SourceDocument = {
    id: 'book-rec-guide',
    name: 'Book Recommendation Guide',
    type: 'text',
    content: `When collecting user preferences for book recommendations, it's important to ask about several key areas. What genres do you typically enjoy reading, such as fiction, non-fiction, mystery, or romance? Are there any authors you particularly like or dislike, as this helps narrow down writing styles? Understanding themes that interest you is also valuable. I am designed to suggest books that align with a user's individual tastes and reading habits, creating personalized recommendations based on their specific preferences and reading history.`,
    uploadedAt: new Date()
  };

  // Example response that would have formatting issues
  const cleanAIResponse = `Hello! I'd love to give you some book recommendations. To make sure they're a good fit, could you tell me a bit about what you enjoy reading? For example:

What genres do you typically enjoy?
* Are there any authors you particularly like or dislike?
Are there any themes you find interesting?

The more information you give me, the better I can tailor the recommendations to your tastes! I am designed to suggest books that align with a user's individual tastes and reading habits.`;

  // Process with the fixed algorithm
  const processedResult = processor.processResponse(cleanAIResponse, [sampleDoc]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ✅ Fixed Citation System
        </h2>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Key Improvements:</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• ✅ No more overlapping or nested citations</li>
            <li>• ✅ Clean, simple HTML structure</li>
            <li>• ✅ Readable text with subtle highlighting</li>
            <li>• ✅ Sentence-level matching instead of fragmented phrases</li>
            <li>• ✅ Limited to 10 citations maximum</li>
            <li>• ✅ High confidence threshold (40%+)</li>
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Clean Citation Display
        </h3>
        <div 
          className="text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: processedResult.highlightedContent }}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Citation Details ({processedResult.citations.length} found)
        </h3>
        <div className="space-y-3">
          {processedResult.citations.map((citation, index) => (
            <div key={citation.id} className="bg-white p-4 rounded border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-blue-600">[{index + 1}]</span>
                <span className="text-sm text-gray-500">
                  {Math.round(citation.confidence * 100)}% confidence
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <strong>Source:</strong> {citation.sourceDocument}
              </div>
              <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                "{citation.textSnippet.substring(0, 200)}..."
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-green-800 font-semibold mb-2">🎉 Problem Solved!</h4>
        <p className="text-green-700 text-sm">
          The citation system now uses a much simpler algorithm that:
        </p>
        <ul className="text-green-700 text-sm mt-2 space-y-1">
          <li>• Prevents overlapping citations by checking for conflicts</li>
          <li>• Uses sentence-level matching for better readability</li>
          <li>• Creates clean HTML without nested spans</li>
          <li>• Uses superscript citation numbers</li>
          <li>• Limits citations to avoid clutter</li>
        </ul>
      </div>
    </div>
  );
};

export default FixedCitationDemo; 