import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  ShareIcon, 
  ClipboardDocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface IdeaExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: any;
  allIdeas?: any[];
}

const IdeaExportDialog: React.FC<IdeaExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  idea, 
  allIdeas = [] 
}) => {
  const [selectedExportType, setSelectedExportType] = useState<'single' | 'all'>('single');
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  const [includeAnalytics, setIncludeAnalytics] = useState(false);
  const [submitToGitHub, setSubmitToGitHub] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const communityIdeas = allIdeas.length > 0 ? allIdeas : JSON.parse(localStorage.getItem('communityIdeas') || '[]');
  const ideasToExport = selectedExportType === 'single' && idea ? [idea] : communityIdeas;

  const formatIdeaAsMarkdown = (ideaData: any) => {
    return `# ${ideaData.title}

**Category:** ${ideaData.category || 'General'}
**Created:** ${ideaData.createdAt || new Date(ideaData.timestamp || Date.now()).toLocaleDateString()}
**Popularity:** ${ideaData.popularity || ideaData.likes || 0} 
**Author:** ${authorName || 'Anonymous'}

## Description
${ideaData.description || ideaData.idea || 'No description provided'}

## AI System Instructions
\`\`\`
${ideaData.aiSystemInstructions || ideaData.prompt || 'No system instructions available'}
\`\`\`

## Tags
${(ideaData.tags || [ideaData.category]).join(', ')}

## Metadata
- **ID:** ${ideaData.id}
- **Difficulty:** ${ideaData.difficulty || 'Unknown'}
- **Likes:** ${ideaData.likes || 0}
- **Comments:** ${ideaData.comments || 0}
- **Saves:** ${ideaData.saves || 0}

---
*Exported from AI Marketplace - ${new Date().toLocaleDateString()}*
`;
  };

  const formatIdeaAsJSON = (ideaData: any) => {
    const exportData = {
      id: ideaData.id,
      title: ideaData.title,
      description: ideaData.description || ideaData.idea,
      category: ideaData.category || 'General',
      tags: ideaData.tags || [ideaData.category],
      difficulty: ideaData.difficulty,
      aiSystemInstructions: ideaData.aiSystemInstructions || ideaData.prompt,
      createdAt: ideaData.createdAt || new Date(ideaData.timestamp || Date.now()).toISOString(),
      exportedAt: new Date().toISOString(),
      author: authorName || 'Anonymous',
      ...(includeAnalytics && {
        analytics: {
          likes: ideaData.likes || 0,
          comments: ideaData.comments || 0,
          saves: ideaData.saves || 0,
          popularity: ideaData.popularity || 0,
          views: ideaData.views || 0
        }
      })
    };
    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    if (ideasToExport.length === 0) {
      alert('No ideas to export');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    
    if (exportFormat === 'json') {
      const exportData = {
        exported_at: new Date().toISOString(),
        total_ideas: ideasToExport.length,
        export_type: selectedExportType,
        author: authorName || 'Anonymous',
        ideas: ideasToExport.map(ideaData => {
          const formatted = JSON.parse(formatIdeaAsJSON(ideaData));
          return formatted;
        })
      };
      
      const filename = selectedExportType === 'single' 
        ? `idea-${idea?.id || 'unknown'}-${timestamp}.json`
        : `ai-marketplace-ideas-${timestamp}.json`;
      
      downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
    } else {
      if (selectedExportType === 'single') {
        const content = formatIdeaAsMarkdown(idea);
        downloadFile(content, `idea-${idea?.id || 'unknown'}-${timestamp}.md`, 'text/markdown');
      } else {
        const content = `# AI Marketplace Ideas Export

**Exported:** ${new Date().toLocaleDateString()}
**Total Ideas:** ${ideasToExport.length}
**Author:** ${authorName || 'Anonymous'}

---

${ideasToExport.map(ideaData => formatIdeaAsMarkdown(ideaData)).join('\n\n---\n\n')}`;
        
        downloadFile(content, `ai-marketplace-ideas-${timestamp}.md`, 'text/markdown');
      }
    }
  };

  const submitToGitHubRepo = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Create a GitHub Gist instead of a full repository for simplicity
      const ideaContent = selectedExportType === 'single' 
        ? formatIdeaAsMarkdown(idea)
        : `# AI Marketplace Ideas Collection\n\n${ideasToExport.map(ideaData => formatIdeaAsMarkdown(ideaData)).join('\n\n---\n\n')}`;

      const gistData = {
        description: `AI Marketplace Ideas - ${selectedExportType === 'single' ? idea?.title : `${ideasToExport.length} Ideas`} - Shared by ${authorName || 'Anonymous'}`,
        public: true,
        files: {
          [`ai-marketplace-ideas-${Date.now()}.md`]: {
            content: ideaContent
          }
        }
      };

      // Note: This would require a GitHub token for actual submission
      // For now, we'll create a formatted output that users can manually submit
      const githubSubmissionContent = `# GitHub Submission Ready!

## Instructions for sharing your ideas:

1. **Create a GitHub Gist:**
   - Go to https://gist.github.com
   - Paste the content below
   - Make it public
   - Add description: "${gistData.description}"

2. **Or submit to community repository:**
   - Fork: https://github.com/danielennis11111/ai-marketplace-ideas
   - Create a new file in the \`ideas/\` folder
   - Paste the content below
   - Submit a pull request

## Content to Share:

\`\`\`markdown
${ideaContent}
\`\`\`

## JSON Format (Alternative):

\`\`\`json
${JSON.stringify({
  exported_at: new Date().toISOString(),
  total_ideas: ideasToExport.length,
  export_type: selectedExportType,
  author: authorName || 'Anonymous',
  author_email: authorEmail || 'anonymous@example.com',
  ideas: ideasToExport.map(ideaData => JSON.parse(formatIdeaAsJSON(ideaData)))
}, null, 2)}
\`\`\`
`;

      downloadFile(githubSubmissionContent, `github-submission-${Date.now()}.md`, 'text/markdown');
      
      setSubmitResult({
        success: true,
        message: 'GitHub submission file downloaded! Follow the instructions in the file to share your ideas with the community.'
      });

    } catch (error) {
      setSubmitResult({
        success: false,
        message: `Failed to prepare GitHub submission: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    const content = selectedExportType === 'single' 
      ? formatIdeaAsJSON(idea)
      : JSON.stringify({
          exported_at: new Date().toISOString(),
          total_ideas: ideasToExport.length,
          ideas: ideasToExport.map(ideaData => JSON.parse(formatIdeaAsJSON(ideaData)))
        }, null, 2);
    
    navigator.clipboard.writeText(content);
    alert('Ideas copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Export & Share Ideas</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Export Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What to Export
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedExportType('single')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedExportType === 'single'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={!idea}
                >
                  <div className="text-sm font-medium">Single Idea</div>
                  <div className="text-xs text-gray-500">Export this specific idea</div>
                </button>
                <button
                  onClick={() => setSelectedExportType('all')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedExportType === 'all'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">All My Ideas</div>
                  <div className="text-xs text-gray-500">{communityIdeas.length} total ideas</div>
                </button>
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    exportFormat === 'json'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">JSON</div>
                  <div className="text-xs text-gray-500">Machine-readable format</div>
                </button>
                <button
                  onClick={() => setExportFormat('markdown')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    exportFormat === 'markdown'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">Markdown</div>
                  <div className="text-xs text-gray-500">Human-readable format</div>
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAnalytics"
                  checked={includeAnalytics}
                  onChange={(e) => setIncludeAnalytics(e.target.checked)}
                  className="mr-3"
                />
                <label htmlFor="includeAnalytics" className="text-sm text-gray-700">
                  Include analytics data (likes, views, popularity)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="submitToGitHub"
                  checked={submitToGitHub}
                  onChange={(e) => setSubmitToGitHub(e.target.checked)}
                  className="mr-3"
                />
                <label htmlFor="submitToGitHub" className="text-sm text-gray-700">
                  Prepare for GitHub community sharing
                </label>
              </div>
            </div>

            {/* Author Information */}
            {submitToGitHub && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-blue-900">Author Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Your email (optional)"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-blue-700">
                  This information will be included with your submission to give you credit for your ideas.
                </p>
              </div>
            )}

            {/* Submit Result */}
            {submitResult && (
              <div className={`p-4 rounded-lg ${
                submitResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {submitResult.success ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <span className={`text-sm ${
                    submitResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {submitResult.message}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                Download {exportFormat.toUpperCase()}
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                Copy to Clipboard
              </button>

              {submitToGitHub && (
                <button
                  onClick={submitToGitHubRepo}
                  disabled={isSubmitting || !authorName.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShareIcon className="w-4 h-4" />
                  {isSubmitting ? 'Preparing...' : 'Prepare GitHub Submission'}
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 pt-2">
              <p>💡 <strong>Tip:</strong> Exported ideas can be imported into other AI Marketplace instances or shared with the community.</p>
              {submitToGitHub && (
                <p className="mt-1">🌟 <strong>Community Sharing:</strong> Your ideas will help other users get inspired and build amazing AI projects!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdeaExportDialog; 