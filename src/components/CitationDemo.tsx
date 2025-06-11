import React, { useState } from 'react';
import { CitationProcessor, type Citation, type SourceDocument } from '../utils/citationProcessor';
import CitationDisplay from './CitationDisplay';
import DocumentViewer from './DocumentViewer';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';

const CitationDemo: React.FC = () => {
  const [documentViewer, setDocumentViewer] = useState<{
    isOpen: boolean;
    document: SourceDocument | null;
    citation: Citation | null;
  }>({ isOpen: false, document: null, citation: null });

  // Sample documents
  const sampleDocuments: SourceDocument[] = [
    {
      id: 'climate-report',
      name: 'Climate Change Report 2024',
      type: 'pdf',
      content: `Global temperatures have risen by 1.1°C since pre-industrial times. The Intergovernmental Panel on Climate Change (IPCC) reports that human activities are unequivocally responsible for this warming trend. Sea levels are rising at an accelerated rate of 3.3mm per year. The Arctic ice sheet has lost approximately 280 billion tons of ice annually since 1993. Extreme weather events, including hurricanes, droughts, and heat waves, are becoming more frequent and intense.

The Paris Agreement, signed in 2015, aims to limit global warming to well below 2°C above pre-industrial levels. Countries have committed to reducing greenhouse gas emissions by 43% by 2030 compared to 2019 levels. Renewable energy sources now account for 12% of global energy consumption. The transition to clean energy could create 42 million jobs worldwide by 2030.

Carbon dioxide levels in the atmosphere reached 421 parts per million in 2023, the highest in human history. Deforestation contributes approximately 11% of global CO2 emissions. Protecting and restoring forests could provide up to 37% of the emission reductions needed to meet climate targets.`,
      uploadedAt: new Date('2024-01-15')
    },
    {
      id: 'tech-innovation',
      name: 'Technology Innovation Trends',
      type: 'txt',
      content: `Artificial Intelligence is transforming industries at an unprecedented pace. Machine learning algorithms can now process vast amounts of data in real-time, enabling predictive analytics and automated decision-making. Natural Language Processing has advanced significantly, with large language models achieving human-like text generation capabilities.

Quantum computing represents the next frontier in computational power. IBM's quantum computers have demonstrated quantum advantage in specific problem domains. These systems could revolutionize cryptography, drug discovery, and financial modeling within the next decade.

The Internet of Things (IoT) ecosystem continues to expand, with over 35 billion connected devices expected by 2025. Smart cities are implementing IoT sensors to optimize traffic flow, reduce energy consumption, and improve public safety. Edge computing brings processing closer to data sources, reducing latency and improving real-time applications.

Blockchain technology extends beyond cryptocurrency, enabling secure supply chain tracking, digital identity verification, and decentralized finance applications. Web3 technologies are creating new paradigms for digital ownership and online interactions.`,
      uploadedAt: new Date('2024-02-20')
    }
  ];

  // Create citation processor and process sample response
  const citationProcessor = new CitationProcessor();
  
  const sampleResponse = `# Climate and Technology Analysis

## Climate Change Findings

Recent climate research shows that **global temperatures have increased significantly**, with the IPCC confirming human responsibility for these changes. The rate of ***sea level rise*** has accelerated to concerning levels, while extreme weather patterns become more common worldwide.

Key findings include:
- Temperature increases of 1.1°C since pre-industrial times
- Sea level rise at 3.3mm per year
- Arctic ice loss of 280 billion tons annually

## Technology Innovation Trends

In the technology sector, ***artificial intelligence*** is driving unprecedented innovation across multiple industries. Machine learning capabilities have evolved to enable *real-time data processing* and automated decision-making at scale. 

The development of **quantum computing** promises to revolutionize computational capabilities, with companies like IBM leading breakthrough research.

### Internet of Things Expansion

The Internet of Things continues expanding rapidly, with **over 35 billion connected devices** expected by 2025. These technologies work together with blockchain innovations to create new digital paradigms and secure systems for the future.

> "These systems could revolutionize cryptography, drug discovery, and financial modeling within the next decade."

Smart cities are implementing IoT sensors to optimize traffic flow, reduce energy consumption, and improve public safety.`;

  const processedResponse = citationProcessor.processResponse(sampleResponse, sampleDocuments, 3500);

  const handleViewDocument = (document: SourceDocument, citation: Citation) => {
    setDocumentViewer({
      isOpen: true,
      document,
      citation
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Citation System Demo</h1>
        <p className="text-gray-600">Interactive demonstration of intelligent citation tracking and source linking</p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Smart Citations</h3>
          </div>
          <p className="text-sm text-blue-700">Automatically detect and link content to source documents with confidence scoring</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Interactive Previews</h3>
          </div>
          <p className="text-sm text-green-700">Click citations to see source previews with highlighted relevant sections</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Full Document Access</h3>
          </div>
          <p className="text-sm text-purple-700">View complete source documents with search and navigation capabilities</p>
        </div>
      </div>

      {/* Sample Documents */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Uploaded Documents</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {sampleDocuments.map(doc => (
            <div key={doc.id} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">{doc.name}</span>
              </div>
              <div className="text-xs text-gray-500">
                {doc.type.toUpperCase()} • {Math.round(doc.content.length / 1000)}k chars • {doc.uploadedAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Response with Citations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI Response with Citations</h2>
          <div className="relative group">
            <button className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-200 transition-colors">
              💡 How it works
            </button>
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <h3 className="font-semibold text-gray-900 mb-2">Smart Citation System</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <strong>Automatic Detection:</strong> AI responses are analyzed for content matching source documents</li>
                <li>• <strong>Confidence Scoring:</strong> Each citation shows how confident the match is (30-95%)</li>
                <li>• <strong>Interactive Citations:</strong> Click [1], [2] etc. to see source previews</li>
                <li>• <strong>Full Document Access:</strong> "View Source" opens the complete document with highlighting</li>
                <li>• <strong>Response Summary:</strong> Hover "Summary" for key statistics and overview</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <span>📝</span>
            <span>Hover <strong>"Summary"</strong> for response overview • Click citation numbers <strong>[1] [2]</strong> for source previews • Try the <strong>"View Source"</strong> button</span>
          </div>
          <CitationDisplay
            content={processedResponse.highlightedContent}
            citations={processedResponse.citations}
            sourceDocuments={sampleDocuments}
            thinkingProcess={processedResponse.thinkingProcess}
            onViewDocument={handleViewDocument}
          />
        </div>
      </div>

      {/* Citation Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-2">Citation Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{processedResponse.citations.length}</div>
            <div className="text-gray-600">Citations Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{sampleDocuments.length}</div>
            <div className="text-gray-600">Source Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(processedResponse.citations.reduce((sum, c) => sum + c.confidence, 0) / processedResponse.citations.length * 100)}%
            </div>
            <div className="text-gray-600">Avg. Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(processedResponse.citations.reduce((sum, c) => sum + c.textSnippet.length, 0) / processedResponse.citations.length)}
            </div>
            <div className="text-gray-600">Avg. Snippet Length</div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewer.isOpen}
        document={documentViewer.document}
        citation={documentViewer.citation}
        allCitations={processedResponse.citations}
        onClose={() => setDocumentViewer({ isOpen: false, document: null, citation: null })}
      />
    </div>
  );
};

export default CitationDemo; 