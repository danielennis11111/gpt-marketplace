// Format prompt content for display with markdown support
const formatPromptContent = (content: string) => {
  if (!content) return '';
  
  // Replace markdown headers with styled elements
  let formattedContent = content
    // Headers
    .replace(/^## (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
    // Bullet points
    .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    // Numbered lists
    .replace(/^\d\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Double line breaks to paragraphs
    .replace(/\n\n/g, '</p><p class="my-2">')
    // Add basic paragraph styling
    .replace(/^([^<].*)/gm, '<p class="my-2">$1</p>');
  
  return formattedContent;
};

// Determine if the content should be shown as formatted HTML
const shouldFormatAsHtml = (content: string) => {
  if (!content) return false;
  
  // Check if content has markdown-like formatting
  return content.includes('##') || 
         content.includes('\n\n') || 
         content.includes('- ') || 
         content.includes('* ') ||
         content.includes('1. ');
};

// Render system instructions section
const renderSystemInstructions = () => {
  if (!idea?.prompt && !idea?.aiSystemInstructions) return null;
  
  const content = idea?.aiSystemInstructions || idea?.prompt || '';
  const shouldFormat = shouldFormatAsHtml(content);
  
  return (
    <div className="bg-white rounded-xl border p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">System Instructions</h2>
      
      {shouldFormat ? (
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatPromptContent(content) }}
        />
      ) : (
        <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">{content}</pre>
      )}
      
      <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
        <button 
          onClick={() => navigator.clipboard.writeText(content)}
          className="text-sm flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-1.5" />
          Copy Instructions
        </button>
        
        <a 
          href="https://platform-beta.aiml.asu.edu/" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700"
        >
          <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-1.5" />
          Use in MyAI Builder
        </a>
      </div>
    </div>
  );
}; 